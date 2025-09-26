import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { RootLayout } from '@/widgets/root-layout';
import { CalendarPage } from '@/pages/calendar';
import { LoginPage } from '@/pages/login';
import { SessionsPage } from '@/pages/sessions';
import { TrainingsPage } from '@/pages/trainings';
import { ToursAndActivityPage } from '@/pages/tours-and-activity';
import { UsersPage } from '@/pages/users';
import { SeasonTicketsPage } from '@/pages/season-tickets';

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
            path: 'trainings',
            Component: TrainingsPage
          },
          {
            path: 'season-tickets',
            Component: SeasonTicketsPage
          },
          {
            path: 'certificates',
            Component: CalendarPage
          },
          {
            path: 'events',
            Component: ToursAndActivityPage
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