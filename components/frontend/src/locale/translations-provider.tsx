// Description: 
//    This component creates a singleton i18next instance on the client and uses I18nextProvider to provide the instance to all descendent client components.
//    It should be executed (rendered) once, thus it should wrap the whole page.
//    With this, a useTranslation() hook from react-i18next, will automatically work in all client-side rendered components.
// Usage:
//    In layout.tsx add:
//    const { resources } = await useServerTranslation(locale, localeConfig.namespaces);
//    <TranslationsProvider locale={locale} namespaces={localeConfig.namespaces}>
//      {children}
//    </TranslationsProvider>
// 
//    In client components use as follows:
//    import { useClientTranslation } from "@/locale/i18n-client"
//    const { t } = useClientTranslation();
//    {t('key')}

'use client';

import { I18nextProvider} from 'react-i18next';
import { useServerTranslation } from "@/locale/i18n-server"
import { Resource, createInstance } from 'i18next';

export default function TranslationsProvider({
  children,
  locale,
  namespaces,
  resources
}:{
    children: React.ReactNode,
    locale: string,
    namespaces: string[],
    resources? : Resource
}) {
  const i18nInstance = createInstance();

  // Initialize the instance once
  useServerTranslation(locale, namespaces, i18nInstance, resources);

  const html = (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );

  return html;
}