import { GetServerSidePropsContext } from 'next';
import { PageLayout } from '~/components/layouts';
import { RButton } from '~/components/ui/button';
import { redirectIfNotAuthed } from '~/utils/routing';

export default function DashboardPage() {
	return (
		<PageLayout
			showSidebar
			pageTitle="Dashboard"
			topRightContent={
				<RButton size="lg" iconName="plus">
					New referral request
				</RButton>
			}
		>
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
