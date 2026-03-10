from datetime import datetime, timedelta
import json
import secrets
from typing import List

import numpy as np
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .ai_logic import cosine_similarity, embedding_from_base64
from .database import engine, get_db
from .models import Transaction, User, UserRole
from .security import (
    create_access_token,
    derive_aes_key_from_vector,
    encrypt_transaction_data,
    decrypt_transaction_data,
    get_current_user,
)


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="VeinPay Backend")

def _ensure_sqlite_schema(db: Session) -> None:
    # Lightweight dev-time migration to prevent 500s/hangs after model changes.
    cols = {
        row[1] for row in db.execute(text("PRAGMA table_info(users)")).fetchall()
    }
    if "password" not in cols:
        db.execute(text("ALTER TABLE users ADD COLUMN password VARCHAR"))
    if "palm_signature" not in cols:
        db.execute(text("ALTER TABLE users ADD COLUMN palm_signature TEXT"))
    if "business_name" not in cols:
        db.execute(text("ALTER TABLE users ADD COLUMN business_name VARCHAR"))
    if "role" not in cols:
        db.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR"))
    if "biometric_template" not in cols:
        db.execute(text("ALTER TABLE users ADD COLUMN biometric_template BLOB"))
    db.commit()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "veinpay-backend"}


# ... (keep existing imports)

