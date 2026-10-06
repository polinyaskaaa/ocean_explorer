const BASE = 'http://localhost:4000/api';
let failures = 0;

function check(label, condition, extra = '') {
  const mark = condition ? 'PASS' : 'FAIL';
  if (!condition) failures += 1;
  console.log(`[${mark}] ${label}${extra ? ' — ' + extra : ''}`);
}

async function call(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
  return { status: res.status, json };
}

const run = async () => {
  const email = `test_${Date.now()}@ocean.dev`;
  const weak = await call('/auth/register', { method: 'POST', body: { name: 'T', email, password: '123' } });
  check('Реєстрація зі слабким паролем відхилена', weak.status === 400, `status=${weak.status}`);

  const reg = await call('/auth/register', {
    method: 'POST',
    body: { name: 'Тестовий Дослідник', email, password: 'Test12345' },
  });
  check('Реєстрація успішна', reg.status === 201 && !!reg.json?.token, `status=${reg.status}`);
  check('Роль нового користувача — USER', reg.json?.user?.role === 'USER');
  check('Стартовий рахунок = 0', reg.json?.user?.score === 0);

  const dup = await call('/auth/register', {
    method: 'POST',
    body: { name: 'Дубль', email, password: 'Test12345' },
  });
  check('Повторний email відхилено (409)', dup.status === 409, `status=${dup.status}`);

  const userToken = reg.json.token;

  const badLogin = await call('/auth/login', { method: 'POST', body: { email, password: 'WrongPass1' } });
  check('Вхід із хибним паролем відхилено (401)', badLogin.status === 401, `status=${badLogin.status}`);

  const noAuthAdmin = await call('/admin/creatures');
  check('Адмін-API без токена → 401', noAuthAdmin.status === 401, `status=${noAuthAdmin.status}`);

  const userAdmin = await call('/admin/creatures', { token: userToken });
  check('Адмін-API з роллю USER → 403', userAdmin.status === 403, `status=${userAdmin.status}`);

  const admin = await call('/auth/login', {
    method: 'POST',
    body: { email: 'admin@ocean.dev', password: 'Admin12345' },
  });
  check('Вхід адміністратора', admin.status === 200 && admin.json?.user?.role === 'ADMIN');
  const adminToken = admin.json.token;

  const { json: list } = await call('/creatures');
  const creature = list.creatures[0];
  const initialCount = list.creatures.length;

  const quizNoAuth = await call(`/quiz/${creature.id}`);
  check('Квіз без авторизації → 401', quizNoAuth.status === 401, `status=${quizNoAuth.status}`);

  const quiz = await call(`/quiz/${creature.id}`, { token: userToken });
  check('Квіз видає рівно 3 питання', quiz.json?.questions?.length === 3, `got=${quiz.json?.questions?.length}`);
  check('Потрібно 2 правильні з 3', quiz.json?.requiredCorrect === 2, `got=${quiz.json?.requiredCorrect}`);
  const leaks = JSON.stringify(quiz.json).includes('correctIndex');
  check('Правильні відповіді не потрапляють у відповідь API', !leaks);

  const partial = await call(`/quiz/${creature.id}/submit`, {
    method: 'POST',
    token: userToken,
    body: { answers: [{ questionId: quiz.json.questions[0].id, optionIndex: 0 }] },
  });
  check('Неповна спроба (1 відповідь із 3) відхилена', partial.status === 400, `status=${partial.status}`);

  const adminView = await call(`/admin/creatures/${creature.id}`, { token: adminToken });
  const answerKey = Object.fromEntries(
    adminView.json.creature.questions.map((q) => [q.id, q.correctIndex]),
  );

  const ids = quiz.json.questions.map((q) => q.id);
  const wrongFor = (qid) => {
    const q = quiz.json.questions.find((x) => x.id === qid);
    return (answerKey[qid] + 1) % q.options.length;
  };
  const failAttempt = await call(`/quiz/${creature.id}/submit`, {
    method: 'POST',
    token: userToken,
    body: {
      answers: [
        { questionId: ids[0], optionIndex: answerKey[ids[0]] },
        { questionId: ids[1], optionIndex: wrongFor(ids[1]) },
        { questionId: ids[2], optionIndex: wrongFor(ids[2]) },
      ],
    },
  });
  check('2 помилки з 3 → квіз не пройдено', failAttempt.json?.passed === false, `correct=${failAttempt.json?.correctCount}`);
  check('Бал за провал не нараховано', failAttempt.json?.awardedPoint === false);

  const passAttempt = await call(`/quiz/${creature.id}/submit`, {
    method: 'POST',
    token: userToken,
    body: {
      answers: [
        { questionId: ids[0], optionIndex: answerKey[ids[0]] },
        { questionId: ids[1], optionIndex: answerKey[ids[1]] },
        { questionId: ids[2], optionIndex: wrongFor(ids[2]) },
      ],
    },
  });
  check('1 помилка з 3 → квіз пройдено', passAttempt.json?.passed === true, `correct=${passAttempt.json?.correctCount}`);
  check('Нараховано 1 бал', passAttempt.json?.awardedPoint === true && passAttempt.json?.totalScore === 1,
    `score=${passAttempt.json?.totalScore}`);

  const again = await call(`/quiz/${creature.id}/submit`, {
    method: 'POST',
    token: userToken,
    body: {
      answers: ids.map((id) => ({ questionId: id, optionIndex: answerKey[id] })),
    },
  });
  check('Повторний успіх не додає бал', again.json?.awardedPoint === false && again.json?.totalScore === 1,
    `score=${again.json?.totalScore}`);

  const otherQuiz = await call(`/quiz/${list.creatures[1].id}`, { token: userToken });
  const mixed = await call(`/quiz/${creature.id}/submit`, {
    method: 'POST',
    token: userToken,
    body: { answers: [{ questionId: otherQuiz.json.questions[0].id, optionIndex: 0 }] },
  });
  check('Питання іншого мешканця відхилено (400)', mixed.status === 400, `status=${mixed.status}`);

  const progress = await call('/progress', { token: userToken });
  check('Прогрес повертає рахунок 1', progress.json?.user?.score === 1);
  check('Прогрес містить пройденого мешканця', progress.json?.completedCreatureIds?.includes(creature.id));

  const invalid = await call('/admin/creatures', {
    method: 'POST',
    token: adminToken,
    body: { name: 'X', depth: 99999 },
  });
  check('Некоректні дані мешканця відхилено (400)', invalid.status === 400, `status=${invalid.status}`);

  const created = await call('/admin/creatures', {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Тестова риба',
      latinName: 'Testus fishus',
      description: 'Створено автоматичним тестом для перевірки CRUD.',
      diet: 'Тестові дані',
      size: '1 м',
      weight: '10 кг',
      lifespan: '5 років',
      habitat: 'Тестовий океан',
      imageUrl: '/creatures/lanternfish.svg',
      depth: 500,
      questions: [
        { text: 'Тестове питання номер один?', options: ['А', 'Б', 'В', 'Г'], correctIndex: 2 },
        { text: 'Тестове питання номер два?', options: ['А', 'Б', 'В', 'Г'], correctIndex: 0 },
        { text: 'Тестове питання номер три?', options: ['А', 'Б', 'В', 'Г'], correctIndex: 1 },
      ],
    },
  });
  check('Мешканця створено', created.status === 201 && created.json?.creature?.questions?.length === 3,
    `status=${created.status}`);
  check('Манера плавання за замовчуванням — GLIDE', created.json?.creature?.motion === 'GLIDE',
    String(created.json?.creature?.motion));
  const newId = created.json.creature.id;

  const updated = await call(`/admin/creatures/${newId}`, {
    method: 'PUT',
    token: adminToken,
    body: {
      name: 'Тестова риба (оновлено)',
      depth: 900,
      motion: 'PULSE',
      questions: [
        { text: 'Оновлене питання один?', options: ['1', '2', '3'], correctIndex: 1 },
        { text: 'Оновлене питання два?', options: ['1', '2', '3'], correctIndex: 2 },
        { text: 'Оновлене питання три?', options: ['1', '2', '3'], correctIndex: 0 },
      ],
    },
  });
  check('Мешканця оновлено', updated.json?.creature?.depth === 900 && updated.json?.creature?.name.includes('оновлено'));
  check('Манеру плавання збережено', updated.json?.creature?.motion === 'PULSE',
    String(updated.json?.creature?.motion));

  const badMotion = await call(`/admin/creatures/${newId}`, {
    method: 'PUT', token: adminToken, body: { motion: 'FLYING' },
  });
  check('Невідому манеру плавання відхилено (400)', badMotion.status === 400, `status=${badMotion.status}`);

  const publicCreature = (await call('/creatures')).json.creatures.find((c) => c.id === newId);
  check('Манера плавання доступна публічно', publicCreature?.motion === 'PULSE',
    String(publicCreature?.motion));
  check('Питання замінено новим набором', updated.json?.creature?.questions?.length === 3 &&
    updated.json.creature.questions[0].text.startsWith('Оновлене'));

  const publicList = await call('/creatures');
  check('Новий мешканець видимий публічно', publicList.json.creatures.some((c) => c.id === newId));

  const removed = await call(`/admin/creatures/${newId}`, { method: 'DELETE', token: adminToken });
  check('Мешканця видалено (204)', removed.status === 204, `status=${removed.status}`);

  const afterDelete = await call('/creatures');
  check('Після видалення запис зник', !afterDelete.json.creatures.some((c) => c.id === newId));
  check('Кількість мешканців повернулась до початкової', afterDelete.json.creatures.length === initialCount,
    `${afterDelete.json.creatures.length} з ${initialCount}`);

  console.log(`\n${failures === 0 ? 'УСІ ПЕРЕВІРКИ ПРОЙДЕНО' : failures + ' ПЕРЕВІРОК ПРОВАЛЕНО'}`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error('Помилка тесту:', err);
  process.exit(1);
});
