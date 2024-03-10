// Description: 
//    Very simple language switcher displaying the current locale and other possible locales to choose from.
// Usage:
//    <LanguageSwitcherSimple currentLocale={locale}/>

import React from "react";
import localeConfig from '@/../locale.config';
import Link from "next/link";

export default async function LanguageSwitcherSimple({ currentLocale }: { currentLocale: string }) {

  return (
    <div>
      {/* Switcher text displaying current locale and other possible locales to choose from */}
      <span>{currentLocale} → </span>

      {/* Append language link at the end of the switcher text */}
      {localeConfig.locales.filter((l) => currentLocale !== l).map((l, index) => {

        const html = (
          <span key={l}>
            {index > 0 && (', ')}
            <Link href={`/${l}`}>
              {l}
            </Link>
          </span>
        )

        return html;
      })}
    </div>
  );
}