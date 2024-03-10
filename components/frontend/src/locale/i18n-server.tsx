// Description: 
//    Custom useTranslation hook that creates a new instance on each useTranslation call, instead of using i18next singleton.
//    During compilation everything seems to be executed in parallel, so having a separate instance will keep the translations consistent.

import { InitOptions, Resource, createInstance, i18n } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next/initReactI18next'
import localeConfig from '@/../locale.config';

function getLocaleOptions(locale: string = localeConfig.defaultLocale, namespaces: string[] = [localeConfig.defaultNamespace], resources?: Resource) {

  const localeOptions: InitOptions = {
    supportedLngs: localeConfig.locales,
    fallbackLng: localeConfig.defaultLocale,
    fallbackNS: localeConfig.defaultNamespace,
    defaultNS: namespaces, // Currently loaded namespaces accessible without prefix
    lng: locale, // Current locale
    ns: namespaces, // Currently loaded namespaces
    resources: resources, // Translation files locations
    preload: resources ? [] : localeConfig.locales
  }

  return localeOptions;
}

// Custom useTranslation hook that creates a new instance on each useTranslation call, instead of using i18next singleton.
// During compilation everything seems to be executed in parallel, so having a separate instance will keep the translations consistent.

// When using this hook user can pass a namespaces to load by providing name, array of names. 
// When left empty a default namespace will be used.
export async function useServerTranslation(locale: string, namespaces?: string | string[], i18nInstance?: i18n, resources?: Resource) {
  
  // Assure array or undefined (if undefined a default namespace will be used)
  const namespaceArray : string[] | undefined =  namespaces ? (Array.isArray(namespaces) ? namespaces : [namespaces]) : undefined;

  // Create i18n instance
  i18nInstance = i18nInstance || createInstance();
  i18nInstance.use(initReactI18next);

  // Lazy load translations with resourcesToBackend
  if (!resources) {
    i18nInstance.use(resourcesToBackend((locale: string, namespace: string) => import(`@/locale/translations/${locale}/${namespace}.yaml`)));
  }

  // Initialize i18n instance
  await i18nInstance.init(getLocaleOptions(locale, namespaceArray, resources));

  return {
    i18n: i18nInstance,
    t: i18nInstance.t,
    resources: i18nInstance.services.resourceStore.data,
  }
}



