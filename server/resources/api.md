## API Curl Examples

Base URL: `http://127.0.0.1:8000`

### Health Check

```bash
curl --location 'http://127.0.0.1:8000/'
```

### Auth Controller

#### Send OTP

```bash
curl --location 'http://127.0.0.1:8000/auth/send-otp' \
--header 'Content-Type: application/json' \
--data-raw '{
	"email": "onkar.jondhale@gmail.com"
}'
```

#### Verify OTP and Register

Use form data for this endpoint:

```bash
curl --location 'http://127.0.0.1:8000/auth/verify-otp' \
--form 'email="onkar.jondhale@gmail.com"' \
--form 'otp="897538"' \
--form 'full_name="Onkar Jondhale"' \
--form 'password="password123"'
```

With profile image upload:

```bash
curl --location 'http://127.0.0.1:8000/auth/verify-otp' \
--form 'email="onkar.jondhale@gmail.com"' \
--form 'otp="897538"' \
--form 'full_name="Onkar Jondhale"' \
--form 'password="password123"' \
--form 'profile_image=@"C:\\path\\to\\image.jpg"'
```

#### Register Without OTP

```bash
curl --location 'http://127.0.0.1:8000/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
	"full_name": "Onkar Jondhale",
	"email": "onkar.jondhale@gmail.com",
	"password": "password123"
}'
```

#### Login

```bash
curl --location 'http://127.0.0.1:8000/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
	"email": "onkar.jondhale@gmail.com",
	"password": "password123"
}'
```

#### Sign in with Google

Start the Google browser redirect flow:

```bash
curl --location 'http://127.0.0.1:8000/auth/google/start'
```

Google redirects back to:

```bash
http://127.0.0.1:8000/auth/google/callback?code=...&state=...
```

The backend then creates or links the user and returns your app JWT token.

#### Get Current User

```bash
curl --location 'http://127.0.0.1:8000/auth/me' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### Get User by ID

```bash
curl --location 'http://127.0.0.1:8000/auth/users/USER_ID' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### Update User Partially

```bash
curl --location --request PATCH 'http://127.0.0.1:8000/auth/users/USER_ID' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--form 'full_name="Updated Name"'
```

#### Replace User Fully

```bash
curl --location --request PUT 'http://127.0.0.1:8000/auth/users/USER_ID' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--form 'full_name="Updated Name"' \
--form 'email="updated.email@gmail.com"' \
--form 'profile_image=@"C:\\path\\to\\image.jpg"'
```

#### Delete User

```bash
curl --location --request DELETE 'http://127.0.0.1:8000/auth/users/USER_ID' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Notes

- Replace `YOUR_JWT_TOKEN` with a valid token from `/auth/login`.
- Replace `USER_ID` with the user's UUID.
- Use `--form` for endpoints that accept file uploads or `Form(...)` fields.
- For the Google redirect flow, set these in `.env`:
	- `GOOGLE_AUTH_CLIENT_ID`
	- `GOOGLE_AUTH_CLIENT_SECRET`
	- `GOOGLE_AUTH_REDIRECT_URL`
	- `GOOGLE_CLIENT_REDIRECT_URL` is optional and is used to redirect the browser back to your frontend with the app JWT in the URL fragment.
