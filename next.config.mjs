/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./packages/referrals-app/src/env.mjs');

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	webpack: (config) => {
		config.module.rules.push({
			test: /\.node/,
			use: 'raw-loader',
		});
		
		return config;
	},

	/**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
	// i18n: {
	// 	locales: ["en"],
	// 	defaultLocale: "en",
	// },
};

export default config;
