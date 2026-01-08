import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './redux/store';
import { Provider } from 'react-redux';

// if (process.env.NODE_ENV === 'development') {
//     const { worker } = require('./mocks/browser');
//     worker.start();
// }


// if (!process.env.REACT_APP_API_URL) {  // нет бэкенда → включаем MSW
//   const { worker } = require('./mocks/browser');
//   worker.start();
// }



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);

reportWebVitals();
