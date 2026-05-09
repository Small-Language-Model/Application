## SLM (Application)

### Run server

- Create python virtual environment
```bash
python -m venv venv
```
- Activate virtual environment
```bash
venv\Scripts\activate
```

- Install requirements 
```bash
pip install -r requirements.txt
```

- Launch server
```bash
uvicorn main:app --reload
```

### Environment variables

Create a `.env` file in the `server/` folder:

```bash
# Database Configuration
MONGODB_URI=
MONGODB_DATABASE=slmApplication

# Jwt Configuration
JWT_SECRET=

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=HealthBot

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=slm-profiles

# Google Auth
GOOGLE_AUTH_CLIENT_ID=
GOOGLE_AUTH_CLIENT_SECRET=
GOOGLE_CLIENT_REDIRECT_URL=
GOOGLE_AUTH_REDIRECT_URL=http://127.0.0.1:8000/auth/google/callback

```

### Auth endpoints

- `POST /auth/register` - create a new user
- `POST /auth/login` - login with form data (`username` + `password`)
- `POST /auth/login-json` - login with JSON payload (`username_or_email` + `password`)
- `GET /auth/me` - get the current authenticated user