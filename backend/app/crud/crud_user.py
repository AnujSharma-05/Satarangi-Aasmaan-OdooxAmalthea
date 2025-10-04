# File: backend/app/crud/crud_user.py

from sqlalchemy.orm import Session
from app.db import base as models
from app.api.v1.schemas import schemas
from app.core.security import get_password_hash

def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        company_id=user.company_id,
        manager_id=user.manager_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user