import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import creaturesReducer from './creaturesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    creatures: creaturesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
