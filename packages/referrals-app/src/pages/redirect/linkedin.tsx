import type { GetServerSidePropsContext } from 'next';
import { type NextPage } from 'next';

import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import { redirectIfNotAuthed } from '../../utils/routing';

const ConnectLinkedIn: NextPage = () => {
	const router = useRouter();
	console.log('ROUTER', router.query);

	return <></>;
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	return redirectIfNotAuthed({
		ctx,
		redirectUrl: '/signup',
	});
}
export default ConnectLinkedIn;