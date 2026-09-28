import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const score = user?.score ?? 0;
  const previousScore = useRef(score);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const grew = score > previousScore.current;
    previousScore.current = score;
    if (!grew) return undefined;

    setBump(true);
    const timer = window.setTimeout(() => setBump(false), 600);
    return () => window.clearTimeout(timer);
  }, [score]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/" className="header__logo">
        <span aria-hidden="true">🌊</span>
        Deep Ocean Explorer
      </Link>

      <nav className="header__nav">
        <NavLink
          to="/"
          className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
        >
          Занурення
        </NavLink>

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
          >
            Адмін-панель
          </NavLink>
        )}

        {user ? (
          <>
            <span className={`score-badge ${bump ? 'score-badge--bump' : ''}`} title="Загальний рахунок">
              <span aria-hidden="true">⭐</span>
              <span className="score-badge__value">{score}</span>
            </span>
            <span className="user-chip">
              {user.name}
              {user.role === 'ADMIN' && <span className="user-chip__role">admin</span>}
            </span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
              Вийти
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="header__link">
              Вхід
            </NavLink>
            <Link to="/register" className="btn btn--sm">
              Реєстрація
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
