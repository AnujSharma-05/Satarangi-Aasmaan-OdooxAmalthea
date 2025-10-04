from fastapi import FastAPI
from app.api.v1.endpoints.utils import router as utils_router

app = FastAPI(title="Signet API")
app.include_router(utils_router)
# Signet: A signet ring was used to stamp and authorize documents. This name has a classic,
# authoritative feel that relates directly to the approval process.