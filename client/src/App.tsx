import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import RequireAdmin from './components/RequireAdmin';
import AdminPage from './features/admin/AdminPage';
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
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
