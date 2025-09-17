import { createBrowserRouter } from 'react-router';
import { App } from './ui/App';

import { CalendarPage } from '@/pages/calendar';
import { LoginPage } from '@/pages/login';
import { BookingsPage } from '@/pages/bookings';

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
        path: 'login',
        Component: LoginPage
      }
    ],
  },
]);