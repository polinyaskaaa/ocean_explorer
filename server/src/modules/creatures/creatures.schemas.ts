import { Motion } from '@prisma/client';
import { z } from 'zod';

export const questionInputSchema = z.object({
  text: z.string().trim().min(5, 'Питання занадто коротке').max(300),
  options: z
    .array(z.string().trim().min(1, 'Варіант відповіді не може бути порожнім').max(200))
    .min(2, 'Потрібно щонайменше 2 варіанти відповіді')
    .max(6, 'Максимум 6 варіантів відповіді'),
  correctIndex: z.number().int().min(0),
}).refine((q) => q.correctIndex < q.options.length, {
  message: 'Індекс правильної відповіді виходить за межі списку варіантів',
  path: ['correctIndex'],
});

export const createCreatureSchema = z.object({
  name: z.string().trim().min(2).max(100),
  latinName: z.string().trim().max(100).optional().or(z.literal('')),
  description: z.string().trim().min(10, 'Опис має містити щонайменше 10 символів').max(2000),
  diet: z.string().trim().min(2).max(200),
  size: z.string().trim().min(1).max(100),
  weight: z.string().trim().min(1).max(100),
  lifespan: z.string().trim().min(1).max(100),
  habitat: z.string().trim().min(2).max(200),
  imageUrl: z
    .string()
    .trim()
    .min(1, 'Вкажіть зображення')
    .refine((v) => /^https?:\/\//.test(v) || v.startsWith('/'), {
      message: 'Вкажіть URL (http/https) або локальний шлях, що починається з «/»',
    }),
  depth: z.number().int().min(0, 'Глибина не може бути від’ємною').max(4000, 'Максимальна глибина MVP 1 — 4000 м'),
  motion: z.nativeEnum(Motion).optional(),
  questions: z.array(questionInputSchema).max(20).optional(),
});

export const updateCreatureSchema = createCreatureSchema.partial();

export type QuestionInput = z.infer<typeof questionInputSchema>;
export type CreateCreatureInput = z.infer<typeof createCreatureSchema>;
export type UpdateCreatureInput = z.infer<typeof updateCreatureSchema>;
