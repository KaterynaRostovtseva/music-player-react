import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './redux/store';
import { Provider } from 'react-redux';

// MSW initialization для работы без бэкенда (development и production на Vercel)
// async function enableMocking() {
//   if (process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL) {
//     const { worker } = await import('./mocks/browser');
//     return worker.start({
//       onUnhandledRequest: 'bypass',
//       serviceWorker: {
//         url: '/mockServiceWorker.js',
//       },
//     });
//   }
// }
async function enableMocking() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true, // Suppress MSW verbose logging
    });
  }
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

          // Удаляем большие данные (player и search)
          if (persistedReducer.player) {
            delete persistedReducer.player;
          }
          if (persistedReducer.search) {
            delete persistedReducer.search;
          }

          // Сохраняем только auth
          persistedState.persistedReducer = JSON.stringify(persistedReducer);
          
          try {
            localStorage.setItem(persistKey, JSON.stringify(persistedState));
            console.log('Очищены большие данные из persisted state');
          } catch (quotaError) {
            // Если все еще превышена квота, удаляем все
            console.warn('Превышена квота localStorage, очищаем persist:root');
            localStorage.removeItem(persistKey);
          }
        } catch (innerErr) {
          console.warn('Не удалось распарсить persistedReducer, удаляю persist:root:', innerErr);
          localStorage.removeItem(persistKey);
        }
      }
    }
  } catch (error) {
    console.error('Ошибка при обработке persisted state:', error);
    // В случае ошибки очищаем localStorage
    try {
      localStorage.removeItem('persist:root');
    } catch (e) {
      console.error('Не удалось очистить localStorage:', e);
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
