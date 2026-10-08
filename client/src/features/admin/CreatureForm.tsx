import { useState, type FormEvent } from 'react';
import {
  MOTION_HINTS,
  MOTION_LABELS,
  type AdminCreature,
  type CreaturePayload,
  type Motion,
} from '../../types';
import { MAX_DEPTH } from '../../lib/ocean';

const RECOMMENDED_QUESTIONS = 10;
const OPTIONS_PER_QUESTION = 4;
const MIN_QUESTIONS = 3;

interface QuestionDraft {
  text: string;
  options: string[];
  correctIndex: number;
}

interface Props {
  creature: AdminCreature | null;
  submitting: boolean;
  onSubmit: (payload: CreaturePayload) => void;
  onCancel: () => void;
}

function emptyQuestion(): QuestionDraft {
  return { text: '', options: Array.from({ length: OPTIONS_PER_QUESTION }, () => ''), correctIndex: 0 };
}

function initialQuestions(creature: AdminCreature | null): QuestionDraft[] {
  if (!creature || creature.questions.length === 0) {
    return Array.from({ length: RECOMMENDED_QUESTIONS }, emptyQuestion);
  }
  return creature.questions.map((question) => ({
    text: question.text,
    options: [...question.options],
    correctIndex: question.correctIndex,
  }));
}

export default function CreatureForm({ creature, submitting, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    name: creature?.name ?? '',
    latinName: creature?.latinName ?? '',
    description: creature?.description ?? '',
    diet: creature?.diet ?? '',
    size: creature?.size ?? '',
    weight: creature?.weight ?? '',
    lifespan: creature?.lifespan ?? '',
    habitat: creature?.habitat ?? '',
    imageUrl: creature?.imageUrl ?? '/creatures/lanternfish.svg',
    depth: creature?.depth ?? 100,
    motion: (creature?.motion ?? 'GLIDE') as Motion,
  });
  const [questions, setQuestions] = useState<QuestionDraft[]>(() => initialQuestions(creature));
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof typeof form, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setQuestion = (index: number, patch: Partial<QuestionDraft>) =>
    setQuestions((prev) => prev.map((question, i) => (i === index ? { ...question, ...patch } : question)));

  const setOption = (questionIndex: number, optionIndex: number, value: string) =>
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === questionIndex
          ? { ...question, options: question.options.map((option, j) => (j === optionIndex ? value : option)) }
          : question,
      ),
    );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const filled = questions.filter(
      (question) => question.text.trim() !== '' || question.options.some((option) => option.trim() !== ''),
    );

    const incomplete = filled.find(
      (question) => question.text.trim() === '' || question.options.some((option) => option.trim() === ''),
    );
    if (incomplete) {
      setError('У кожному заповненому питанні мають бути текст і всі чотири варіанти відповіді.');
      return;
    }

    if (filled.length > 0 && filled.length < MIN_QUESTIONS) {
      setError(`Питань має бути або жодного, або щонайменше ${MIN_QUESTIONS} — інакше квіз не збереться.`);
      return;
    }

    setError(null);
    onSubmit({
      ...form,
      latinName: form.latinName.trim() || undefined,
      depth: Number(form.depth),
      motion: form.motion,
      questions: filled.map((question) => ({
        text: question.text.trim(),
        options: question.options.map((option) => option.trim()),
        correctIndex: question.correctIndex,
      })),
    });
  };

  const filledCount = questions.filter((question) => question.text.trim() !== '').length;

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{creature ? `Редагування: ${creature.name}` : 'Новий мешканець'}</h2>

      {error && <div className="alert">{error}</div>}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Назва</label>
          <input
            id="name"
            required
            minLength={2}
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="latinName">Латинська назва</label>
          <input
            id="latinName"
            value={form.latinName}
            onChange={(event) => setField('latinName', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="depth">Глибина появи, м (0–{MAX_DEPTH})</label>
          <input
            id="depth"
            type="number"
            required
            min={0}
            max={MAX_DEPTH}
            value={form.depth}
            onChange={(event) => setField('depth', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="imageUrl">Зображення (URL або /creatures/…)</label>
          <input
            id="imageUrl"
            required
            value={form.imageUrl}
            onChange={(event) => setField('imageUrl', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="motion">Манера плавання у сцені</label>
          <select
            id="motion"
            value={form.motion}
            onChange={(event) => setField('motion', event.target.value)}
          >
            {(Object.keys(MOTION_LABELS) as Motion[]).map((motion) => (
              <option key={motion} value={motion}>
                {MOTION_LABELS[motion]} — {MOTION_HINTS[motion]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="diet">Раціон</label>
          <input id="diet" required value={form.diet} onChange={(event) => setField('diet', event.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="size">Розмір</label>
          <input id="size" required value={form.size} onChange={(event) => setField('size', event.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="weight">Вага</label>
          <input id="weight" required value={form.weight} onChange={(event) => setField('weight', event.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="lifespan">Тривалість життя</label>
          <input
            id="lifespan"
            required
            value={form.lifespan}
            onChange={(event) => setField('lifespan', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="habitat">Ареал</label>
          <input
            id="habitat"
            required
            value={form.habitat}
            onChange={(event) => setField('habitat', event.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Опис</label>
        <textarea
          id="description"
          required
          minLength={10}
          value={form.description}
          onChange={(event) => setField('description', event.target.value)}
        />
      </div>

      <div className="form-section-title">
        <h3 style={{ margin: 0 }}>Пул питань</h3>
        <span className={`badge ${filledCount >= RECOMMENDED_QUESTIONS ? 'badge--ok' : 'badge--warn'}`}>
          заповнено {filledCount} з {RECOMMENDED_QUESTIONS}
        </span>
      </div>
      <p className="form-hint">
        Для квізу сервер бере 3 випадкові питання з цього пулу. Позначте правильний варіант
        перемикачем праворуч від поля. Незаповнені блоки не збережуться.
      </p>

      {questions.map((question, questionIndex) => (
        <div className="question-editor" key={questionIndex}>
          <div className="question-editor__head">
            <span className="question-editor__index">Питання {questionIndex + 1}</span>
            {questions.length > MIN_QUESTIONS && (
              <button
                type="button"
                className="btn btn--danger btn--sm"
                onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== questionIndex))}
              >
                Видалити
              </button>
            )}
          </div>

          <div className="field">
            <input
              placeholder="Текст питання"
              value={question.text}
              onChange={(event) => setQuestion(questionIndex, { text: event.target.value })}
            />
          </div>

          {question.options.map((option, optionIndex) => (
            <div className="option-row" key={optionIndex}>
              <input
                type="text"
                placeholder={`Варіант ${String.fromCharCode(65 + optionIndex)}`}
                value={option}
                onChange={(event) => setOption(questionIndex, optionIndex, event.target.value)}
              />
              <label className="option-row__radio">
                <input
                  type="radio"
                  name={`correct-${questionIndex}`}
                  checked={question.correctIndex === optionIndex}
                  onChange={() => setQuestion(questionIndex, { correctIndex: optionIndex })}
                />
                правильна
              </label>
            </div>
          ))}
        </div>
      ))}

      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
      >
        + Додати питання
      </button>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Скасувати
        </button>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Зберігаємо…' : creature ? 'Зберегти зміни' : 'Створити мешканця'}
        </button>
      </div>
    </form>
  );
}
