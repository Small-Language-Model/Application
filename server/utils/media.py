import os
from urllib.parse import quote

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv


load_dotenv()


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def get_default_profile_image_url(seed: str) -> str:
    return f"https://api.dicebear.com/9.x/personas/svg?seed={quote(seed)}"


def upload_image_to_cloudinary(file_bytes: bytes, folder: str = "profiles") -> dict:
    result = cloudinary.uploader.upload(file_bytes, folder=folder, resource_type="image")
    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
    }


def delete_image_from_cloudinary(public_id: str) -> None:
    if not public_id:
        return
    cloudinary.uploader.destroy(public_id)
