# File: backend/app/api/v1/schemas/schemas.py

import uuid
from pydantic import BaseModel, EmailStr
from datetime import date
from decimal import Decimal
from typing import Optional

# --- Company Schemas ---
class CompanyBase(BaseModel):
    name: str
    base_currency: str

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: uuid.UUID

    class Config:
        orm_mode = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    company_id: uuid.UUID
    manager_id: Optional[uuid.UUID] = None

class User(UserBase):
    id: uuid.UUID
    company_id: uuid.UUID
    is_admin: bool

    class Config:
        orm_mode = True

# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    description: str
    amount: Decimal
    currency: str
    category: Optional[str] = None
    expense_date: date

class ExpenseCreate(ExpenseBase):
    workflow_id: uuid.UUID # Must be assigned on creation

class Expense(ExpenseBase):
    id: uuid.UUID
    employee_id: uuid.UUID
    status: str

    class Config:
        orm_mode = True


# --- Token / Auth Schemas ---
class TokenRequest(BaseModel):
    username: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str