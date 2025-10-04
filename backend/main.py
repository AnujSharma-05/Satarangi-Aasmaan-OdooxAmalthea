# File: backend/main.py

from fastapi import FastAPI
from app.api.v1.endpoints import auth, expenses, manager, admin

app = FastAPI(title="Expense Management API")

# Include routers with prefixes and tags
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(expenses.router, prefix="/api/v1/expenses", tags=["Expenses (Employee)"])
app.include_router(manager.router, prefix="/api/v1/manager", tags=["Manager"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the Expense Management API"}

# from fastapi import FastAPI
# from app.api.v1.endpoints.utils import router as utils_router

# app = FastAPI(title="Signet API")
# app.include_router(utils_router)
# # Signet: A signet ring was used to stamp and authorize documents. This name has a classic,
# # authoritative feel that relates directly to the approval process.