import { z } from "zod"
import {UserRole, UserStatus} from "@/features/users/constants/users.constants.ts";

const userStatusEnum = z.enum([
    UserStatus.PENDING,
    UserStatus.ACTIVE,
    UserStatus.BLOCKED,
    UserStatus.INACTIVE,
])

const userRoleEnum = z.enum([
    UserRole.STUDENT,
    UserRole.INSTRUCTOR,
    UserRole.ADMIN,
])

export const createUserSchema = z
    .object({
        name: z.string().min(1, "Name is required").trim(),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Enter a valid email address")
            .trim(),
        password: z.string().min(1, "Password is required"),
        status: userStatusEnum,
        role: userRoleEnum,
        block_reason: z.string().trim().default(""),
        firstName: z.string().trim().default(""),
        lastName: z.string().trim().default(""),
        gender: z.string().default(""),
        phone: z.string().trim().default(""),
        dateOfBirth: z.string().default(""),
        occupation: z.string().trim().default(""),
        bio: z.string().trim().default(""),
        address: z.string().trim().default(""),
        city: z.string().trim().default(""),
        country: z.string().trim().default(""),
        avatarUrl: z.string().trim().default(""),
    })
    .refine(
        (data) => {
            if (data.status === UserStatus.BLOCKED && !data.block_reason) {
                return false
            }
            return true
        },
        {
            message: "Block reason is required when status is Blocked",
            path: ["block_reason"],
        }
    )

export const updateUserSchema = z
    .object({
        name: z.string().min(1, "Name is required").trim(),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Enter a valid email address")
            .trim(),
        password: z.string().default(""),
        status: userStatusEnum,
        role: userRoleEnum,
        block_reason: z.string().trim().default(""),
        firstName: z.string().trim().default(""),
        lastName: z.string().trim().default(""),
        gender: z.string().default(""),
        phone: z.string().trim().default(""),
        dateOfBirth: z.string().default(""),
        occupation: z.string().trim().default(""),
        bio: z.string().trim().default(""),
        address: z.string().trim().default(""),
        city: z.string().trim().default(""),
        country: z.string().trim().default(""),
        avatarUrl: z.string().trim().default(""),
    })
    .refine(
        (data) => {
            if (data.status === UserStatus.BLOCKED && !data.block_reason) {
                return false
            }
            return true
        },
        {
            message: "Block reason is required when status is Blocked",
            path: ["block_reason"],
        }
    )

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>