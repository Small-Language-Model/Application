import { createBrowserRouter, Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Model from './pages/Model';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Guide from './pages/Guide';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { useAuth } from './contexts/AuthContext';
import GoogleAuthCallback from './pages/GoogleAuthCallback';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;
  if (user) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/chat';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/login',
    element: <Layout><PublicOnly><Login /></PublicOnly></Layout>,
  },
  {
    path: '/register',
    element: <Layout><PublicOnly><Register /></PublicOnly></Layout>,
  },
  {
    path: '/model',
    element: <Layout><Model /></Layout>,
  },
  {
    path: '/about',
    element: <Layout><About /></Layout>,
  },
  {
    path: '/pricing',
    element: <Layout><Pricing /></Layout>,
  },
  {
    path: '/guide',
    element: <Layout><Guide /></Layout>,
  },
  {
    path: '/chat',
    element: <Layout><RequireAuth><Chat /></RequireAuth></Layout>,
  },
  {
    path: '/settings',
    element: <Layout><RequireAuth><Settings /></RequireAuth></Layout>,
  },
  {
    path: '/admin',
    element: <Layout><RequireAuth><Admin /></RequireAuth></Layout>,
  },
  {
    path: '/auth/google/callback',
    element: <Layout><GoogleAuthCallback /></Layout>,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
]);
