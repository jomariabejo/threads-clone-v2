import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from './redux/store';
import { useEffect, lazy, Suspense } from 'react';
import { initPreferences } from './redux/preferences-actions';
import { initAuth } from './redux/auth-actions';
import { ErrorPage } from './ui/components/error-page';
import { LoadingSpinner } from './ui/components/loading-spinner';
import { LoadingFallback } from './ui/components/loading-fallback';
import { ScrollToTop } from './ui/components/scroll-to-top';
import { ProtectedRoute } from './ui/components/protected-route';
import { AdminRoute } from './ui/components/admin-route';
import { ROUTES } from './utilities/constants';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AppLayout = lazy(() => import('./ui/layout/app-layout').then(m => ({ default: m.AppLayout })));
const AdminLayout = lazy(() => import('./ui/layout/admin-layout').then(m => ({ default: m.AdminLayout })));
const Feed = lazy(() => import('./pages/Feed'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Create = lazy(() => import('./pages/Create'));
const Search = lazy(() => import('./pages/Search'));
const Activity = lazy(() => import('./pages/Activity'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const ProfileUser = lazy(() => import('./pages/ProfileUser'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminPosts = lazy(() => import('./pages/AdminPosts'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const NotFound = lazy(() => import('./pages/NotFound'));

const HomeRedirect = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  return <Navigate to={token ? ROUTES.FEED : ROUTES.LOGIN} replace />;
};

const App = () => {
  const { loading, error } = useSelector((state: RootState) => state.preferences);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    void dispatch(initPreferences()).unwrap().then(preferences => {
      void dispatch(initAuth(preferences.encryptionKey));
    });
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorPage message={error} />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path={ROUTES.HOME} element={<HomeRedirect />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.FEED} element={<Feed />} />
              <Route path={ROUTES.POST_DETAIL} element={<PostDetail />} />
              <Route path={ROUTES.CREATE} element={<Create />} />
              <Route path={ROUTES.SEARCH} element={<Search />} />
              <Route path={ROUTES.ACTIVITY} element={<Activity />} />
              <Route path={ROUTES.PROFILE} element={<Profile />} />
              <Route path={ROUTES.PROFILE_EDIT} element={<ProfileEdit />} />
              <Route path={ROUTES.PROFILE_USER} element={<ProfileUser />} />
            </Route>
          </Route>
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
              <Route path={ROUTES.ADMIN_USERS} element={<AdminUsers />} />
              <Route path={ROUTES.ADMIN_POSTS} element={<AdminPosts />} />
              <Route path={ROUTES.ADMIN_REPORTS} element={<AdminReports />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export default App;
