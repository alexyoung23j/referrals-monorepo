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
import ActivityModal from '~/components/modals/activity_modal';
import { useState } from 'react';
import { Switch } from '~/components/ui/switch';
import { RText } from '~/components/ui/text';
import { RLabeledSection } from '~/components/ui/labeled_section';
import { RInput } from '~/components/ui/input';
import { z } from 'zod';

interface DashboardPageProps {
	userMainLink: string; // Replace 'any' with the actual type of 'link'
}

export default function DashboardPage({ userMainLink }: DashboardPageProps) {
	const { data: sessionData } = useSession();
	const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);

	return (
		<PageLayout
			showSidebar
			pageTitle="Dashboard"
			topRightContent={
				<RButton
					size="lg"
					iconName="plus"
					onClick={() => {
						setNewRequestModalOpen(true);
					}}
				>
					New referral request
				</RButton>
			}
		>
			<ActivityModal
				open={newRequestModalOpen}
				onOpenChange={(open) => {
					setNewRequestModalOpen(open);
				}}
				headerText="Create referral request"
				subtitleText="Link to a job listing or choose “Any open role” for a general referral."
				sections={[
					{
						type: 'single-column',
						content: [
							<div key="1" className="flex items-center gap-3 ">
								<Switch />
								<RText fontWeight="medium">Any open role</RText>
							</div>,
						],
					},
					{
						type: 'single-column',
						content: [
							<RLabeledSection
								label="Job posting link*"
								subtitle="Feel free to link to your top choice job at this company."
								body={
									<RInput
										placeholder="enter link"
										validationSchema={z.string().url()}
										// isRequired
									/>
								}
								key="2"
							/>,
						],
					},
					{
						type: 'single-column',
						content: [
							<RLabeledSection
								label="Job title"
								body={
									<RInput
										placeholder="enter title"
										// isRequired
										className="max-w-[50%]"
									/>
								}
								key="3"
							/>,
						],
					},
					{
						type: 'single-column',
						content: [
							<RLabeledSection
								label="Company*"
								body={
									<RInput
										placeholder="enter title"
										// isRequired
									/>
								}
								key="3"
							/>,
						],
					},
				]}
				bottomRowContent={
					<RButton iconName="check">Create request</RButton>
				}
			/>
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
