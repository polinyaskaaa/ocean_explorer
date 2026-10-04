import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DivePage from './features/dive/DivePage';
import { useAppDispatch } from './store/hooks';
import { restoreSession } from './store/authSlice';
import { fetchCreatures } from './store/creaturesSlice';

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
        <Route path="/" element={<DivePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
