import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import creaturesReducer from './creaturesSlice';
import diveReducer from './diveSlice';
import quizReducer from './quizSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    creatures: creaturesReducer,
    dive: diveReducer,
    quiz: quizReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
