# Hydra OTP Integration

Technical reference for integrating with Unicity's Hydra OTP service.

## Hydra API Endpoints

### Base URLs

```
Development: https://hydraqa.unicity.net/v6-test
Production:  https://hydra.unicity.net/v6
```

### Generate OTP

Sends a 6-digit code to the user's email.

```
POST /otp/generate
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "validation_id": "abc123",
    "expires_at": "2026-02-02T17:00:00Z",
    "must_validate": true,
    "message": "OTP sent successfully"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": {
    "error_code": "RATE_LIMITED",
    "message": "Too many requests",
    "retry_after": 60
  }
}
```

### Validate OTP

Verifies the 6-digit code the user entered.

```
POST /otp/validate
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "validation_id": "abc123",
    "verified_at": "2026-02-02T16:55:00Z",
    "email": "user@example.com",
    "customer_id": 12345,
    "message": "OTP verified successfully"
  }
}
```

**Important:** Always verify `data.email` matches the email you sent. This prevents email substitution attacks.

**Error Response:**
```json
{
  "success": false,
  "data": {
    "error_code": "INVALID_CODE",
    "message": "Invalid or expired verification code"
  }
}
```

## Implementation Example

### Hydra Client (TypeScript)

```typescript
const HYDRA_API_URL = process.env.NODE_ENV === 'development'
  ? 'https://hydraqa.unicity.net/v6-test'
  : process.env.HYDRA_API_URL || 'https://hydra.unicity.net/v6';

interface HydraResponse<T> {
  success: boolean;
  data: T | { error_code: string; message: string };
}

async function generateOtp(email: string): Promise<HydraResponse<any>> {
  const response = await fetch(`${HYDRA_API_URL}/otp/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

async function validateOtp(email: string, code: string): Promise<{ valid: boolean; error?: string }> {
  const response = await fetch(`${HYDRA_API_URL}/otp/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  
  const data = await response.json();
  
  // IMPORTANT: Verify email matches to prevent substitution attacks
  if (data.success && data.data.email === email) {
    return { valid: true };
  }
  
  return { valid: false, error: data.data?.message || 'Invalid code' };
}
```

### API Routes (Express)

```typescript
// Request OTP
app.post('/api/auth/otp/request', async (req, res) => {
  const { email } = req.body;
  
  // 1. Check if user exists in your system
  const user = await db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Account not found' });
  }
  
  // 2. Request OTP from Hydra
  const result = await generateOtp(email);
  
  if (!result.success) {
    return res.status(500).json({ error: result.data.message });
  }
  
  return res.json({ success: true, message: 'Verification code sent' });
});

// Validate OTP
app.post('/api/auth/otp/validate', async (req, res) => {
  const { email, code } = req.body;
  
  // 1. Validate with Hydra
  const validation = await validateOtp(email, code);
  
  if (!validation.valid) {
    return res.status(401).json({ error: validation.error });
  }
  
  // 2. Create session
  const user = await db.getUserByEmail(email);
  req.session.userId = user.id;
  
  return res.json({ success: true, user });
});
```

## Error Codes

| Code | Meaning |
|------|---------|
| `INVALID_CODE` | Code is wrong or expired |
| `RATE_LIMITED` | Too many requests, wait before retrying |
| `USER_NOT_FOUND` | Email not registered in Hydra |
| `SYSTEM_ERROR` | Hydra service unavailable |

## Environment Variables

```
HYDRA_API_URL=https://hydra.unicity.net/v6
```

Set this in production. In development, the code automatically uses the QA endpoint.
