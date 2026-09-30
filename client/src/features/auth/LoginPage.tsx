import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearError, login } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="center-box">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Вхід</h1>
        <p className="muted">Увійдіть, щоб зберігати прогрес і накопичувати бали.</p>

        {error && <div className="alert">{error}</div>}

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
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" className="btn" style={{ width: '100%' }} disabled={status === 'loading'}>
          {status === 'loading' ? 'Входимо…' : 'Увійти'}
        </button>

        <p className="auth-card__switch">
          Ще немає акаунта? <Link to="/register">Зареєструватися</Link>
        </p>

        <div className="auth-demo">
          Демо-акаунти після <code>npm run seed</code>:
          <br />
          адміністратор — <code>admin@ocean.dev</code> / <code>Admin12345</code>
          <br />
          користувач — <code>diver@ocean.dev</code> / <code>Diver12345</code>
        </div>
      </form>
    </div>
  );
}
