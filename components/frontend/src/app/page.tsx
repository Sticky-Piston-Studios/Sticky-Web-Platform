'use client'

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import localeConfig from '@/../locale.config';

// Just redirect page detecting preferred language of the user, usually the language of the browser UI
export default function Page() {
    const router = useRouter();

    useEffect(() => {
      const browserLocale = navigator.language.split('-')[0]; // Extract the base language
      const localeToRedirect = localeConfig.locales.includes(browserLocale) ? browserLocale : localeConfig.defaultLocale;

      router.push(`/${localeToRedirect}`);
    }, [router]);

    return (
      <div className='flex h-screen w-screen justify-center items-center absolute'>
        <div className='loader my-auto mx-auto'></div>
      </div>
    );
}


