import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { closeCreature } from '../../store/creaturesSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetQuiz, startQuiz } from '../../store/quizSlice';
import { formatDepth } from '../../lib/ocean';
import QuizPanel from '../quiz/QuizPanel';

export default function CreatureModal() {
  const dispatch = useAppDispatch();
  const creature = useAppSelector((state) =>
    state.creatures.items.find((item) => item.id === state.creatures.selectedId),
  );
  const user = useAppSelector((state) => state.auth.user);
  const quizStatus = useAppSelector((state) => state.quiz.status);
  const quizCreatureId = useAppSelector((state) => state.quiz.session?.creatureId);

  const close = () => {
    dispatch(closeCreature());
    dispatch(resetQuiz());
  };

  useEffect(() => {
    if (!creature) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [creature?.id]);

  if (!creature) return null;

  const quizActive = quizCreatureId === creature.id && quizStatus !== 'idle';

  const facts: [string, string][] = [
    ['Глибина', formatDepth(creature.depth)],
    ['Раціон', creature.diet],
    ['Розмір', creature.size],
    ['Вага', creature.weight],
    ['Тривалість життя', creature.lifespan],
    ['Ареал', creature.habitat],
  ];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={creature.name} onClick={close}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal__close" onClick={close} aria-label="Закрити">
          ×
        </button>

        <div className="modal__hero">
          <div className="modal__image">
            <img src={creature.imageUrl} alt={creature.name} />
          </div>
          <div>
            <h2>{creature.name}</h2>
            {creature.latinName && <div className="modal__latin">{creature.latinName}</div>}
            <p>{creature.description}</p>
          </div>
        </div>

        <dl className="modal__facts">
          {facts.map(([label, value]) => (
            <div className="modal__fact" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="modal__section">
          {!user ? (
            <div className="alert alert--info">
              Щоб пройти квіз і отримати бал, <Link to="/login">увійдіть</Link> або{' '}
              <Link to="/register">зареєструйтеся</Link>.
            </div>
          ) : creature.questionCount === 0 ? (
            <div className="alert alert--info">Для цього мешканця ще не додано питань.</div>
          ) : quizActive ? (
            <QuizPanel creatureId={creature.id} />
          ) : (
            <>
              <h3>Перевірити знання</h3>
              <p className="muted">
                {`3 випадкові питання з ${creature.questionCount}. Бал зараховується, якщо ви припустилися не більше однієї помилки.`}
              </p>
              <button type="button" className="btn" onClick={() => dispatch(startQuiz(creature.id))}>
                Пройти квіз
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
