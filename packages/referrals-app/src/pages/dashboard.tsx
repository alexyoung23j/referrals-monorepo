import { GetServerSidePropsContext } from 'next';
import { PageLayout } from '~/components/layouts';
import { RButton } from '~/components/ui/button';
import { redirectIfNotAuthed } from '~/utils/routing';
import { prisma } from '~/server/db';
import { generateValidLink } from '~/utils/links';
import type { Link } from '@prisma/client';
import ShareSection from '~/components/dashboard/share_section';
import { Separator } from '~/components/ui/separator';
import { useSession } from 'next-auth/react';

interface DashboardPageProps {
	userMainLink: string; // Replace 'any' with the actual type of 'link'
}

export default function DashboardPage({ userMainLink }: DashboardPageProps) {
	const { data: sessionData } = useSession();

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
			<div className="my-[16px] h-[200vh] w-full">
				<ShareSection
					linkCode={userMainLink}
					userName={sessionData?.user.name as string}
				/>
				<Separator />
			</div>
		</PageLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	// Redirect to Landing Page if Not Logged in
	return redirectIfNotAuthed({
		ctx,
		redirectUrl: '/',
		callback: async (session) => {
			// Create a new main link if none yet exists

			let link = await prisma.link.findFirst({
				where: {
					userId: session?.user.id,
					specificRequest: null,
				},
			});

			if (!link) {
				link = await generateValidLink({
					userId: session?.user.id as string,
					createdByLoggedInUser: true,
				});
			}

			return {
				props: { session, userMainLink: link.id },
			};
		},
	});
}
