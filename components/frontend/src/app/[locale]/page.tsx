import '@/styles/mainpage.css'

import React from 'react';
import Image from 'next/image'
import { useServerTranslation } from "@/locale/i18n-server"

// Resources
import StickyPistonStudiosLogo from '@/assets/images/sticky_piston_studios_logo.png';
import StickyWebPlatformLogoText from '@/assets/images/sticky_web_platform_logo_full_white.png';
import Link from 'next/link';
import NavBar from '@/components/landing_page/navbar';


export default async function Page({ 
  params: { locale }
}:{ 
  params: { locale: string }
}) {
  const { t } = await useServerTranslation(locale, ["common"]);

  const NavBarLinks = [
    { href: "https://github.com/Sticky-Piston-Studios/Sticky-Web-Platform", text: "GitHub" },
    { href: `https://stickypistonstudios.com/${locale}`, text: t('other.creators') },
    { href: `/${locale}/subpage`, text: t('other.subpage') },
  ];

  const html = (
    <main className='dark overflow-clip'>
      <div className='basic-theme'>

        <NavBar links={NavBarLinks}/>

        <div className="container flex flex-col mx-auto px-8">

          <div className='flex flex-col h-[100vh] p-[16px] md:p-[20%] justify-center'>
            <Image src={StickyWebPlatformLogoText.src} alt='' className="mx-auto w-full h-auto" width={1000} height={1000} priority/>
          </div>

        </div>
      </div>
    </main>
  )

  return html;
}
 