@app.post("/register", response_model=schemas.RegisterResponse)
def register_user(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    _ensure_sqlite_schema(db)
    # Check if user exists
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Use the Enum value directly from the payload
    role = payload.role

    palm_signature_str = None
    biometric_template_bytes = None
    
    # Logic for Biometric Enrollment (Personal Only)
    if role == UserRole.PERSONAL:
        if not payload.palm_image:
            raise HTTPException(
                status_code=400,
                detail="palm_image is required for PERSONAL accounts",
            )
        
        # Biometric Pipeline: Base64 -> Embedding -> AES Key -> Encrypted Template
        embedding = embedding_from_base64(payload.palm_image)
        feature_vector = embedding.astype("float32").tolist()
        biometric_template_bytes = embedding.astype("float32").tobytes()
        key = derive_aes_key_from_vector(feature_vector)
        
        # Store encrypted vector for BEKD security
        encrypted_payload = encrypt_transaction_data({"embedding": feature_vector}, key)
        palm_signature_str = json.dumps(encrypted_payload)

    # Create User Object
    new_user = User(
        username=payload.username,
        # Password should be hashed in production! 
        password=payload.password, 
        business_name=payload.business_name if role == UserRole.BUSINESS else None,
        role=role.value,
        balance=1000.0 if role == UserRole.PERSONAL else 0.0,
        monthly_expenses=0.0,
        biometric_template=biometric_template_bytes,
        palm_signature=palm_signature_str,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return schemas.RegisterResponse(
        username=new_user.username, 
        role=UserRole(new_user.role),
        enrolled=(palm_signature_str is not None)
    )

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    _ensure_sqlite_schema(db)
    # 1. Look for user in DB
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # 2. Hardcoded bypass for your specific demo credentials
    if not user and form_data.username == "23211A0524" and form_data.password == "12345678":
        user = User(
            username=form_data.username,
            role=UserRole.PERSONAL.value,
            balance=1000.0,
            monthly_expenses=0.0,
            password=form_data.password,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 3. Validate Password
    if not user or user.password != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # 4. Generate JWT with Role for Frontend Routing
    access_token = create_access_token(
        {"sub": str(user.id), "id": user.id, "username": user.username, "role": user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "id": user.id,
    }




@app.post("/process-scan", response_model=schemas.ScanResponse)
def process_scan(
    payload: schemas.ScanRequest,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user_id = int(current["sub"])
    user: User | None = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    embedding = embedding_from_base64(payload.image)  # shape (128,)
    feature_vector = embedding.astype("float32").tolist()
    key = derive_aes_key_from_vector(feature_vector)
    feature_hash = key.hex()

    mode = (payload.mode or "camera").strip().lower()
    if mode in {"enroll", "register"}:
        # Re-enrollment: overwrite stored palm signature and biometric_template using current biometric
        encrypted_payload = encrypt_transaction_data({"embedding": feature_vector}, key)
        user.palm_signature = json.dumps(encrypted_payload)
        user.biometric_template = embedding.astype("float32").tobytes()
        db.add(user)
        db.commit()
        return schemas.ScanResponse(
            match=True, feature_hash=feature_hash, enrolled=True, similarity=1.0
        )

    stored_embedding: np.ndarray | None = None
    if user.biometric_template:
        try:
            stored_embedding = np.frombuffer(user.biometric_template, dtype="float32")
        except Exception:
            stored_embedding = None

    # Backward compatibility: if older rows don't have biometric_template, fall back to decrypting palm_signature
    if stored_embedding is None:
        if not user.palm_signature:
            raise HTTPException(
                status_code=400,
                detail="No stored palm signature. Register or enroll first.",
            )

        # Decrypt stored palm signature with key derived from live embedding
        try:
            stored_payload = json.loads(user.palm_signature)
            decrypted = decrypt_transaction_data(stored_payload, key)
            stored_vector = decrypted.get("embedding")
            if not isinstance(stored_vector, list):
                raise ValueError("Invalid stored embedding")
            stored_embedding = np.asarray(stored_vector, dtype="float32")
        except Exception:
            raise HTTPException(
                status_code=400, detail="Failed to decrypt stored palm signature"
            )
    similarity = cosine_similarity(embedding, stored_embedding)

    threshold = 0.85
    match = similarity >= threshold
    ott = None
    if match:
        # BEKD-style: derive key from embedding and initialize AES block by encrypting a small payload.
        encrypt_transaction_data(
            {"user_id": user_id, "ts": datetime.utcnow().isoformat()},
            key,
        )
        ott = secrets.token_urlsafe(24)

    return schemas.ScanResponse(
        match=match, feature_hash=feature_hash, ott=ott, similarity=similarity
    )


@app.post("/billing", response_model=schemas.BillResponse)
def create_bill(
    payload: schemas.BillCreateRequest,
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    total = sum(item.quantity * item.unit_price for item in payload.items)

    user_id = int(current["sub"])
    user: User | None = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    tx = Transaction(user_id=user.id, amount=total, description="Bill payment")
    db.add(tx)

    if user.role == UserRole.PERSONAL.value:
        user.balance -= total
        user.monthly_expenses += total

    db.commit()
    return schemas.BillResponse(items=payload.items, total_amount=total)


@app.post("/payment", response_model=schemas.PaymentResponse)
def confirm_payment(
    payload: schemas.PaymentRequest,
    current=Depends(get_current_user),
):
    # Here we assume that biometric_token is a feature_hash that we can turn back into a key.
    try:
        key = bytes.fromhex(payload.biometric_token)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid biometric token")

    encrypted = encrypt_transaction_data(
        {"user_id": current["sub"], "amount": payload.amount, "ts": datetime.utcnow().isoformat()},
        key,
    )
    # Stub for payment gateway OTT generation: use part of ciphertext + randomness
    ott = encrypted["ciphertext"][:16]
    return schemas.PaymentResponse(ott=ott, amount=payload.amount, status="APPROVED")


@app.get("/analytics", response_model=schemas.AnalyticsResponse)
def analytics(db: Session = Depends(get_db)):
    # Daily analytics for last 30 days
    now = datetime.utcnow()
    thirty_days_ago = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30)

    daily_rows = (
        db.query(
            func.date(Transaction.created_at).label("date"),
            func.sum(Transaction.amount).label("revenue"),
            func.count(Transaction.id).label("transactions"),
        )
        .filter(Transaction.created_at >= thirty_days_ago)
        .group_by(func.date(Transaction.created_at))
        .all()
    )

    daily: List[schemas.DailyAnalytics] = [
        schemas.DailyAnalytics(
            date=row.date,
            revenue=row.revenue or 0.0,
            transactions=row.transactions or 0,
        )
        for row in daily_rows
    ]

    # Monthly analytics for current year
    monthly_rows = (
        db.query(
            func.strftime("%Y-%m", Transaction.created_at).label("month"),
            func.sum(Transaction.amount).label("revenue"),
            func.count(Transaction.id).label("transactions"),
        )
        .group_by(func.strftime("%Y-%m", Transaction.created_at))
        .all()
    )

    monthly: List[schemas.MonthlyAnalytics] = [
        schemas.MonthlyAnalytics(
            month=row.month,
            revenue=row.revenue or 0.0,
            transactions=row.transactions or 0,
        )
        for row in monthly_rows
    ]

    return schemas.AnalyticsResponse(daily=daily, monthly=monthly)


@app.get("/personal/summary", response_model=schemas.AccountSummaryResponse)
def account_summary(
    db: Session = Depends(get_db),
    current=Depends(get_current_user),
):
    user_id = int(current["sub"])
    user: User | None = db.query(User).get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.AccountSummaryResponse(
        balance=user.balance, monthly_expenses=user.monthly_expenses
    )

