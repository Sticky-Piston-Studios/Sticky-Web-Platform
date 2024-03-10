// For more advanced middleware with language cookie setting and reading check https://locize.com/blog/next-app-dir-i18n/

import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import acceptLanguage from 'accept-language'
import localeConfig from "@/../locale.config";

export function middleware(request: NextRequest) {

    // Try to get the higheset priority locale from the Accept-Language header
    // (Which stores data in such format: "en-US,en;q=0.9,fr;q=0.8")
    let locale = acceptLanguage.get(request.headers.get('Accept-Language'))
    if (!locale) {
        locale = localeConfig.defaultLocale;
    }

    // Redirect if locale in path is not supported
    if (!localeConfig.locales.some(locale => request.nextUrl.pathname.startsWith(`/${locale}`)) && !request.nextUrl.pathname.startsWith('/_next')) {
        return NextResponse.redirect(new URL(`/${locale}${request.nextUrl.pathname}`, request.url))
    }

    return NextResponse.next()
}

// Filters Middleware to run on specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)']
};