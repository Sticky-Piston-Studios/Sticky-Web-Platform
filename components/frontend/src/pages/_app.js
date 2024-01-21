import "@/styles/globals.css";
import { PersistGate } from "redux-persist/integration/react";
import { useStore } from "react-redux";
import { wrapper } from "../store";

import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
//import enTranslation from "../locales/en.json";
//import plTranslation from "../locales/pl.json";

// Localization support
//i18n.init({
//  resources: {
//    en: { translation: enTranslation },
//    pl: { translation: plTranslation },
//  },
//  fallbackLng: "pl", // Default language if a translation is missing
//});

function App({ Component, pageProps }) {
  const store = useStore();

  return (
    <I18nextProvider i18n={i18n}>
      <PersistGate persistor={store.__persistor} loading={null}>
        <Component {...pageProps} />
      </PersistGate>
    </I18nextProvider>
  );
}

export default wrapper.withRedux(App);
