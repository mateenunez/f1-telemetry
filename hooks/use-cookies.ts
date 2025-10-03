'use client';

import { useCallback, useEffect, useState } from 'react';

type CookieBool = boolean;

type CookieName = 'corners' | 'sectors' | 'headshot' | 'audioLog' | 'raceControlLog' | 'circleOfDoom';

const COOKIE_NAMES = {
    corners: 'corners',
    sectors: 'sectors',
    headshot: 'headshot',
    audioLog: 'audioLog',
    raceControlLog: 'raceControlLog',
    circleOfDoom: 'circleOfDoom'

} as const;

// Bus de suscriptores por cookie para sincronizar instancias de cada hook
const subscribersMap: Record<CookieName, Set<(v: boolean) => void>> = {
    corners: new Set(),
    sectors: new Set(),
    headshot: new Set(),
    audioLog: new Set(),
    raceControlLog: new Set(),
    circleOfDoom: new Set()
};

function notifyAll(cookie: CookieName, v: boolean) {
    for (const fn of subscribersMap[cookie]) fn(v);
}

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days = 365) {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function useBooleanCookie(cookie: CookieName, defaultValue: CookieBool = true) {
    const [value, setValue] = useState<CookieBool>(defaultValue);
    const [ready, setReady] = useState(false);

    // Inicializa desde cookie (solo cliente)
    useEffect(() => {
        const raw = readCookie(cookie);
        if (raw == null) {
            writeCookie(cookie, defaultValue ? '1' : '0');
            setValue(defaultValue);
        } else {
            setValue(raw === '1' || raw.toLowerCase() === 'true');
        }
        setReady(true);
    }, [cookie, defaultValue]);

    // Suscribirse a cambios externos (otras instancias del hook)
    useEffect(() => {
        const subs = subscribersMap[cookie];
        subs.add(setValue);
        return () => {
            subs.delete(setValue);
        };
    }, [cookie]);

    const set = useCallback((v: boolean) => {
        setValue(v);
        writeCookie(cookie, v ? '1' : '0');
        notifyAll(cookie, v);
    }, [cookie]);

    const toggle = useCallback(() => {
        setValue(prev => {
            const next = !prev;
            writeCookie(cookie, next ? '1' : '0');
            notifyAll(cookie, next);
            return next;
        });
    }, [cookie]);

    const enable = useCallback(() => set(true), [set]);
    const disable = useCallback(() => set(false), [set]);
    const clear = useCallback(() => {
        deleteCookie(cookie);
        setValue(defaultValue);
        notifyAll(cookie, defaultValue);
    }, [cookie, defaultValue]);

    return {
        value,
        ready,
        set,
        toggle,
        enable,
        disable,
        clear,
        cookieName: cookie,
    };
}

export function useCorners(defaultValue: CookieBool = true) {
    const { value: corners, ready, set, toggle, enable, disable, clear, cookieName } =
        useBooleanCookie(COOKIE_NAMES.corners, defaultValue);
    return { corners, ready, set, toggle, enable, disable, clear, cookieName };
}

export function useSectors(defaultValue: CookieBool = true) {
    const { value: sectors, ready, set, toggle, enable, disable, clear, cookieName } =
        useBooleanCookie(COOKIE_NAMES.sectors, defaultValue);
    return { sectors, ready, set, toggle, enable, disable, clear, cookieName };
}

export function useHeadshot(defaultValue: CookieBool = true) {
    const { value: headshot, ready, set, toggle, enable, disable, clear, cookieName } =
        useBooleanCookie(COOKIE_NAMES.headshot, defaultValue);
    return { headshot, ready, set, toggle, enable, disable, clear, cookieName };
}

export function useAudioLog(defaultValue: CookieBool = true) {
    const { value: audioLog, ready, set, toggle, enable, disable, clear, cookieName } =
        useBooleanCookie(COOKIE_NAMES.audioLog, defaultValue);
    return { audioLog, ready, set, toggle, enable, disable, clear, cookieName };
}

export function useRaceControlLog(defaultValue: CookieBool = true) {
    const { value: raceControlLog, ready, set, toggle, enable, disable, clear, cookieName } =
        useBooleanCookie(COOKIE_NAMES.raceControlLog, defaultValue);
    return { raceControlLog, ready, set, toggle, enable, disable, clear, cookieName };
}

export function useCircleOfDoom(defaultValue: CookieBool = true) {
    const { value: circleOfDoom, ready, set, toggle, enable, disable, clear, cookieName } =
        useBooleanCookie(COOKIE_NAMES.circleOfDoom, defaultValue);
    return { circleOfDoom, ready, set, toggle, enable, disable, clear, cookieName };
}
