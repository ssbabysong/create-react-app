import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '@fontsource/zcool-kuaile/chinese-simplified-400.css';
import '@fontsource/zcool-kuaile/latin-400.css';
import 'lxgw-wenkai-screen-webfont/lxgwwenkaigbscreen.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
