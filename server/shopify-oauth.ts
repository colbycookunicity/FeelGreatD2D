import crypto from "node:crypto";

const ADMIN_API_VERSION = "2025-01";

// Scopes needed for KnockBase Admin API usage
const REQUIRED_SCOPES = [
  "write_draft_orders",
  "read_draft_orders",
  "read_products",
  "write_products",
  "read_orders",
  "write_orders",
  "read_customers",
  "write_customers",
].join(",");

// In-memory nonce store for CSRF protection (adequate for single-server setup)
const nonceStore = new Map<string, number>();

function cleanExpiredNonces() {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [nonce, timestamp] of nonceStore) {
    if (timestamp < fiveMinutesAgo) {
      nonceStore.delete(nonce);
    }
  }
}

/**
 * Returns the OAuth install URL that redirects the merchant to Shopify's
 * authorization screen. After they approve, Shopify redirects back to our callback.
 */
export function getInstallUrl(baseUrl: string): string {
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || "";

  if (!apiKey || !storeDomain) {
    throw new Error(
      "Missing SHOPIFY_API_KEY or SHOPIFY_STORE_DOMAIN environment variables"
    );
  }

  cleanExpiredNonces();
  const nonce = crypto.randomBytes(16).toString("hex");
  nonceStore.set(nonce, Date.now());

  const redirectUri = `${baseUrl}/api/shopify/auth/callback`;
  const shopOrigin = storeDomain.replace(/^https?:\/\//, "");

  const installUrl = new URL(`https://${shopOrigin}/admin/oauth/authorize`);
  installUrl.searchParams.set("client_id", apiKey);
  installUrl.searchParams.set("scope", REQUIRED_SCOPES);
  installUrl.searchParams.set("redirect_uri", redirectUri);
  installUrl.searchParams.set("state", nonce);

  return installUrl.toString();
}

/**
 * Validates the callback from Shopify and exchanges the temporary code for
 * a permanent access token.
 */
export async function handleCallback(
  query: Record<string, string>
): Promise<{ accessToken: string; scopes: string }> {
  const { code, state, shop, hmac } = query;

  if (!code || !state || !shop) {
    throw new Error("Missing required OAuth callback parameters (code, state, shop)");
  }

  // Verify nonce (CSRF protection)
  if (!nonceStore.has(state)) {
    throw new Error("Invalid or expired state parameter. Please restart the install flow.");
  }
  nonceStore.delete(state);

  // Verify HMAC if SHOPIFY_API_SECRET is set
  const apiSecret = process.env.SHOPIFY_API_SECRET || "";
  if (apiSecret && hmac) {
    const params = { ...query };
    delete params.hmac;
    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");
    const digest = crypto
      .createHmac("sha256", apiSecret)
      .update(sortedParams)
      .digest("hex");
    if (
      !crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(hmac, "hex"))
    ) {
      throw new Error("HMAC verification failed. Request may have been tampered with.");
    }
  }

  // Exchange code for permanent access token
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  if (!apiKey || !apiSecret) {
    throw new Error("Missing SHOPIFY_API_KEY or SHOPIFY_API_SECRET environment variables");
  }

  const tokenUrl = `https://${shop}/admin/oauth/access_token`;
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Shopify token exchange failed (HTTP ${res.status}):`, body);
    throw new Error(`Token exchange failed (HTTP ${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { access_token: string; scope: string };

  if (!data.access_token) {
    throw new Error("No access_token returned from Shopify");
  }

  return {
    accessToken: data.access_token,
    scopes: data.scope,
  };
}

/**
 * Returns an HTML page that displays the access token for copying into env vars.
 */
export function renderTokenPage(accessToken: string, scopes: string, shop: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KnockBase - Shopify OAuth Complete</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #1e293b;
      border-radius: 16px;
      padding: 40px;
      max-width: 700px;
      width: 100%;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .success-icon {
      width: 64px;
      height: 64px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      font-size: 32px;
    }
    h1 { font-size: 24px; margin-bottom: 8px; color: #f8fafc; }
    .subtitle { color: #94a3b8; margin-bottom: 24px; }
    .field { margin-bottom: 20px; }
    .field label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #10b981;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .token-box {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px 16px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 13px;
      word-break: break-all;
      color: #e2e8f0;
      position: relative;
    }
    .copy-btn {
      display: inline-block;
      margin-top: 8px;
      padding: 8px 20px;
      background: #10b981;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .copy-btn:hover { background: #059669; }
    .scopes { color: #94a3b8; font-size: 13px; }
    .scopes span { color: #10b981; }
    .warning {
      margin-top: 24px;
      padding: 16px;
      background: #451a03;
      border: 1px solid #92400e;
      border-radius: 8px;
      font-size: 13px;
      color: #fbbf24;
    }
    .env-instructions {
      margin-top: 24px;
      padding: 16px;
      background: #0c4a6e;
      border: 1px solid #0369a1;
      border-radius: 8px;
      font-size: 13px;
      color: #7dd3fc;
    }
    .env-instructions code {
      display: block;
      margin-top: 8px;
      background: #0f172a;
      padding: 10px;
      border-radius: 6px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: #10b981;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="success-icon">✓</div>
    <h1>Shopify App Installed Successfully</h1>
    <p class="subtitle">KnockBase is now connected to <strong>${shop}</strong></p>

    <div class="field">
      <label>Admin Access Token</label>
      <div class="token-box" id="tokenValue">${accessToken}</div>
      <button class="copy-btn" onclick="copyToken()">Copy Token</button>
    </div>

    <div class="field">
      <label>Granted Scopes</label>
      <p class="scopes">${scopes
        .split(",")
        .map((s: string) => `<span>${s.trim()}</span>`)
        .join(", ")}</p>
    </div>

    <div class="env-instructions">
      <strong>Next step:</strong> Set this as your Replit Secret or .env variable:
      <code>SHOPIFY_ADMIN_ACCESS_TOKEN=${accessToken}</code>
    </div>

    <div class="warning">
      <strong>⚠ Security:</strong> This token is shown once. Copy it now and store it securely.
      Do NOT share this token publicly. After copying, close this page.
    </div>
  </div>

  <script>
    function copyToken() {
      const token = document.getElementById('tokenValue').textContent;
      navigator.clipboard.writeText(token).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = 'Copied!';
        btn.style.background = '#059669';
        setTimeout(() => {
          btn.textContent = 'Copy Token';
          btn.style.background = '#10b981';
        }, 2000);
      });
    }
  </script>
</body>
</html>`;
}
