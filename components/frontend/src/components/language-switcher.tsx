'use client'

import React, { ChangeEvent, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useClientTranslation } from '@/locale/i18n-client';
import localeConfig from '@/../locale.config';

export default function LanguageSwitcher( { 
  onMenuToggleCallback 
}:{ 
  onMenuToggleCallback: (opened: boolean) => void}) 
{
  const { t, i18n } = useClientTranslation(undefined, "common");
  const router = useRouter();
  const currentLocale = i18n.language;
  const currentPathname = usePathname(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  function handleChange(newLocale: string) {
    // Redirect to the new locale path
    router.push(currentPathname.replace(`/${currentLocale}`, `/${newLocale}`));
    router.refresh();
  };

  const NavigationButton = (text: string, onClickCallback: () => void) => {
    const html = (
      <button aria-label={text} key={text} className="navigation-button" onClick={onClickCallback}>  
        {text}
      </button>
    )
    return html;
  }

  return (
    <div className="flex items-center h-full">

        {/* Vertial menu */}
        <div className="transition-all h-full">

          {/* language name and dropdown icon */}
          <button aria-label="language" className={`chevron-dropdown h-full md:interaction-underline md:px-[12px] ${isMenuOpen ? "chevron-open" : ""}`} onClick={() => { setIsMenuOpen(!isMenuOpen); onMenuToggleCallback(!isMenuOpen); }}>
            <div className="navbar-text md:py-2">
              <div className="block md:hidden">{currentLocale.toUpperCase()}</div>
              <div className="hidden md:block">{t('locales.' + currentLocale)}</div>
            </div>

            <div className="chevron ml-[15px] md:ml-[14px] md:mr-[2px] md:gap-[1px] md:rotate-0">
              <span className="chevron-span md:w-[2px] md:h-[6px]"/>
              <span className="chevron-span md:w-[2px] md:h-[6px]"/>
            </div>
          </button>

          {/* Navigation links */}
          <div className={`
            absolute flex flex-col z-10 my-3 px-2 py-[8px] justify-between 
            mt-[9px] translate-x-[156px] md:translate-x-[0px] md:translate-y-[-50px] transition-all duration-300
            ${isMenuOpen ? 'opacity-100 !translate-x-[0px] md:translate-y-[0px] right-0 md:right-auto' : 'opacity-0 invisible'} 
            ${!isMenuOpen ? 'bg-transparent' : 'dark:bg-[#181820] bg-[#e6edff]'}`
          }>
            {localeConfig.locales.map(
              (locale) => { 
                if (locale !== currentLocale) {
                  return NavigationButton(t(`locales.${locale}`), () => handleChange(locale)); 
                }
              }
            )}
        </div>
      </div>
    </div>
  );
}