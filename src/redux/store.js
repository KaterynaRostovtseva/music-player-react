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


store.subscribe(() => {
    const { dispatch } = store;
    if (audio) {   
        audio.onended = () => dispatch(nextTrack());
        audio.ondurationchange = () => dispatch(setDuration(audio.duration));
        audio.ontimeupdate = () => dispatch(setCurrentTime(audio.currentTime));
    }
  });

export default store;









