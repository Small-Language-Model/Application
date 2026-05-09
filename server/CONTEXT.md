# Server Context

## Overview

This is a FastAPI backend for authentication and user profile operations.

- Framework: FastAPI
- Database: MongoDB (Motor async driver)
- Auth: JWT + password hashing
- Media: Cloudinary (optional profile image upload)
- OTP: email-based verification flow

## Entry Points

- `main.py` -> FastAPI app, lifespan DB connect/disconnect, CORS config
- `api/auth.py` -> auth and user endpoints
- `config/db.py` -> MongoDB connection and collections

## CORS

CORS middleware is configured in `main.py` to allow local frontend origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

## Auth Endpoints

Under `/auth`:

- `POST /send-otp` -> send OTP to email
- `POST /verify-otp` -> verify OTP and register user (multipart/form-data)
- `POST /register` -> direct register (creates unverified user)
- `POST /login` -> returns JWT token for verified users
- `GET /me` -> current authenticated user
- `GET /users/{user_id}` -> read user
- `PATCH /users/{user_id}` -> partial update user
- `PUT /users/{user_id}` -> replace user
- `DELETE /users/{user_id}` -> delete user

## Data Model Notes

User fields include:

- `id`
- `full_name`
- `email`
- `hashed_password`
- `auth_type`
- `is_verified`
- `profile_image_url`
- `profile_image_public_id`

OTP records are stored in `otps` collection and use TTL index on `expires_at`.

## Environment Variables

Key variables used by server:

- `MONGODB_URI`
- `MONGODB_DATABASE`
- `JWT_SECRET` (or `SECRET_KEY`)
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `SMTP_SERVER`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER` (optional)

## Important Behavior

- `POST /register` sets `is_verified=False`.
- `POST /login` authenticates only verified users.
- OTP-based register (`/verify-otp`) sets `is_verified=True`.
