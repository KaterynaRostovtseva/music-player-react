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
    });
  }
}

// Очистка старого состояния Redux-persist из localStorage
if (localStorage.getItem('persist:root')) {
  try {
    const persistedState = JSON.parse(localStorage.getItem('persist:root'));
    // Проверяем наличие старых ключей в state
    if (persistedState.persistedReducer) {
      const persistedReducer = JSON.parse(persistedState.persistedReducer);
      if (persistedReducer.auth && (persistedReducer.auth.user || persistedReducer.auth.loading || persistedReducer.auth.error)) {
        // Очищаем localStorage если найдены старые ключи
        localStorage.removeItem('persist:root');
        console.log('Очищено старое состояние Redux');
      }
    }
  } catch (error) {
    console.error('Ошибка при проверке состояния:', error);
  }
}

enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  
  reportWebVitals();
});
