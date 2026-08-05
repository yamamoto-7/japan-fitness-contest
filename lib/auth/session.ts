import { createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_IDLE_TIMEOUT_SECONDS } from "./constants";

export type AdminSession = {
  exp: number;
  iat: number;
  role: "admin";
  sub: string;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret) {
    if (secret.length < 32) {
      throw new Error("AUTH_SECRET must be at least 32 characters.");
    }

    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "development-only-jfc-auth-secret-change-before-production";
  }

  throw new Error("AUTH_SECRET is required in production.");
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest();
}

export function createSessionToken(admin: {
  id: string;
  role: "admin";
}) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSession = {
    sub: admin.id,
    role: admin.role,
    iat: now,
    exp: now + SESSION_IDLE_TIMEOUT_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encodedPayload).toString("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, encodedSignature, ...extra] = token.split(".");

  if (!encodedPayload || !encodedSignature || extra.length > 0) {
    return null;
  }

  try {
    const actualSignature = Buffer.from(encodedSignature, "base64url");
    const expectedSignature = sign(encodedPayload);

    if (
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(actualSignature, expectedSignature)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<AdminSession>;
    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.sub !== "string" ||
      payload.role !== "admin" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      payload.exp <= now ||
      payload.iat > now + 60
    ) {
      return null;
    }

    return payload as AdminSession;
  } catch {
    return null;
  }
}
