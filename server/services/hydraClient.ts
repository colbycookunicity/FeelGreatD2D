const HYDRA_API_URL = process.env.NODE_ENV === 'development'
  ? 'https://hydraqa.unicity.net/v6-test'
  : process.env.HYDRA_API_URL || 'https://hydra.unicity.net/v6';

interface HydraSuccessData {
  validation_id?: string;
  expires_at?: string;
  must_validate?: boolean;
  message?: string;
  verified_at?: string;
  email?: string;
  customer_id?: number;
}

interface HydraErrorData {
  error_code: string;
  message: string;
  retry_after?: number;
}

interface HydraResponse {
  success: boolean;
  data: HydraSuccessData | HydraErrorData;
}

export class HydraError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "HydraError";
  }
}

const HYDRA_ERROR_MESSAGES: Record<string, string> = {
  RATE_LIMITED: "Too many requests. Please wait before trying again.",
  INVALID_CODE: "Invalid or expired verification code.",
  USER_NOT_FOUND: "Email not registered.",
  SYSTEM_ERROR: "Verification service unavailable. Please try again later.",
};

function getHydraUserMessage(code: string): string {
  return HYDRA_ERROR_MESSAGES[code] || "Verification failed. Please try again.";
}

export async function requestOtp(email: string): Promise<void> {
  const url = `${HYDRA_API_URL}/otp/generate`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const body = await res.json() as HydraResponse;

  if (!body.success) {
    const errData = body.data as HydraErrorData;
    const code = errData.error_code || "UNKNOWN";
    throw new HydraError(code, getHydraUserMessage(code));
  }
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const url = `${HYDRA_API_URL}/otp/validate`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  const body = await res.json() as HydraResponse;

  if (!body.success) {
    const errData = body.data as HydraErrorData;
    const errorCode = errData.error_code || "UNKNOWN";
    throw new HydraError(errorCode, getHydraUserMessage(errorCode));
  }

  const successData = body.data as HydraSuccessData;
  if (successData.email && successData.email !== email) {
    throw new HydraError("EMAIL_MISMATCH", "Email verification mismatch. Please try again.");
  }

  return true;
}
