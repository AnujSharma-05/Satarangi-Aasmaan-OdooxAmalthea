# File: backend/app/api/v1/endpoints/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db import session
from app.core import security
from app.crud import crud_user
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from app.api.v1.schemas import schemas

router = APIRouter()

@router.post("/login/token", response_model=schemas.Token)
def login_for_access_token(
    # FIX: Reordered the arguments
    request_data: schemas.TokenRequest,
    db: Session = Depends(session.get_db)
):
    user = crud_user.get_user_by_email(db, email=request_data.username)
    if not user or not security.verify_password(request_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}