import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { RootLayout } from '@/widgets/root-layout';
import { CalendarPage } from '@/pages/calendar';
import { LoginPage } from '@/pages/login';
import { SessionsPage } from '@/pages/sessions';
import { UsersPage } from '@/pages/users';
import { SettingsPage } from '@/pages/settings';
import { TemplatesPage } from '@/pages/templates';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        path: 'login',
        Component: LoginPage
      },
      {
        Component: RootLayout,
        children: [
          {
            index: true,
            Component: CalendarPage
          },
          {
            path: 'sessions',
            Component: SessionsPage
          },
          {
            path: 'users',
            Component: UsersPage
          },
          {
            path: 'templates',
            Component: TemplatesPage
          },
          {
            path: 'settings',
            Component: SettingsPage
          },
        ],
      },
    ],
  },
]);