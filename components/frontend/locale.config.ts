export type LocaleConfig = {
    locales: string[];
    defaultLocale: string;
    namespaces: string[];
    defaultNamespace: string;
}

const localeConfig: LocaleConfig = {
    locales: ['en', 'pl'],
    defaultLocale: 'en',
    namespaces: ['common', 'subpage'],
    defaultNamespace: 'common',
}

export default localeConfig