import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global Style
import './index.css';
// Leaflet map styles (must be imported as a JS side-effect so Vite resolves from node_modules)
import 'leaflet/dist/leaflet.css';

// Root app
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
