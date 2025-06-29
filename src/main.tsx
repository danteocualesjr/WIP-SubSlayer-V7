import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Disable React Strict Mode to prevent double rendering that can cause blinking
createRoot(document.getElementById('root')!).render(
  <App />
);