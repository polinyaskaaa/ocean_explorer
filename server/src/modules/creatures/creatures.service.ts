import { Prisma } from '@prisma/client';
import { HttpError } from '../../lib/http-error';
import { prisma } from '../../lib/prisma';
import type { CreateCreatureInput, UpdateCreatureInput } from './creatures.schemas';

const publicSelect = {
  id: true,
  name: true,
  latinName: true,
  description: true,
  diet: true,
  size: true,
  weight: true,
  lifespan: true,
  habitat: true,
  imageUrl: true,
  depth: true,
  motion: true,
  _count: { select: { questions: true } },
} satisfies Prisma.CreatureSelect;

export async function listCreatures() {
  const creatures = await prisma.creature.findMany({
    orderBy: { depth: 'asc' },
    select: publicSelect,
  });

  return creatures.map(({ _count, ...creature }) => ({
    ...creature,
    questionCount: _count.questions,
  }));
}

export async function getCreature(id: string) {
  const creature = await prisma.creature.findUnique({ where: { id }, select: publicSelect });
  if (!creature) throw HttpError.notFound('Мешканця не знайдено');

  const { _count, ...rest } = creature;
  return { ...rest, questionCount: _count.questions };
}

export async function getCreatureForAdmin(id: string) {
  const creature = await prisma.creature.findUnique({
    where: { id },
    include: { questions: { orderBy: { createdAt: 'asc' } } },
  });
  if (!creature) throw HttpError.notFound('Мешканця не знайдено');
  return creature;
}

export async function listCreaturesForAdmin() {
  return prisma.creature.findMany({
    orderBy: { depth: 'asc' },
    include: { questions: { orderBy: { createdAt: 'asc' } } },
  });
}

export async function createCreature(input: CreateCreatureInput) {
  const { questions, latinName, ...fields } = input;

  return prisma.creature.create({
    data: {
      ...fields,
      latinName: latinName || null,
      questions: questions?.length ? { create: questions } : undefined,
    },
    include: { questions: true },
  });
}

export async function updateCreature(id: string, input: UpdateCreatureInput) {
  await getCreatureForAdmin(id);

  const { questions, latinName, ...fields } = input;

  return prisma.$transaction(async (tx) => {
    if (questions) {
      await tx.question.deleteMany({ where: { creatureId: id } });
      await tx.question.createMany({
        data: questions.map((q) => ({ ...q, creatureId: id })),
      });
    }

    return tx.creature.update({
      where: { id },
      data: latinName === undefined ? fields : { ...fields, latinName: latinName || null },
      include: { questions: { orderBy: { createdAt: 'asc' } } },
    });
  });
}

export async function deleteCreature(id: string) {
  await getCreatureForAdmin(id);
  await prisma.creature.delete({ where: { id } });
}
