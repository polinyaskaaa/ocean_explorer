import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, initializing } = useAppSelector((state) => state.auth);

  if (initializing) {
    return (
      <div className="center-box">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;

  if (user.role !== 'ADMIN') {
    return (
      <div className="page">
        <div className="card">
          <h1>Доступ обмежено</h1>
          <p className="muted">
            Адмін-панель доступна лише користувачам із роллю <strong>Admin</strong>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
