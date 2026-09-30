import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import { useAppDispatch } from './store/hooks';
import { restoreSession } from './store/authSlice';
import { fetchCreatures } from './store/creaturesSlice';

function Placeholder() {
  return (
    <main className="center-box">
      <p className="muted">Сцена занурення в розробці.</p>
    </main>
  );
}

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCreatures());
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Placeholder />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
