import os

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from pymongo import ASCENDING
from pymongo.errors import PyMongoError
from dotenv import load_dotenv


load_dotenv()


MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "slmApplication")

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None
users_collection: AsyncIOMotorCollection | None = None
otp_collection: AsyncIOMotorCollection | None = None

async def connect_to_db() -> None:
	global client, database, users_collection, otp_collection

	if client is not None:
		return

	try:
		client = AsyncIOMotorClient(MONGODB_URI)
		await client.admin.command("ping")
		database = client[DATABASE_NAME]
		users_collection = database["users"]
		otp_collection = database["otps"]
		await otp_collection.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
		print(f"Database connected: {DATABASE_NAME}")
	except PyMongoError as error:
		print(f"Database connection failed: {error}")
		raise


async def close_db_connection() -> None:
	global client, database, users_collection, otp_collection

	if client is not None:
		client.close()
		print("Database connection closed")
	client = None
	database = None
	users_collection = None
	otp_collection = None


def get_users_collection() -> AsyncIOMotorCollection:
	if users_collection is None:
		raise RuntimeError("Database is not connected")
	return users_collection


def get_otp_collection() -> AsyncIOMotorCollection:
	if otp_collection is None:
		raise RuntimeError("Database is not connected")
	return otp_collection
