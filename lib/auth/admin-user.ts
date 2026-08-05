import { scryptSync, timingSafeEqual } from "node:crypto";

type AdminUser = {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: "admin";
};

// PostgreSQL導入前のブートストラップ用初期管理者。
// パスワードはscryptハッシュのみを保持し、平文は保存しない。
const initialAdmin: AdminUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "admin@example.com",
  passwordSalt: "1RMrQ_ABZ3krIiYU-geROQ",
  passwordHash:
    "FcEuO4OQBgPUi6TXrysRtH3r_Kug4TlfXHFgITCVECkjtxhNQf6PerSSw5tT8nt-z4UEGR-8hZwxM1UP8SAp7g",
  role: "admin",
};

export type AuthenticatedAdmin = Pick<AdminUser, "email" | "id" | "role">;

export function getAdminById(id: string): AuthenticatedAdmin | null {
  if (id !== initialAdmin.id) {
    return null;
  }

  return {
    id: initialAdmin.id,
    email: initialAdmin.email,
    role: initialAdmin.role,
  };
}

export function verifyAdminCredentials(
  email: string,
  password: string,
): AuthenticatedAdmin | null {
  const expectedHash = Buffer.from(initialAdmin.passwordHash, "base64url");
  const actualHash = scryptSync(
    password,
    Buffer.from(initialAdmin.passwordSalt, "base64url"),
    expectedHash.length,
  );

  const emailMatches = email.trim().toLowerCase() === initialAdmin.email;
  const passwordMatches = timingSafeEqual(actualHash, expectedHash);

  if (!emailMatches || !passwordMatches) {
    return null;
  }

  return {
    id: initialAdmin.id,
    email: initialAdmin.email,
    role: initialAdmin.role,
  };
}
