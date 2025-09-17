import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router';
import { StrictMode } from 'react';
import { ApiProvider } from '@/shared/api';

import { router } from './routes';

import './index.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiProvider>
      <RouterProvider router={router} />
    </ApiProvider>
  </StrictMode>
);
