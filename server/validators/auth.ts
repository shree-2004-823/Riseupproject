import { z } from 'zod';

const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(24)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, underscores, and hyphens');

export const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  username: usernameSchema,
  phoneNumber: z.string().trim().min(10).max(20).optional(),
  smsMarketingOptIn: z.boolean().optional(),
  smsRemindersOptIn: z.boolean().optional(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(80),
  password: z.string().min(8).max(128),
});

export const adminAccessKeySchema = z.object({
  accessKey: z.string().trim().min(1).max(64),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'New password and confirmation must match',
    path: ['confirmPassword'],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(8).max(128),
});
