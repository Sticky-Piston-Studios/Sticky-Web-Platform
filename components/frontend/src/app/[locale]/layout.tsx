import TranslationsProvider from "@/locale/translations-provider";
import localeConfig from '@/../locale.config';
import { useServerTranslation } from "@/locale/i18n-server";

// Required to generate static page for each language
export async function generateStaticParams() {
  return [...localeConfig.locales.map((locale: string) => ({ locale }))];
}

export default async function RootLayout({
  children,
  params: { locale },
}:{
  children: React.ReactNode
  params: { locale: string },
}) {
  // For client side rendering load all namespaces upfront
  const { resources } = await useServerTranslation(locale, localeConfig.namespaces);

  return (
    <>
      <div className='screen-fade-out'/>
      <TranslationsProvider locale={locale} namespaces={localeConfig.namespaces} resources={resources}>
        {children}
      </TranslationsProvider>
    </>
  );
}


