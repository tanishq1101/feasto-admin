import {ClerkProvider} from '@clerk/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider afterSignOutUrl="/">
<BrowserRouter>
      <App />
    </BrowserRouter>
</ClerkProvider>
  </StrictMode>
);