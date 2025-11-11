if (typeof window === "undefined") {
	const required = {
		NEXT_PUBLIC_WS: process.env.NEXT_PUBLIC_WS,
		NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API,
		NEXT_PUBLIC_F1TBLOB_BASE_URL: process.env.NEXT_PUBLIC_F1TBLOB_BASE_URL,
	};

	for (const [key, val] of Object.entries(required)) {
		if (!val) {
			console.warn(`Missing environment variable: ${key}`);
		}
	}
}

export const config = {
	public: {
		linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL,
		discord: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL,
		github: process.env.NEXT_PUBLIC_GITHUB_URL,
		websocket: process.env.NEXT_PUBLIC_WS,
		apiUrl: process.env.NEXT_PUBLIC_API,
		blobBaseUrl: process.env.NEXT_PUBLIC_F1TBLOB_BASE_URL,
	},
	server: {},
};