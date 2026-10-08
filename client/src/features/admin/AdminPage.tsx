import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../api/client';
import { adminApi } from '../../api/endpoints';
import { formatDepth } from '../../lib/ocean';
import { fetchCreatures } from '../../store/creaturesSlice';
import { useAppDispatch } from '../../store/hooks';
import type { AdminCreature, CreaturePayload } from '../../types';
import CreatureForm from './CreatureForm';

type Mode = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; creature: AdminCreature };

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const [creatures, setCreatures] = useState<AdminCreature[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { creatures: items } = await adminApi.list();
      setCreatures(items);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося завантажити список');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const afterChange = async (message: string) => {
    setNotice(message);
    setMode({ kind: 'list' });
    await load();
    dispatch(fetchCreatures());
  };

  const handleSubmit = async (payload: CreaturePayload) => {
    setSubmitting(true);
    setError(null);
    try {
      if (mode.kind === 'edit') {
        await adminApi.update(mode.creature.id, payload);
        await afterChange(`Мешканця «${payload.name}» оновлено`);
      } else {
        await adminApi.create(payload);
        await afterChange(`Мешканця «${payload.name}» додано`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося зберегти зміни');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (creature: AdminCreature) => {
    if (!window.confirm(`Видалити «${creature.name}» разом із питаннями? Дію не можна скасувати.`)) return;

    try {
      await adminApi.remove(creature.id);
      await afterChange(`Мешканця «${creature.name}» видалено`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося видалити запис');
    }
  };

  if (mode.kind !== 'list') {
    return (
      <div className="page">
        {error && <div className="alert">{error}</div>}
        <CreatureForm
          creature={mode.kind === 'edit' ? mode.creature : null}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setMode({ kind: 'list' })}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="admin__head">
        <div>
          <h1 style={{ marginBottom: 4 }}>Адмін-панель</h1>
          <p className="muted" style={{ margin: 0 }}>
            Керування мешканцями океану та їхніми питаннями
          </p>
        </div>
        <button type="button" className="btn" onClick={() => setMode({ kind: 'create' })}>
          + Додати мешканця
        </button>
      </div>

      {error && <div className="alert">{error}</div>}
      {notice && <div className="alert alert--info">{notice}</div>}

      <div className="card">
        {loading ? (
          <div className="center-box" style={{ minHeight: 160, padding: 0 }}>
            <div className="spinner" />
          </div>
        ) : creatures.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Список порожній. Додайте першого мешканця або виконайте <code>npm run seed</code>.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th />
                <th>Назва</th>
                <th>Глибина</th>
                <th>Питань</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {creatures.map((creature) => (
                <tr key={creature.id}>
                  <td>
                    <img className="admin-table__thumb" src={creature.imageUrl} alt="" />
                  </td>
                  <td>
                    <strong>{creature.name}</strong>
                    {creature.latinName && (
                      <div className="muted" style={{ fontStyle: 'italic', fontSize: 14 }}>
                        {creature.latinName}
                      </div>
                    )}
                  </td>
                  <td>{formatDepth(creature.depth)}</td>
                  <td>
                    <span className={`badge ${creature.questions.length >= 10 ? 'badge--ok' : 'badge--warn'}`}>
                      {creature.questions.length}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setMode({ kind: 'edit', creature })}
                      >
                        Редагувати
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => handleDelete(creature)}
                      >
                        Видалити
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
