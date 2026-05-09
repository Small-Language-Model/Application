import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Model from './pages/Model';
import Pricing from './pages/Pricing';
import Guide from './pages/Guide';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/login',
    element: <Layout><Login /></Layout>,
  },
  {
    path: '/register',
    element: <Layout><Register /></Layout>,
  },
  {
    path: '/model',
    element: <Layout><Model /></Layout>,
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
    element: <Layout><Chat /></Layout>,
  },
  {
    path: '/admin',
    element: <Layout><Admin /></Layout>,
  },
  {
    path: '*',
    element: <Layout><NotFound /></Layout>,
  },
]);
