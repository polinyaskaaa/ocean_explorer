import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { answerQuestion, startQuiz, submitQuiz } from '../../store/quizSlice';

export default function QuizPanel({ creatureId }: { creatureId: string }) {
  const dispatch = useAppDispatch();
  const { session, answers, result, status, error } = useAppSelector((state) => state.quiz);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'active' || status === 'finished') {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status, session?.questions]);

  if (status === 'loading') {
    return (
      <div ref={containerRef} className="center-box" style={{ minHeight: 160, padding: 0 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (status === 'failed' || !session) {
    return (
      <div ref={containerRef}>
        <div className="alert">{error ?? 'Не вдалося завантажити питання'}</div>
        <button type="button" className="btn btn--ghost" onClick={() => dispatch(startQuiz(creatureId))}>
          Спробувати ще раз
        </button>
      </div>
    );
  }

  if (status === 'finished' && result) {
    const resultById = new Map(result.results.map((item) => [item.questionId, item]));

    return (
      <div
        ref={containerRef}
        className={`quiz__result ${result.passed ? 'quiz__result--passed' : 'quiz__result--failed'}`}
      >
        <div className="quiz__result-score">
          {result.correctCount} / {result.totalQuestions}
        </div>
        <h3>{result.passed ? 'Квіз пройдено!' : 'Спробуйте ще раз'}</h3>
        <p className="muted">
          {result.awardedPoint
            ? 'Ви отримали 1 бал — загальний рахунок у хедері оновлено.'
            : result.passed
              ? 'Бал за цього мешканця вже був зарахований раніше.'
              : `Щоб отримати бал, потрібно ${session.requiredCorrect} правильні відповіді з ${session.totalQuestions}.`}
        </p>

        <div style={{ textAlign: 'left', marginTop: 18 }}>
          {session.questions.map((question, index) => {
            const outcome = resultById.get(question.id);
            return (
              <div className="quiz__question" key={question.id}>
                <div className="quiz__question-text">
                  {index + 1}. {question.text}
                </div>
                <div className="quiz__options">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = outcome?.correctIndex === optionIndex;
                    const isWrongChoice = outcome?.selectedIndex === optionIndex && !outcome.correct;
                    return (
                      <div
                        key={optionIndex}
                        className={`quiz__option ${isCorrect ? 'quiz__option--correct' : ''} ${
                          isWrongChoice ? 'quiz__option--wrong' : ''
                        }`}
                      >
                        <span className="quiz__marker">{isCorrect ? '✓' : isWrongChoice ? '×' : ''}</span>
                        {option}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="quiz__actions">
          <button type="button" className="btn" onClick={() => dispatch(startQuiz(creatureId))}>
            Пройти ще раз
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = session.questions.filter((question) => answers[question.id] !== undefined).length;
  const allAnswered = answeredCount === session.questions.length;
  const submitting = status === 'submitting';

  return (
    <div ref={containerRef}>
      <div className="quiz__head">
        <h3 style={{ margin: 0 }}>Квіз: {session.creatureName}</h3>
        <span className="quiz__counter">
          Відповіді: {answeredCount} / {session.totalQuestions} · для балу потрібно{' '}
          {session.requiredCorrect} правильних
        </span>
      </div>

      {error && <div className="alert">{error}</div>}

      {session.questions.map((question, index) => (
        <div className="quiz__question" key={question.id}>
          <div className="quiz__question-text">
            {index + 1}. {question.text}
          </div>
          <div className="quiz__options">
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex;
              return (
                <button
                  type="button"
                  key={optionIndex}
                  className={`quiz__option ${selected ? 'quiz__option--selected' : ''}`}
                  disabled={submitting}
                  onClick={() => dispatch(answerQuestion({ questionId: question.id, optionIndex }))}
                >
                  <span className="quiz__marker">{String.fromCharCode(65 + optionIndex)}</span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="quiz__actions">
        <button
          type="button"
          className="btn"
          disabled={!allAnswered || submitting}
          onClick={() => dispatch(submitQuiz())}
        >
          {submitting ? 'Перевіряємо…' : 'Завершити квіз'}
        </button>
      </div>
    </div>
  );
}
