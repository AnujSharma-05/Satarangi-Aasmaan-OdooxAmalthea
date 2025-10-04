# File: backend/app/db/base.py

import uuid
import enum
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Boolean,
    Integer,
    Text,
    ForeignKey,
    DateTime,
    Date,
    Enum,
    Numeric,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from app.core.config import DATABASE_URL

# Base class for our models
Base = declarative_base()

# Define ENUM types for roles and statuses
class UserRole(str, enum.Enum):
    admin = "admin"
    employee = "employee"

class ExpenseStatus(str, enum.Enum):
    draft = "draft"
    pending_approval = "pending_approval"
    approved = "approved"
    rejected = "rejected"

class ApprovalStatus(str, enum.Enum):
    approved = "approved"
    rejected = "rejected"

# --- Model Definitions ---

class Company(Base):
    __tablename__ = "companies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    base_currency = Column(String(3), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.employee)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    company = relationship("Company")
    manager = relationship("User", remote_side=[id]) # Self-referencing relationship

class ApprovalWorkflow(Base):
    __tablename__ = "approval_workflows"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    is_manager_first_approver = Column(Boolean, nullable=False, default=True)
    min_approval_percentage = Column(Integer, nullable=True)
    special_approver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    company = relationship("Company")
    special_approver = relationship("User")

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("approval_workflows.id"), nullable=False)
    approver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    is_required = Column(Boolean, nullable=False, default=False)

    workflow = relationship("ApprovalWorkflow")
    approver = relationship("User")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("approval_workflows.id"), nullable=False)
    description = Column(Text, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    category = Column(String(100), nullable=True)
    expense_date = Column(Date, nullable=False)
    status = Column(Enum(ExpenseStatus), nullable=False, default=ExpenseStatus.draft)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    employee = relationship("User")
    company = relationship("Company")
    workflow = relationship("ApprovalWorkflow")
    receipts = relationship("Receipt", back_populates="expense")

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expense_id = Column(UUID(as_uuid=True), ForeignKey("expenses.id"), nullable=False)
    file_url = Column(String(512), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    expense = relationship("Expense", back_populates="receipts")

class ExpenseApproval(Base):
    __tablename__ = "expense_approvals"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expense_id = Column(UUID(as_uuid=True), ForeignKey("expenses.id"), nullable=False)
    approver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ApprovalStatus), nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    expense = relationship("Expense")
    approver = relationship("User")

# --- Database Engine Setup ---
engine = create_engine(DATABASE_URL)

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")