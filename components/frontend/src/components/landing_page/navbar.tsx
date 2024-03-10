'use client'

import React, { useState, useEffect } from "react";
import LanguageSwitcher from "../language-switcher";
import Link from "next/link";

export default function NavBar({ logo, links }:{ logo?: string, links: { href: string, text: string }[] }) {
  const [isPageAtTop, setIsPageAtTop] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  function isBackgroundVisible() : boolean {
    // Set background invisible only when menu and language switcher menu are closed and page is at top
    return !(isPageAtTop && !isMenuOpen && !isLanguageMenuOpen);
  };

  useEffect(() => {
    const onScroll = () => {
      setIsPageAtTop(window.scrollY < 50); // You can adjust the 50 to be more or less sensitive
    };

    onScroll()

    // Add scroll event listener
    window.addEventListener("scroll", onScroll);

    // Cleanup performed when unmounting
    return () => {
      // Remove scroll event listener
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const NavigationButton = (text: string, href: string) => {
    const html = (
      <Link key={href} href={href} scroll={true} passHref onClick={()=>{ setIsMenuOpen(false); }}>
        <div className='navigation-button md:interaction-underline'>
          {text}
        </div>
      </Link>
    )
    return html;
  }

  return (
    <nav className={`${isBackgroundVisible() ? 'dark:bg-[#181820] bg-[#e6edff]' : 'bg-transparent'} flex justify-center fixed text-white py-4 w-full z-[100] transition-all duration-300`}>
      <div className="container stick flex justify-between px-4">

        {/* Left side - navigation links */}
        <div className="flex items-center">

          {/* Vertial menu (Hamburger) */}
          <div className="md:invisible md:w-0 transition-all">

            {/* Hamburger icon */}
            <div/>
              <button aria-label="menu" className={`hamburger-menu ${isMenuOpen ? "hamburger-menu-open" : ""}`} id="hamburger" onClick={() => { setIsMenuOpen(!isMenuOpen); }}>
                <span/><span/><span/>
              </button>
               
              {/* Navigation links */}
              <div className={`
                absolute flex flex-col z-10 p-3 px-2 py-[8px] justify-between 
                mt-[9px] translate-x-[-156px] transition-all duration-300 
                ${isMenuOpen ? 'opacity-100 visible md:invisible !translate-x-[-16px]' : 'opacity-0 invisible'} 
                ${isBackgroundVisible() ? 'dark:bg-[#181820] bg-[#e6edff]' : 'bg-transparent'}`
              }>
                {links.map(link => (NavigationButton(link.text, link.href)))}
              </div> 
            </div>

            {/* Horizontal menu */}
            <div className={`absolute w-0 invisible opacity-0 md:visible md:w-[300px] md:opacity-100 transition-all `}>
              {/* Logo or brand name - hidden on small screens */}
              <a href="/" className={`text-xl font-bold text-nowrap pr-6 ${logo ? "visible" : "hidden"}`}>
                {logo}
              </a>
              
              {/* Navigation links */}
              <div className="flex flex-row">
                {links.map(link => (NavigationButton(link.text, link.href)))}
              </div>
          </div>
        </div>

        {/* Language change buttons */}
        <div className="flex items-center">
          <LanguageSwitcher onMenuToggleCallback={(opened: boolean) => { setIsLanguageMenuOpen(opened); }} />
        </div>
      </div>
    </nav>
  );
};