
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
// import userReducer from './reducers/userSlice';

const store = configureStore({
  reducer: rootReducer,
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable if you have non-serializable values in state
    }),
});

export type AppDispatch = typeof store.dispatch;

export default store