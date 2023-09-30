import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';
export const PLASMIC = initPlasmicLoader({
	projects: [
		{
			id: 'bMNLcK7e7BpqL1WsHD9nst', // ID of a project you are using
			token: 'GbMM6l6erSOF0j8LIi0a6JoEVgZIcAjSUizaJCAZhLApyQ8inQmQ1qeqcllF8RbB9gxVPiTGtRGJpsoV4w', // API token for that project
		},
	],
	// Fetches the latest revisions, whether or not they were unpublished!
	// Disable for production to ensure you render only published changes.
	preview: process.env.NODE_ENV === 'development' ? true : false,
});
