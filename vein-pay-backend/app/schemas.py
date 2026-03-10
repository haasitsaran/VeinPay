from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from .models import UserRole

class LoginRequest(BaseModel):
    username: str
    password: str
    # Removed role here because OAuth2PasswordRequestForm doesn't provide it

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole

class ScanRequest(BaseModel):
    image: str
    mode: Optional[str] = "camera"

class ScanResponse(BaseModel):
    match: bool
    feature_hash: str
    ott: Optional[str] = None
    similarity: Optional[float] = None
    enrolled: Optional[bool] = None

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: UserRole
    business_name: Optional[str] = None 
    palm_image: Optional[str] = None

class RegisterResponse(BaseModel):
    username: str
    role: UserRole
    enrolled: bool

class BillItem(BaseModel):
    name: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)

class BillCreateRequest(BaseModel):
    items: List[BillItem]

class BillResponse(BaseModel):
    items: List[BillItem]
    total_amount: float

class PaymentRequest(BaseModel):
    amount: float
    biometric_token: str

class PaymentResponse(BaseModel):
    ott: str
    amount: float
    status: str

class DailyAnalytics(BaseModel):
    date: datetime
    revenue: float
    transactions: int

class MonthlyAnalytics(BaseModel):
    month: str
    revenue: float
    transactions: int

class AnalyticsResponse(BaseModel):
    daily: List[DailyAnalytics]
    monthly: List[MonthlyAnalytics]

class AccountSummaryResponse(BaseModel):
    balance: float
    monthly_expenses: float