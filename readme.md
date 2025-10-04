# Satarangi Aasmaan - Expense Management (Odoo x Amalthea Hackathon)

## 🚩 Problem Statement

Companies often struggle with manual expense reimbursement processes that are time-consuming, error-prone, and lack transparency. There is no simple way to:
- Define approval flows based on thresholds.
- Manage multi-level approvals.
- Support flexible and conditional approval rules.

Our solution, Satarangi Aasmaan, addresses these pain points with a modern, full-stack application.

---

## 🛠️ Projected Tech Stack

- **Frontend:** React (Vite) - A fast and responsive user interface.
- **Backend:** FastAPI (Python) - A high-performance, asynchronous API framework.
- **Database:** PostgreSQL - A robust and reliable relational database.
- **ORM:** SQLAlchemy - For elegant and powerful database interactions in Python.
- **Authentication:** JWT (JSON Web Tokens) for secure, stateless sessions.
- **APIs Consumed:**
  - [restcountries.com](https://restcountries.com/): For mapping countries to their currencies on signup.
  - [exchangerate-api.com](https://www.exchangerate-api.com/): For real-time currency conversions.

---

## 📖 Project Overview

Satarangi Aasmaan is an expense management system designed to streamline and automate the expense reimbursement process within companies. It supports multi-level approval workflows, conditional approval rules, and real-time currency conversions to accommodate global teams.

---

## ✨ Features

- User authentication and role-based access (Admin, Manager, Employee).
- Multi-level and conditional approval workflows.
- Expense submission with draft and approval statuses.
- Real-time currency conversion based on company base currency.
- Upload and OCR simulation for expense receipts.
- Admin dashboard for user and approval rule management.
- Manager dashboard for approval queue and team expenses.
- Employee dashboard for personal expense management.

---

## 🏗️ Architecture

- **Frontend:** Built with React and Vite for fast development and optimized performance.
- **Backend:** FastAPI serving RESTful APIs with SQLAlchemy ORM for database interactions.
- **Database:** PostgreSQL stores users, expenses, approval rules, and related data.
- **Authentication:** JWT tokens secure API endpoints.
- **External APIs:** Used for country and currency data integration.

---

## 🚀 Setup and Installation

### Backend

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Configure environment variables as needed (e.g., database URL, JWT secret).
4. Run the backend server:
   ```bash
   uvicorn backend.main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser at the URL shown in the terminal (usually http://localhost:3000).

---

## 🧑‍💻 Usage

- Sign up as an Admin to set up your company and base currency.
- Admins can create users and define approval rules.
- Employees can submit expenses and track their status.
- Managers can approve or reject expenses in their queue.
- Admins can override expense statuses and manage users.

---

## 📡 API Endpoints (Summary)

- `/api/v1/auth` - Authentication endpoints (login, signup).
- `/api/v1/expenses` - Employee expense management.
- `/api/v1/manager` - Manager approval workflows.
- `/api/v1/admin` - Admin user and rule management.
- `/api/v1/utils` - Utility endpoints.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit pull requests for bug fixes, features, or improvements.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Anuj Sharma** - [GitHub Profile](https://github.com/AnujSharma-05)
- **Jayneel Mahiwal** - [GitHub Profile](https://github.com/Hyper099)
- **Meet Jain** - [GitHub Profile](https://github.com/MeetJain05)
- **Vedesh Pandya** - [GitHub Profile](https://github.com/VedeshP)

---

## 📞 Contact

For questions or support, please reach out to the team via GitHub profiles above.
