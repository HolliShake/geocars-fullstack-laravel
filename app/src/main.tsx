import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global Style
import './index.css';

// Root app
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
