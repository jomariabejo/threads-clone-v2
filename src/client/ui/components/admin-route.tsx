import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import { type RootState } from '@/client/redux/store';
import { ROUTES } from '@/client/utilities/constants';

export const AdminRoute = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const role = useSelector((state: RootState) => state.auth.user?.role);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (role !== 'ADMIN') {
    return <Navigate to={ROUTES.FEED} replace />;
  }

  return <Outlet />;
};
