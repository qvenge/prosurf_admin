import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { CalendarPage } from '@/pages/calendar';
import { LoginPage } from '@/pages/login';
import { BookingsPage } from '@/pages/bookings';
import { TrainingsPage } from '@/pages/trainings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { 
        index: true,
        Component: CalendarPage
      },
      {
        path: 'bookings',
        Component: BookingsPage
      },
      {
        path: 'users',
        Component: BookingsPage
      },
      {
        path: 'trainings',
        Component: TrainingsPage
      },
      {
        path: 'season-tickets',
        Component: BookingsPage
      },
      {
        path: 'certificates',
        Component: BookingsPage
      },
      {
        path: 'events',
        Component: BookingsPage
      },
      {
        path: 'settings',
        Component: BookingsPage
      },
      {
        path: 'login',
        Component: LoginPage
      },
    ],
  },
]);