from fastapi import FastAPI
from app.api.v1.endpoints.utils import router as utils_router

app = FastAPI(title="Satarangi Aasmaan API")
app.include_router(utils_router)
