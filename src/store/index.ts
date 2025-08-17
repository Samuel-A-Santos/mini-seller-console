import { configureStore } from '@reduxjs/toolkit';
import leadsReducer from './slices/leadsSlice';
import opportunitiesReducer from './slices/opportunitiesSlice';

export const store = configureStore({
  reducer: {
    leads: leadsReducer,
    opportunities: opportunitiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
