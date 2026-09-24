import type {
  AdminCreature,
  AuthResponse,
  Creature,
  CreaturePayload,
  ProgressResponse,
  QuizResult,
  QuizSession,
  User,
} from '../types';
import { request } from './client';

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body, auth: false }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body, auth: false }),

  me: () => request<{ user: User }>('/auth/me'),
};

export const creaturesApi = {
  list: () => request<{ creatures: Creature[] }>('/creatures', { auth: false }),
};

export const quizApi = {
  start: (creatureId: string) => request<QuizSession>(`/quiz/${creatureId}`),

  submit: (creatureId: string, answers: { questionId: string; optionIndex: number }[]) =>
    request<QuizResult>(`/quiz/${creatureId}/submit`, { method: 'POST', body: { answers } }),
};

export const progressApi = {
  get: () => request<ProgressResponse>('/progress'),
};

export const adminApi = {
  list: () => request<{ creatures: AdminCreature[] }>('/admin/creatures'),

  create: (body: CreaturePayload) =>
    request<{ creature: AdminCreature }>('/admin/creatures', { method: 'POST', body }),

  update: (id: string, body: CreaturePayload) =>
    request<{ creature: AdminCreature }>(`/admin/creatures/${id}`, { method: 'PUT', body }),

  remove: (id: string) => request<void>(`/admin/creatures/${id}`, { method: 'DELETE' }),
};
