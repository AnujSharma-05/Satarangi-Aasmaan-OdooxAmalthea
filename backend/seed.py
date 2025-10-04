# File: backend/seed.py

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db import base as models
from app.core.security import get_password_hash
from datetime import date

def seed_db():
    db: Session = SessionLocal()
    try:
        print("Starting database seeding...")

        # 1. Create Company
        company = db.query(models.Company).filter(models.Company.name == "InnovateCorp").first()
        if not company:
            company = models.Company(name="InnovateCorp", base_currency="USD")
            db.add(company)
            db.commit()
            db.refresh(company)
            print(f"-> Created Company: {company.name}")

        # 2. Create Users in a Hierarchy
        users_to_create = {
            "ada.admin@innovate.com": {"role": models.UserRole.admin, "manager_email": None},
            "charlie.director@innovate.com": {"role": models.UserRole.employee, "manager_email": None},
            "bob.manager@innovate.com": {"role": models.UserRole.employee, "manager_email": "charlie.director@innovate.com"},
            "eve.finance@innovate.com": {"role": models.UserRole.employee, "manager_email": "charlie.director@innovate.com"},
            "alice.employee@innovate.com": {"role": models.UserRole.employee, "manager_email": "bob.manager@innovate.com"},
            "david.employee@innovate.com": {"role": models.UserRole.employee, "manager_email": "bob.manager@innovate.com"},
        }

        password = "password123"
        hashed_password = get_password_hash(password)
        created_users = {}

        for email, details in users_to_create.items():
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                manager_id = None
                if details["manager_email"]:
                    manager = created_users.get(details["manager_email"])
                    if manager:
                        manager_id = manager.id

                user = models.User(
                    company_id=company.id,
                    email=email,
                    password_hash=hashed_password,
                    role=details["role"],
                    manager_id=manager_id
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"-> Created User: {email}")
            created_users[email] = user
        
        # 3. Create a default Approval Workflow
        workflow = db.query(models.ApprovalWorkflow).filter(models.ApprovalWorkflow.name == "Standard Expenses").first()
        if not workflow:
            workflow = models.ApprovalWorkflow(
                company_id=company.id,
                name="Standard Expenses",
                is_manager_first_approver=True
            )
            db.add(workflow)
            db.commit()
            db.refresh(workflow)
            print("-> Created Workflow: Standard Expenses")

        # 4. Create Expenses for different users
        expenses_to_create = [
            # Expense from Alice for Bob to approve
            {"employee": "alice.employee@innovate.com", "desc": "Team Lunch at The Cafe", "amount": 120.50, "status": models.ExpenseStatus.pending_approval},
            # Expense from Bob for Charlie to approve
            {"employee": "bob.manager@innovate.com", "desc": "Client Dinner Meeting", "amount": 250.00, "status": models.ExpenseStatus.pending_approval},
            # Expense from Eve for Charlie to approve
            {"employee": "eve.finance@innovate.com", "desc": "Financial Conference Ticket", "amount": 800.00, "status": models.ExpenseStatus.pending_approval},
            # Already completed expenses
            {"employee": "david.employee@innovate.com", "desc": "Software Subscription (Annual)", "amount": 99.00, "status": models.ExpenseStatus.approved},
            {"employee": "alice.employee@innovate.com", "desc": "Office Stationery", "amount": 45.75, "status": models.ExpenseStatus.rejected},
        ]

        # Clear existing expenses to avoid duplicates on re-seeding
        db.query(models.Expense).delete()
        db.commit()

        for exp_data in expenses_to_create:
            employee = created_users.get(exp_data["employee"])
            if employee:
                expense = models.Expense(
                    employee_id=employee.id,
                    company_id=company.id,
                    workflow_id=workflow.id,
                    description=exp_data["desc"],
                    amount=exp_data["amount"],
                    currency="USD",
                    category="General",
                    expense_date=date.today(),
                    status=exp_data["status"]
                )
                db.add(expense)
        
        db.commit()
        print(f"-> Created {len(expenses_to_create)} new expense records.")
        
        print("\n--- ✅ Seeding Complete! ---")
        print("\n--- Test Credentials ---")
        for email in users_to_create:
            print(f"Email: {email}")
        print(f"Password (for all): {password}")
        print("------------------------\n")

    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()