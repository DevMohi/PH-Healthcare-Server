import { UserRole } from "../../generated/prisma";

export type IAuthUser = {
  email: string;
  role: UserRole;
} | null;
