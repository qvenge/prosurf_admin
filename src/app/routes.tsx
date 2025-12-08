import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { RootLayout } from '@/widgets/root-layout';
import { LoginPage } from '@/pages/login';
import { SessionsPage } from '@/pages/sessions';
import { UsersPage } from '@/pages/users';
import { SettingsPage } from '@/pages/settings';
import { TemplatesPage } from '@/pages/templates';
import { CertificatesPage } from '@/pages/certificates';

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
            path: 'certificates',
            Component: CertificatesPage
          },
          {
            path: 'settings',
            Component: SettingsPage
          },
        ],
      },
    ],
  },
], {
  basename: import.meta.env.BASE_URL,
});