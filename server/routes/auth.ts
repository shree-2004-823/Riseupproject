import { Router } from 'express';
import { clearAuthCookie, comparePassword, hashPassword, setAuthCookie, signToken } from '../lib/auth.js';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { parseStoredGoals } from '../lib/profile.js';
import { authenticate } from '../middleware/authenticate.js';
import { changePasswordSchema, deleteAccountSchema, loginSchema, signupSchema } from '../validators/auth.js';

export const authRouter = Router();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function normalizePhoneNumber(phoneNumber?: string) {
  if (!phoneNumber) {
    return null;
  }

  const digits = phoneNumber.replace(/[^\d+]/g, '');
  return digits.length >= 10 ? digits : null;
}

function serializeUser(user: {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  phoneNumber: string | null;
  phoneVerifiedAt: Date | null;
  role: string;
  onboardingCompleted: boolean;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    phoneNumber: user.phoneNumber,
    phoneVerified: Boolean(user.phoneVerifiedAt),
    role: user.role.toLowerCase(),
    onboardingCompleted: user.onboardingCompleted,
  };
}

authRouter.post(
  '/signup',
  asyncHandler(async (request, response) => {
    const parsed = signupSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid signup payload', parsed.error.flatten());
    }

    const { fullName, password, username } = parsed.data;
    const email = normalizeEmail(parsed.data.email);
    const usernameLower = normalizeUsername(username);
    const phoneNumberE164 = normalizePhoneNumber(parsed.data.phoneNumber);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { usernameLower },
          ...(phoneNumberE164 ? [{ phoneNumberE164 }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new HttpError(409, 'An account with this email already exists');
      }

      if (existingUser.usernameLower === usernameLower) {
        throw new HttpError(409, 'That username is already taken');
      }

      throw new HttpError(409, 'That phone number is already linked to another account');
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        username,
        usernameLower,
        phoneNumber: parsed.data.phoneNumber?.trim() || null,
        phoneNumberE164,
        smsMarketingOptIn: parsed.data.smsMarketingOptIn ?? false,
        smsRemindersOptIn: parsed.data.smsRemindersOptIn ?? false,
        passwordHash: await hashPassword(password),
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(response, token);

    response.status(201).json({
      message: 'Account created successfully',
      user: serializeUser(user),
    });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (request, response) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid login payload', parsed.error.flatten());
    }

    const identifier = parsed.data.identifier.trim();
    const normalizedEmail = normalizeEmail(identifier);
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { usernameLower: normalizeUsername(identifier) }],
      },
    });

    if (!user) {
      throw new HttpError(401, 'Invalid email, username, or password');
    }

    const passwordMatches = await comparePassword(parsed.data.password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, 'Invalid email, username, or password');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(response, token);

    response.json({
      message: 'Login successful',
      user: serializeUser(user),
    });
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (request, response) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.auth!.userId },
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    response.json({
      user: serializeUser(user),
      profile: profile
        ? {
            goals: parseStoredGoals(profile.goals),
            coachPersonality: profile.aiStyle,
            routine: {
              wakeTime: profile.wakeTime,
              workoutTime: profile.workoutTime,
              reminderTime: profile.reminderTime,
              sleepTime: profile.sleepTime,
            },
          }
        : null,
    });
  }),
);

authRouter.post(
  '/change-password',
  authenticate,
  asyncHandler(async (request, response) => {
    const parsed = changePasswordSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid password update payload', parsed.error.flatten());
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.auth!.userId },
    });

    const passwordMatches = await comparePassword(parsed.data.currentPassword, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, 'Current password is incorrect');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(parsed.data.newPassword),
      },
    });

    response.json({
      message: 'Password updated successfully',
    });
  }),
);

authRouter.delete(
  '/account',
  authenticate,
  asyncHandler(async (request, response) => {
    const parsed = deleteAccountSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid account deletion payload', parsed.error.flatten());
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.auth!.userId },
    });

    const passwordMatches = await comparePassword(parsed.data.password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, 'Password is incorrect');
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    clearAuthCookie(response);

    response.json({
      message: 'Account deleted successfully',
    });
  }),
);

authRouter.post(
  '/logout',
  asyncHandler(async (_request, response) => {
    clearAuthCookie(response);
    response.status(204).send();
  }),
);
