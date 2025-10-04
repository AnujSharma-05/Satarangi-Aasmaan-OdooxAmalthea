# File: backend/app/crud/crud_expense.py

from sqlalchemy.orm import Session
import uuid
from app.db import base as models
from app.api.v1.schemas import schemas

def create_expense(db: Session, expense: schemas.ExpenseCreate, employee_id: uuid.UUID):
    """
    Creates a new expense record for a given employee.
    The initial status is 'pending_approval' as it immediately enters the workflow.
    """
    employee = db.query(models.User).filter(models.User.id == employee_id).first()
    if not employee:
        return None

    db_expense = models.Expense(
        **expense.dict(),
        employee_id=employee_id,
        company_id=employee.company_id,
        status=models.ExpenseStatus.pending_approval
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expenses_by_employee(db: Session, employee_id: uuid.UUID):
    """
    Retrieves all expenses submitted by a specific employee.
    """
    return db.query(models.Expense).filter(models.Expense.employee_id == employee_id).all()

def get_expenses_for_manager_approval(db: Session, manager_id: uuid.UUID):
    """
    This is a key function. It finds all expenses that are:
    1. In 'pending_approval' status.
    2. Submitted by employees who report directly to this manager.
    """
    # Subquery to find all employees managed by this manager
    subordinate_ids = db.query(models.User.id).filter(models.User.manager_id == manager_id)

    return (
        db.query(models.Expense)
        .filter(
            models.Expense.employee_id.in_(subordinate_ids),
            models.Expense.status == models.ExpenseStatus.pending_approval,
        )
        .all()
    )

def update_expense_status(db: Session, expense_id: uuid.UUID, status: models.ExpenseStatus):
    """
    Updates the status of an expense (e.g., to 'approved' or 'rejected').
    """
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if db_expense:
        db_expense.status = status
        db.commit()
        db.refresh(db_expense)
    return db_expense