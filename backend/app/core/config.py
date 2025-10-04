# File: backend/app/core/config.py

import os
from dotenv import load_dotenv

# Load environment variables from the .env file in the project root
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL set for the connection")