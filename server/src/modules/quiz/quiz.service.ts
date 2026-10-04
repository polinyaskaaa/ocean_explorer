import { HttpError } from '../../lib/http-error';
import { prisma } from '../../lib/prisma';
import type { SubmitQuizInput } from './quiz.schemas';

export const QUIZ_QUESTION_COUNT = 3;
export const MAX_MISTAKES = 1;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function startQuiz(creatureId: string) {
  const creature = await prisma.creature.findUnique({
    where: { id: creatureId },
    include: { questions: true },
  });
  if (!creature) throw HttpError.notFound('Мешканця не знайдено');
  if (creature.questions.length === 0) {
    throw HttpError.badRequest('Для цього мешканця ще не додано питань');
  }

  const selected = shuffle(creature.questions).slice(0, QUIZ_QUESTION_COUNT);

  return {
    creatureId: creature.id,
    creatureName: creature.name,
    totalQuestions: selected.length,
    requiredCorrect: Math.max(1, selected.length - MAX_MISTAKES),
    questions: selected.map((q) => ({ id: q.id, text: q.text, options: q.options })),
  };
}

export async function submitQuiz(userId: string, creatureId: string, input: SubmitQuizInput) {
  const answers = input.answers;
  const uniqueIds = new Set(answers.map((a) => a.questionId));
  if (uniqueIds.size !== answers.length) {
    throw HttpError.badRequest('У відповідях є дублікати питань');
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: [...uniqueIds] }, creatureId },
  });
  if (questions.length !== uniqueIds.size) {
    throw HttpError.badRequest('Деякі питання не належать цьому мешканцю');
  }

  const byId = new Map(questions.map((q) => [q.id, q]));
  const results = answers.map((answer) => {
    const question = byId.get(answer.questionId)!;
    return {
      questionId: question.id,
      correct: question.correctIndex === answer.optionIndex,
      correctIndex: question.correctIndex,
      selectedIndex: answer.optionIndex,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const passed = correctCount >= Math.max(1, answers.length - MAX_MISTAKES);

  const alreadyAwarded = await prisma.quizAttempt.findFirst({
    where: { userId, creatureId, awardedPoint: true },
    select: { id: true },
  });
  const awardedPoint = passed && !alreadyAwarded;

  const [, user] = await prisma.$transaction([
    prisma.quizAttempt.create({
      data: { userId, creatureId, correctCount, passed, awardedPoint },
    }),
    awardedPoint
      ? prisma.user.update({ where: { id: userId }, data: { score: { increment: 1 } } })
      : prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);

  return {
    correctCount,
    totalQuestions: answers.length,
    passed,
    awardedPoint,
    totalScore: user.score,
    results,
  };
}
