import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';
import { seedCreatures, type SeedCreature } from './seed-data';

interface BuiltQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestion(text: string, answer: string, wrong: string[]): BuiltQuestion {
  const options = shuffle([answer, ...wrong]);
  return { text, options, correctIndex: options.indexOf(answer) };
}

function distractors(pool: SeedCreature[], current: SeedCreature, field: (c: SeedCreature) => string) {
  const correct = field(current);
  const candidates = [...new Set(pool.filter((c) => c !== current).map(field))].filter(
    (value) => value !== correct,
  );
  return shuffle(candidates).slice(0, 3);
}

function formatDepth(depth: number) {
  return depth >= 1000 ? `близько ${(depth / 1000).toFixed(1).replace('.', ',')} км` : `близько ${depth} м`;
}

function buildQuestionPool(creature: SeedCreature, pool: SeedCreature[]): BuiltQuestion[] {
  const depthAnswer = formatDepth(creature.depth);
  const depthWrong = shuffle(
    [...new Set(pool.filter((c) => c !== creature).map((c) => formatDepth(c.depth)))].filter(
      (v) => v !== depthAnswer,
    ),
  ).slice(0, 3);

  const generated = [
    buildQuestion(`Чим живиться ${creature.name.toLowerCase()}?`, creature.diet, distractors(pool, creature, (c) => c.diet)),
    buildQuestion(`Якого розміру сягає ${creature.name.toLowerCase()}?`, creature.size, distractors(pool, creature, (c) => c.size)),
    buildQuestion(`Скільки важить ${creature.name.toLowerCase()}?`, creature.weight, distractors(pool, creature, (c) => c.weight)),
    buildQuestion(`Скільки живе ${creature.name.toLowerCase()}?`, creature.lifespan, distractors(pool, creature, (c) => c.lifespan)),
    buildQuestion(`Де мешкає ${creature.name.toLowerCase()}?`, creature.habitat, distractors(pool, creature, (c) => c.habitat)),
    buildQuestion(`На якій глибині можна зустріти цей вид — ${creature.name.toLowerCase()}?`, depthAnswer, depthWrong),
  ];

  const custom = creature.custom.map((q) => buildQuestion(q.text, q.answer, q.wrong));

  return [...custom, ...generated];
}

async function main() {
  console.log('Очищення попередніх даних...');
  await prisma.quizAttempt.deleteMany();
  await prisma.creature.deleteMany();
  await prisma.user.deleteMany();

  console.log('Створення користувачів...');
  const [admin, diver] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Адміністратор',
        email: 'admin@ocean.dev',
        passwordHash: await bcrypt.hash('Admin12345', 12),
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Дослідник',
        email: 'diver@ocean.dev',
        passwordHash: await bcrypt.hash('Diver12345', 12),
        role: Role.USER,
      },
    }),
  ]);

  console.log('Створення мешканців та питань...');
  let questionCount = 0;
  for (const creature of seedCreatures) {
    const questions = buildQuestionPool(creature, seedCreatures);
    questionCount += questions.length;

    await prisma.creature.create({
      data: {
        name: creature.name,
        latinName: creature.latinName,
        description: creature.description,
        diet: creature.diet,
        size: creature.size,
        weight: creature.weight,
        lifespan: creature.lifespan,
        habitat: creature.habitat,
        imageUrl: creature.imageUrl,
        depth: creature.depth,
        motion: creature.motion,
        questions: { create: questions },
      },
    });
  }

  console.log('\nБазу заповнено:');
  console.log(`  мешканців: ${seedCreatures.length}`);
  console.log(`  питань:    ${questionCount} (по ${questionCount / seedCreatures.length} на мешканця)`);
  console.log('\nТестові акаунти:');
  console.log(`  ${admin.email} / Admin12345  (роль ADMIN)`);
  console.log(`  ${diver.email} / Diver12345  (роль USER)`);
}

main()
  .catch((err) => {
    console.error('Помилка наповнення бази:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
