/* eslint-disable indent */
import Head from 'next/head';
import {
	PlasmicRootProvider,
	PlasmicComponent,
	ComponentRenderData,
	extractPlasmicQueryData,
} from '@plasmicapp/loader-nextjs';
import { useRouter } from 'next/router';
import { PLASMIC } from '../../plasmic-init';
import { redirectIfAuthed } from '~/utils/routing';
import { GetServerSidePropsContext } from 'next';

export default function Page() {
	return <></>;
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	// Redirect to Landing Page if Not Logged in

	return redirectIfAuthed({
		ctx,
		buildRedirectUrl: (session) => {
			return '/dashboard';
		},
		callback: () => {
			return {
				redirect: {
					permanent: false,
					destination: '/home',
				},
				props: {},
			};
		},
		returnCallback: true,
	});
}
