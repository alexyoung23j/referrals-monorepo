/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs');

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	supabase: {
		client: {
			auth: {
				persistSession: false, //or true
			},
		},
	},
	/**
	 * If you are using `appDir` then you must comment the below `i18n` config out.
	 *
	 * @see https://github.com/vercel/next.js/issues/41980
	 */
	// i18n: {
	// 	locales: ['en'],
	// 	defaultLocale: 'en',
	// },
	images: {
		domains: [
			'assets.commonwealth.im',
			'logo.clearbit.com',
			'wtshcihzoimxpnrbnnau.supabase.co',
			'zbagogohvyzfxgiyqepp.supabase.co',
		],
	},
};

export default config;
