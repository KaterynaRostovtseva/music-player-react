import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { api } from "./api";
import authSlice from './slice/authSlice';
import playerSlice from "./slice/playerSlice";
import { setDuration, nextTrack, setCurrentTime, audio } from './slice/playerSlice';
import  searchSlice from './slice/searchSlice'
import { 
    persistStore, 
    persistReducer,
    FLUSH,  
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';


const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['player', 'search'], // Исключаем player и search из persisted state
  }

const rootReducer = combineReducers({
    auth: authSlice,
    player: playerSlice,
    search: searchSlice,
});

const  persistedReducer =  persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        persistedReducer 
    },
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware({serializableCheck: {ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]}}),
            api.middleware],
});

export const persistor = persistStore(store);

// Обработка ошибок превышения квоты localStorage
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  try {
    originalSetItem.call(this, key, value);
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('Превышена квота localStorage, очищаем persist:root');
      try {
        // Удаляем persist:root и пытаемся сохранить снова
        if (key === 'persist:root') {
          localStorage.removeItem('persist:root');
          // Пытаемся сохранить только auth
          const data = JSON.parse(value);
          if (data && data.persistedReducer) {
            const persistedReducer = JSON.parse(data.persistedReducer);
            // Сохраняем только auth
            const cleanData = {
              persistedReducer: JSON.stringify({
                auth: persistedReducer.auth || {}
              })
            };
            originalSetItem.call(this, key, JSON.stringify(cleanData));
          }
        }
      } catch (cleanError) {
        console.error('Не удалось очистить и сохранить данные:', cleanError);
      }
    } else {
      throw e;
    }
  }
};


store.subscribe(() => {
    const { dispatch } = store;
    if (audio) {   
        audio.onended = () => dispatch(nextTrack());
        audio.ondurationchange = () => dispatch(setDuration(audio.duration));
        audio.ontimeupdate = () => dispatch(setCurrentTime(audio.currentTime));
    }
  });

export default store;









