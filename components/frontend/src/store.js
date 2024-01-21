//export const persistor = persistStore(store, null, () => {
//  console.log("Rehydrated state:", JSON.stringify(store.getState(), null, 2));
//});
// store.js
import { createWrapper } from 'next-redux-wrapper';
import makeStore from './reducers';


export const wrapper = createWrapper(makeStore, { debug: true });
