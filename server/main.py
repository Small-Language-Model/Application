from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.auth import router as auth_router
from config.db import connect_to_db, close_db_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_db()
    yield
    await close_db_connection()

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])

@app.get("/")
def default():
    return {"message": "Server is running"}