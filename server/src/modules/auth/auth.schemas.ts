import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ім’я має містити щонайменше 2 символи').max(50),
  email: z.string().trim().toLowerCase().email('Некоректний формат email'),
  password: z
    .string()
    .min(8, 'Пароль має містити щонайменше 8 символів')
    .max(72, 'Пароль занадто довгий'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Некоректний формат email'),
  password: z.string().min(1, 'Введіть пароль'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
