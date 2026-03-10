from datetime import datetime, timedelta
from typing import Any, Dict, List

import base64
import os

from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt


SECRET_KEY = os.getenv("VEINPAY_JWT_SECRET", "super-secret-veinpay-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def create_access_token(data: Dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user_payload(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if "sub" not in payload:
            raise credentials_exception
        # Ensure role is present and normalized (PERSONAL/BUSINESS)
        role = payload.get("role")
        if role is None:
            raise credentials_exception
        payload["role"] = str(role).upper()
        return payload
    except JWTError:
        raise credentials_exception


def get_current_user(token_payload: Dict[str, Any] = Depends(get_current_user_payload)) -> Dict[str, Any]:
    """
    Compatibility dependency used by endpoints.
    Returns: { sub, username, role, ... }
    """
    return token_payload


def derive_aes_key_from_vector(vector: List[float]) -> bytes:
    """
    Deterministically derive a 256-bit AES key from a biometric feature vector
    using SHA-256.
    """
    # Stable serialization: float32 little-endian bytes
    import struct

    packed = b"".join(struct.pack("<f", float(v)) for v in vector)
    h = SHA256.new()
    h.update(packed)
    return h.digest()


def encrypt_transaction_data(data: Dict[str, Any], key: bytes) -> Dict[str, str]:
    """
    Encrypt arbitrary transaction data using AES-256-GCM.
    Returns base64-encoded nonce, ciphertext, and tag.
    """
    cipher = AES.new(key, AES.MODE_GCM)
    nonce = cipher.nonce
    plaintext = str(data).encode("utf-8")
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return {
        "nonce": base64.b64encode(nonce).decode("utf-8"),
        "ciphertext": base64.b64encode(ciphertext).decode("utf-8"),
        "tag": base64.b64encode(tag).decode("utf-8"),
    }


def decrypt_transaction_data(payload: Dict[str, str], key: bytes) -> Dict[str, Any]:
    nonce = base64.b64decode(payload["nonce"])
    ciphertext = base64.b64decode(payload["ciphertext"])
    tag = base64.b64decode(payload["tag"])
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    # For this demo we simply eval back to dict; in production use JSON.
    return eval(plaintext.decode("utf-8"))

