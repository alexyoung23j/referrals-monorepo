import { GetServerSidePropsContext } from 'next';
import { PageLayout } from '~/components/layouts';
import { redirectIfNotAuthed } from '~/utils/routing';

export default function DashboardPage() {
	return (
		<PageLayout showSidebar pageTitle="Dashboard">
			<div className="h-[200vh] w-full"></div>
		</PageLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	// Redirect to Landing Page if Not Logged in
	return redirectIfNotAuthed({
		ctx,
		redirectUrl: '/',
	});
}
