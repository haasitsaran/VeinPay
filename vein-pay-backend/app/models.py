from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


class UserRole(str, Enum):
    PERSONAL = "personal"
    BUSINESS = "business"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    business_name = Column(String, nullable=True)
    # Store role as string to avoid SQLite Enum constraint drift during dev.
    role = Column(String, nullable=False)
    balance = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    # Stored biometric template embedding (raw bytes of float32 vector)
    biometric_template = Column(LargeBinary, nullable=True)
    # Encrypted palm signature (AES-256 payload as JSON string)
    palm_signature = Column(Text, nullable=True)

    transactions = relationship("Transaction", back_populates="user")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    description = Column(String, nullable=True)

    user = relationship("User", back_populates="transactions")

