from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.auth import router as auth_router
from api.billing import router as billing_router
from api.inference import router as inference_router
from config.db import connect_to_db, close_db_connection
from utils.inference import inference_service
from utils.token_manager import grant_daily_tokens_to_all_users

scheduler = AsyncIOScheduler()
scheduler.add_job(
    grant_daily_tokens_to_all_users,
    CronTrigger(hour=0, minute=0),
    id="daily_token_topup",
    replace_existing=True,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_db()
    await grant_daily_tokens_to_all_users()
    scheduler.start()
    inference_service.load()
    yield
    scheduler.shutdown(wait=False)
    await close_db_connection()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(billing_router, prefix="/billing", tags=["Billing"])
app.include_router(inference_router, prefix="/inference", tags=["Inference"])

@app.get("/")
def default():
    return {"message": "Server is running"}