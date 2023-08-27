import { GetServerSidePropsContext } from 'next';
import { PageLayout } from '~/components/layouts';
import { RButton } from '~/components/ui/button';
import { redirectIfNotAuthed } from '~/utils/routing';

export default function ProfilePage() {
	return (
		<PageLayout
			showSidebar
			pageTitle="Profile"
			pageSubtitle="Your profile is used to provide context for your referrals and help your referrers get applications submitted."
			topRightContent={
				<RButton size="lg" iconName="plus">
					View public profile
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
