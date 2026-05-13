import type { User, UserRole, UserStatus } from "@prisma/client";

export type SafeUser = Omit<User, "deletedAt" | "passwordHash"> & {
  deletedAt?: Date | null;
};

export type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  age: number | null;
  city: string | null;
  district: string | null;
  supportedTeam: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
};

export type ApiResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// Erişim kontrol tipleri
export type AccessCheck = {
  allowed: boolean;
  reason?: string;
  redirectTo?: string;
};
