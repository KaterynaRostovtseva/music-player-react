import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './redux/store';
import { Provider } from 'react-redux';

async function enableMocking() {
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: {
      url: '/mockServiceWorker.js', 
    }
  });
}

const clearPersistedStateIfNeeded = () => {
  try {
    const persistKey = 'persist:root';
    const persistedStateRaw = localStorage.getItem(persistKey);
    
    if (persistedStateRaw) {
      const persistedState = JSON.parse(persistedStateRaw);

      if (persistedState && persistedState.persistedReducer) {
        try {
          const persistedReducer = JSON.parse(persistedState.persistedReducer);

          if (persistedReducer.player) {
            delete persistedReducer.player;
          }
          if (persistedReducer.search) {
            delete persistedReducer.search;
          }

          persistedState.persistedReducer = JSON.stringify(persistedReducer);
          
          try {
            localStorage.setItem(persistKey, JSON.stringify(persistedState));
          } catch (quotaError) {
            console.warn('Перевищена квота localStorage, очищаємо persist:root');
            localStorage.removeItem(persistKey);
          }
        } catch (innerErr) {
          console.warn('Не вдалося розпарити persistedReducer, видаляю persist:root:', innerErr);
          localStorage.removeItem(persistKey);
        }
      }
    }
  } catch (error) {
    console.error('Помилка при обробці persisted state:', error);
    try {
      localStorage.removeItem('persist:root');
    } catch (e) {
      console.error('Не вдалося очистити localStorage:', e);
    }
  }
};

clearPersistedStateIfNeeded();

enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  
  reportWebVitals();
});
