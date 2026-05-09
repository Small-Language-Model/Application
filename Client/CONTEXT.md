# Client Context

## Overview

This is a Vite + React frontend for VitalLM.

- Framework: React
- Build tool: Vite
- Routing: `react-router`
- Styling: Tailwind CSS + component primitives
- Auth state: `AuthContext`

## Entry Points

- `src/main.tsx` -> app bootstrap
- `src/app/App.tsx` -> providers + router
- `src/app/routes.tsx` -> route definitions
- `src/app/components/Layout.tsx` -> shared app shell

## Auth Integration

Auth and session logic lives in:

- `src/app/contexts/AuthContext.tsx`

API client lives in:

- `src/app/lib/api.ts`

Current auth flow:

1. Register page sends OTP: `POST /auth/send-otp`
2. Register page verifies OTP + creates account: `POST /auth/verify-otp`
3. Login: `POST /auth/login`
4. Session restore: `GET /auth/me` using Bearer token

JWT token is stored in `localStorage` under:

- `auth_token`

## API Base URL

Set this in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Main Pages

- `src/app/pages/Register.tsx` -> OTP-based registration
- `src/app/pages/Login.tsx` -> login
- `src/app/pages/Chat.tsx` -> chat UI + token usage UI logic
- `src/app/pages/Pricing.tsx` -> subscription/tier UI
- `src/app/pages/Admin.tsx` -> admin dashboard mock metrics

## Notes

- Chat response generation is still simulated in the client.
- Token/subscription counters are currently client-side UI state.
- Backend validation errors are surfaced through `ApiError` messages.
