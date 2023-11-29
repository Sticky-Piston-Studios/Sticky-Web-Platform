import { createSlice, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

export const initialAuthState = {
  isAdminLoggedIn: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    logIn: (state) => {
      state.isAdminLoggedIn = true;
    },
    logOut: (state) => {
      state.isAdminLoggedIn = false;
    },
  },
});
export const { logIn, logOut } = authSlice.actions;

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["isAdminLoggedIn"], // only isAdminLoggedIn will be persisted
};
const persistedReducer = persistReducer(persistConfig, authSlice.reducer);

const makeStore = () => {
  // Expose reducers
  let store = configureStore({
    reducer: {
      auth: persistedReducer,
    },

    // The below ignores nonSerializable data warnings for redux-persist -this is intended: https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
  store.__persistor = persistStore(store); // This creates a new attribute on the store
  return store;
};

export default makeStore;
