'use client'

import { useTranslation } from 'react-i18next';

export function useClientTranslation(locale?: string, namespace?: string) {
    return useTranslation(namespace, { lng: locale });
}