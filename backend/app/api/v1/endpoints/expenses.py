# File: backend/app/api/v1/endpoints/expenses.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import session, base as models
from app.api.v1 import dependencies
from app.crud import crud_expense
from app.api.v1.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Expense])
def read_employee_expenses(
    db: Session = Depends(session.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    Get all expenses submitted by the currently logged-in user.
    """
    return crud_expense.get_expenses_by_employee(db, employee_id=current_user.id)

@router.post("/", response_model=schemas.Expense, status_code=201)
def create_new_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(session.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    Submit a new expense.
    """
    return crud_expense.create_expense(db=db, expense=expense, employee_id=current_user.id)