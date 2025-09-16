'use client';

import { useCallback, useEffect, useState } from 'react';

type CookieBool = boolean;

const COOKIE_NAME = 'headshot';

const subscribers = new Set<(v: boolean) => void>();

function notifyAll(v: boolean) {
	for (const fn of subscribers) fn(v);
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

export function useHeadshot(defaultValue: CookieBool = true) {
	const [value, setValue] = useState<CookieBool>(defaultValue);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const raw = readCookie(COOKIE_NAME);
		if (raw == null) {
			writeCookie(COOKIE_NAME, defaultValue ? '1' : '0');
			setValue(defaultValue);
		} else {
			setValue(raw === '1' || raw.toLowerCase() === 'true');
		}
		setReady(true);
	}, [defaultValue]);

	// Suscribirse para recibir cambios de otras instancias
	useEffect(() => {
		subscribers.add(setValue);
		return () => {
			subscribers.delete(setValue);
		};
	}, []);

	const set = useCallback((v: boolean) => {
		setValue(v);
		writeCookie(COOKIE_NAME, v ? '1' : '0');
		notifyAll(v);
	}, []);

	const toggleHeadshot = useCallback(() => {
		setValue(prev => {
			const next = !prev;
			writeCookie(COOKIE_NAME, next ? '1' : '0');
			notifyAll(next);
		 return next;
		});
	}, []);

	const enable = useCallback(() => set(true), [set]);
	const disable = useCallback(() => set(false), [set]);
	const clear = useCallback(() => {
		deleteCookie(COOKIE_NAME);
		setValue(defaultValue);
		notifyAll(defaultValue);
	}, [defaultValue]);

	return {
		headshot: value,
		ready,
		set,
		toggleHeadshot,
		enable,
		disable,
		clear,
		cookieName: COOKIE_NAME,
	};
}