import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearError, register } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      setLocalError('Пароль має містити щонайменше 8 символів');
      return;
    }
    if (password !== repeat) {
      setLocalError('Паролі не збігаються');
      return;
    }

    setLocalError(null);
    dispatch(register({ name, email, password }));
  };

  return (
    <div className="center-box">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Реєстрація</h1>
        <p className="muted">Створіть акаунт — прогрес привʼяжеться до вашого профілю.</p>

        {(localError ?? error) && <div className="alert">{localError ?? error}</div>}

        <div className="field">
          <label htmlFor="name">Імʼя</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="repeat">Повторіть пароль</label>
          <input
            id="repeat"
            type="password"
            autoComplete="new-password"
            required
            value={repeat}
            onChange={(event) => setRepeat(event.target.value)}
          />
        </div>

        <button type="submit" className="btn" style={{ width: '100%' }} disabled={status === 'loading'}>
          {status === 'loading' ? 'Створюємо…' : 'Створити акаунт'}
        </button>

        <p className="auth-card__switch">
          Уже маєте акаунт? <Link to="/login">Увійти</Link>
        </p>
      </form>
    </div>
  );
}
