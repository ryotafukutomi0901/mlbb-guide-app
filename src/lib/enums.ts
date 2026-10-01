import { LANE_LABEL, ROLE_LABEL, type Lane, type Role } from "@/data/types";

/** zod等で列挙が必要な場面向け(data/types.ts のラベル定義を唯一の情報源にする) */
export const LANES = Object.keys(LANE_LABEL) as [Lane, ...Lane[]];
export const ROLES = Object.keys(ROLE_LABEL) as [Role, ...Role[]];
