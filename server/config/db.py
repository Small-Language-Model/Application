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
billing_collection: AsyncIOMotorCollection | None = None
chat_history_collection: AsyncIOMotorCollection | None = None
password_reset_collection: AsyncIOMotorCollection | None = None

async def connect_to_db() -> None:
	global client, database, users_collection, otp_collection, billing_collection, chat_history_collection, password_reset_collection

	if client is not None:
		return

	try:
		client = AsyncIOMotorClient(MONGODB_URI)
		await client.admin.command("ping")
		database = client[DATABASE_NAME]
		users_collection = database["users"]
		otp_collection = database["otps"]
		billing_collection = database["billing"]
		chat_history_collection = database["chat_history"]
		password_reset_collection = database["password_resets"]
		await otp_collection.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
		await password_reset_collection.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
		await users_collection.create_index([("email", ASCENDING)], unique=True)
		await users_collection.create_index([("id", ASCENDING)], unique=True)
		await billing_collection.create_index([("user_id", ASCENDING)])
		await billing_collection.create_index([("order_id", ASCENDING)], unique=True)
		await chat_history_collection.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
		print(f"Database connected: {DATABASE_NAME}")
	except PyMongoError as error:
		print(f"Database connection failed: {error}")
		raise


async def close_db_connection() -> None:
	global client, database, users_collection, otp_collection, billing_collection, chat_history_collection, password_reset_collection

	if client is not None:
		client.close()
		print("Database connection closed")
	client = None
	database = None
	users_collection = None
	otp_collection = None
	billing_collection = None
	chat_history_collection = None
	password_reset_collection = None


def get_users_collection() -> AsyncIOMotorCollection:
	if users_collection is None:
		raise RuntimeError("Database is not connected")
	return users_collection


def get_otp_collection() -> AsyncIOMotorCollection:
	if otp_collection is None:
		raise RuntimeError("Database is not connected")
	return otp_collection


def get_billing_collection() -> AsyncIOMotorCollection:
	if billing_collection is None:
		raise RuntimeError("Database is not connected")
	return billing_collection


def get_chat_history_collection() -> AsyncIOMotorCollection:
	if chat_history_collection is None:
		raise RuntimeError("Database is not connected")
	return chat_history_collection


def get_password_reset_collection() -> AsyncIOMotorCollection:
	if password_reset_collection is None:
		raise RuntimeError("Database is not connected")
	return password_reset_collection
