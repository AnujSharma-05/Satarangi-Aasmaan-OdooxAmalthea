# File: backend/app/api/v1/endpoints/manager.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db import session, base as models
from app.api.v1 import dependencies
from app.crud import crud_expense
from app.api.v1.schemas import schemas

router = APIRouter()

@router.get("/approvals", response_model=List[schemas.Expense])
def get_pending_approvals(
    db: Session = Depends(session.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    Get all expenses waiting for the current manager's approval.
    """
    return crud_expense.get_expenses_for_manager_approval(db, manager_id=current_user.id)

# Note: The logic for multi-step approvals would be more complex.
# This is a simplified version for the direct manager.
@router.post("/approvals/{expense_id}/status")
def update_approval_status(
    expense_id: uuid.UUID,
    # Here you would have a schema for status updates, e.g., with comments
    # For now, we'll use a simple query parameter.
    approved: bool,
    db: Session = Depends(session.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    Approve or reject an expense.
    """
    # A more robust check would ensure this manager is in the correct step
    # of the approval workflow for this specific expense.
    new_status = models.ExpenseStatus.approved if approved else models.ExpenseStatus.rejected
    updated_expense = crud_expense.update_expense_status(db, expense_id=expense_id, status=new_status)
    if not updated_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return {"message": f"Expense status updated to {new_status.value}"}