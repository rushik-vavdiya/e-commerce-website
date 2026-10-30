import StoreProvider from './app/StoreProvider.jsx'
import { ToastProvider } from './components/notifications/index.js'

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Every word and image comes from src/data/siteContent.json, so the app can
// render straight away with no content request in front of it.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      {/* Above the router, so a notification survives a navigation. */}
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  </React.StrictMode>
);
