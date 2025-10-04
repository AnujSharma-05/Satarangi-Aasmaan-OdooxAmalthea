# File: backend/app/core/config.py

import os
from dotenv import load_dotenv

# Load environment variables from the .env file in the project root
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

SECRET_KEY = "your-super-secret-key"  # CHANGE THIS
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL set for the connection")