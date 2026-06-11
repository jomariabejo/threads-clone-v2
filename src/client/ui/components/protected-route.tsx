import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import { type RootState } from '@/client/redux/store';
import { ROUTES } from '@/client/utilities/constants';

export const ProtectedRoute = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};
