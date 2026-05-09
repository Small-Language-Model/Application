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
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=webapp
SECRET_KEY=change-this-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Auth endpoints

- `POST /auth/register` - create a new user
- `POST /auth/login` - login with form data (`username` + `password`)
- `POST /auth/login-json` - login with JSON payload (`username_or_email` + `password`)
- `GET /auth/me` - get the current authenticated user