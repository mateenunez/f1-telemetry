import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { i18n } from "./lib/i18n/config"

function getLocale(request: NextRequest): string {
    // Check if locale is in the pathname
    const pathname = request.nextUrl.pathname
    const pathnameLocale = i18n.locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

    if (pathnameLocale) return pathnameLocale

    // Check Accept-Language header
    const acceptLanguage = request.headers.get("accept-language")
    if (acceptLanguage) {
        const preferredLocale = acceptLanguage
            .split(",")
            .map((lang) => lang.split(";")[0].trim().toLowerCase())
            .find((lang) => {
                const langCode = lang.split("-")[0]
                return i18n.locales.includes(langCode as any)
            })

        if (preferredLocale) {
            const langCode = preferredLocale.split("-")[0]
            if (i18n.locales.includes(langCode as any)) {
                return langCode
            }
        }
    }

    return i18n.defaultLocale
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Check if the pathname already has a locale
    const pathnameHasLocale = i18n.locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    )

    if (pathnameHasLocale) return

    // Redirect to locale-prefixed URL
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
