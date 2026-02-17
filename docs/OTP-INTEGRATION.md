# OTP (One-Time Password) Integration

## Overview

The application uses two different OTP systems:

1. **Hydra OTP** (Production) - For affiliate email verification during signup
2. **Internal OTP** (Development/Admin) - For admin account setup and legacy dev testing

## Affiliate Email Verification (Hydra)

Affiliate signup uses Unicity's Hydra API for OTP generation and validation. This sends real verification emails.

### Environment Variables Required

```
HYDRA_API_URL=https://hydraqa.unicity.net/v6-test
```

Note: Hydra authentication is internal and does not require an API key.

### API Endpoints (Public, No Auth Required)

#### POST /api/affiliate/otp/request
- **Auth Required**: No
- **Body**: `{ "email": "user@example.com" }`
- **Purpose**: Request Hydra to send a verification code to the email
- **Success Response**: `{ "message": "Verification code sent to your email" }`

#### POST /api/affiliate/otp/verify
- **Auth Required**: No
- **Body**: `{ "email": "user@example.com", "code": "123456" }`
- **Purpose**: Verify the code entered by user via Hydra
- **Success Response**: `{ "message": "Email verified successfully", "verified": true }`
- **Side Effect**: Updates user's `emailVerifiedAt` timestamp in database

### How It Works

1. User completes Step 1 (account creation) of affiliate signup
2. Frontend calls `POST /api/affiliate/otp/request` with user's email
3. Hydra sends verification email to user
4. User enters 6-digit code from email
5. Frontend calls `POST /api/affiliate/otp/verify` with email and code
6. Hydra validates the code
7. If valid, user's email is marked as verified

### Error Handling

| Hydra Error | User-Facing Message |
|-------------|---------------------|
| RATE_LIMITED | "Too many requests. Please wait before trying again." |
| INVALID_OTP | "Invalid or expired verification code." |
| OTP_EXPIRED | "Invalid or expired verification code." |
| OTP_NOT_FOUND | "No verification code found. Please request a new one." |

### Files Involved

- `server/services/hydraClient.ts` - Hydra API client with error handling
- `server/routes.ts` - Public OTP routes (`/api/affiliate/otp/*`)
- `client/src/pages/signup.tsx` - Frontend OTP input UI (Step 2)

---

## Internal OTP System (Admin/Dev)

The internal OTP system is used for:
- Admin account setup (when creating new admins)
- Development testing (with bypass code)

### How It Works

- 6-digit codes generated using `crypto.randomInt(100000, 999999)`
- Codes are SHA-256 hashed before storage
- Codes expire after 10 minutes (email) or 24 hours (admin setup)
- Codes are logged to server console (NOT emailed)

### API Endpoints (Auth Required)

#### POST /api/otp/send-email
- **Auth Required**: Yes (session-based)
- **Purpose**: Generate OTP for authenticated user
- **Behavior**: Logs OTP to server console

#### POST /api/otp/verify-email
- **Auth Required**: Yes (session-based)
- **Body**: `{ "code": "123456" }`
- **Dev Bypass**: Code "000000" works in development

### Admin Setup Flow

1. Admin creates new admin at `/admin/users`
2. System generates OTP and logs to console
3. New admin uses setup link with OTP to set password

### Files Involved

- `server/routes.ts` - Internal OTP routes (`/api/otp/*`)
- `server/storage.ts` - Database operations for `otp_challenges` table
- `shared/schema.ts` - `otp_challenges` table schema

---

## Security Features

### Hydra OTP (Affiliate)
- No OTP codes stored locally
- All validation handled by Hydra
- Rate limiting enforced by Hydra
- Real email delivery

### Internal OTP (Admin/Dev)
- SHA-256 hashed storage (plain codes never stored)
- Maximum 5 verification attempts per OTP
- Configurable expiration (10 min or 24 hours)
- Single use (cannot be reused after verification)
- Dev bypass only works when `NODE_ENV !== 'production'`

---

## Testing

### Affiliate OTP (Hydra)
1. Start affiliate signup at `/a/signup?ref=CODE`
2. Complete Step 1 (account creation)
3. Click "Send code" - real email is sent
4. Enter code from email

### Admin OTP (Internal)
1. Check server console for: `[OTP] Admin setup code for ${email}: XXXXXX`
2. Enter the 6-digit code
3. Alternative: Use "000000" as bypass code in development
