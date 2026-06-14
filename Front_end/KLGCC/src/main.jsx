import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './SRC CSS files/index.css';
import App from './App.jsx';
import Providers from "./provider.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>  
  </StrictMode>
)
