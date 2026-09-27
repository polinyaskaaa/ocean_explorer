import { Role, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../lib/env';
import { HttpError } from '../../lib/http-error';
import { prisma } from '../../lib/prisma';
import type { LoginInput, RegisterInput } from './auth.schemas';

const SALT_ROUNDS = 12;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  score: number;
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role, score: user.score };
}

function signToken(user: User): string {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw HttpError.conflict('Користувач із таким email уже зареєстрований');
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, SALT_ROUNDS),
    },
  });

  return { token: signToken(user), user: toPublicUser(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const invalid = HttpError.unauthorized('Невірний email або пароль');
  if (!user) throw invalid;

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) throw invalid;

  return { token: signToken(user), user: toPublicUser(user) };
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw HttpError.unauthorized('Користувача не знайдено');
  return toPublicUser(user);
}
