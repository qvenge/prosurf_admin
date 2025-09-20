import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { RootLayout } from '@/widgets/root-layout';
import { CalendarPage } from '@/pages/calendar';
import { LoginPage } from '@/pages/login';
import { SessionsPage } from '@/pages/sessions';
import { TrainingsPage } from '@/pages/trainings';

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
            Component: CalendarPage
          },
          {
            path: 'trainings',
            Component: TrainingsPage
          },
          {
            path: 'season-tickets',
            Component: CalendarPage
          },
          {
            path: 'certificates',
            Component: CalendarPage
          },
          {
            path: 'events',
            Component: CalendarPage
          },
          {
            path: 'settings',
            Component: CalendarPage
          },
        ],
      },
    ],
  },
]);