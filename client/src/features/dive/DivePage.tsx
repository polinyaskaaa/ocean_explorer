import { useAppSelector } from '../../store/hooks';
import CreatureModal from './CreatureModal';
import DiveScene from './DiveScene';

export default function DivePage() {
  const { status, error } = useAppSelector((state) => state.creatures);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="center-box">
        <div className="spinner" />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="center-box">
        <div className="card" style={{ maxWidth: 480 }}>
          <h1>Океан недоступний</h1>
          <p className="muted">{error}</p>
          <p className="muted">
            Переконайтеся, що запущені база даних (<code>npm run db:up</code>) і сервер
            (<code>npm run dev</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DiveScene />
      <CreatureModal />
    </>
  );
}
