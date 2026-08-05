import { scryptSync, timingSafeEqual } from "node:crypto";

const ADMIN_ID = "phase1-admin";
const PASSWORD_HASH_FORMAT = "scrypt:<base64url-salt>:<base64url-hash>";

type AdminUser = {
  id: string;
  email: string;
  role: "admin";
};

type AdminCredentials = AdminUser & {
  passwordHash: Buffer;
  passwordSalt: Buffer;
};

export type AuthenticatedAdmin = AdminUser;

export class AdminConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminConfigurationError";
  }
}
function loadAdminCredentials(): AdminCredentials {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const encodedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!email || !encodedPasswordHash) {
    throw new AdminConfigurationError(
      "ADMIN_EMAIL and ADMIN_PASSWORD_HASH are required.",
    );
  }

  const [algorithm, encodedSalt, encodedHash, ...extra] =
    encodedPasswordHash.split(":");

  if (
    algorithm !== "scrypt" ||
    !encodedSalt ||
    !encodedHash ||
    extra.length > 0
  ) {
    throw new AdminConfigurationError(
      `ADMIN_PASSWORD_HASH must use ${PASSWORD_HASH_FORMAT}.`,
    );
  }

  const passwordSalt = Buffer.from(encodedSalt, "base64url");
  const passwordHash = Buffer.from(encodedHash, "base64url");

  if (passwordSalt.length < 16 || passwordHash.length < 32) {
    throw new AdminConfigurationError("ADMIN_PASSWORD_HASH is invalid.");
  }

  return {
    id: ADMIN_ID,
    email,
    passwordHash,
    passwordSalt,
    role: "admin",
  };
}

export function getAdminById(id: string): AuthenticatedAdmin | null {
  if (id !== ADMIN_ID) {
    return null;
  }

  const admin = loadAdminCredentials();

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };
}

export function verifyAdminCredentials(
  email: string,
  password: string,
): AuthenticatedAdmin | null {
  const admin = loadAdminCredentials();
  const actualHash = scryptSync(
    password,
    admin.passwordSalt,
    admin.passwordHash.length,
  );
  const emailMatches = email.trim().toLowerCase() === admin.email;
  const passwordMatches = timingSafeEqual(actualHash, admin.passwordHash);

  if (!emailMatches || !passwordMatches) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };
}
