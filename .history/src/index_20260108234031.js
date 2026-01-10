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

// Безопасная очистка: удаляем только большой `player` слайс из persisted state,
// чтобы не терять другие данные (auth, search и т.п.). Выполняется один раз при старте.
if (localStorage.getItem('persist:root')) {
  try {
    const persistedStateRaw = localStorage.getItem('persist:root');
    const persistedState = JSON.parse(persistedStateRaw);

    if (persistedState && persistedState.persistedReducer) {
      try {
        const persistedReducer = JSON.parse(persistedState.persistedReducer);

        if (persistedReducer.player) {
          // Удаляем только `player` ключ и записываем обратно
          delete persistedReducer.player;
          persistedState.persistedReducer = JSON.stringify(persistedReducer);
          localStorage.setItem('persist:root', JSON.stringify(persistedState));
          console.log('Удалён persisted player slice из persist:root (сохранены остальные данные)');
        }
      } catch (innerErr) {
        // Если не получилось распарсить внутренний persistedReducer — безопасно удалить весь ключ
        console.warn('Не удалось распарсить persistedReducer, удаляю persist:root:', innerErr);
        localStorage.removeItem('persist:root');
      }
    }
  } catch (error) {
    console.error('Ошибка при обработке persisted state:', error);
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
