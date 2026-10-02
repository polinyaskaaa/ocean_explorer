import { z } from 'zod';

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid('Некоректний ідентифікатор питання'),
        optionIndex: z.number().int().min(0),
      }),
    )
    .min(1, 'Потрібно відповісти хоча б на одне питання'),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
