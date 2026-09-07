import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './styles/doom-ui.css';
import { BootScreen } from './components/BootScreen';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BootScreen />
  </StrictMode>,
);
