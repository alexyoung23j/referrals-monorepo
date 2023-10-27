import { type GetServerSidePropsContext } from 'next';
import { MobileNotAllowed, PageLayout } from '~/components/layouts';
import { RButton } from '~/components/ui/button';
import { prisma } from '~/server/db';
import { redirectIfNotAuthed } from '~/utils/routing';
import { api } from '~/utils/api';
import { Separator } from '~/components/ui/separator';
import PersonalInfoSection from '~/components/profile/personal_info_section';
import ResumeSection from '~/components/profile/resume_section';
import { generateValidLink } from '~/utils/links';
import Spinner from '~/components/ui/spinner';
import ExperienceSection from '~/components/profile/experience_section';
import Head from 'next/head';
import { isMobile } from 'react-device-detect';
import BillingSection from '~/components/profile/billing_section';
import { useEffect, useState } from 'react';

interface ProfiePageProps {
	linkCode: string; // Replace 'any' with the actual type of 'link'
}
export default function ProfilePage({ linkCode }: ProfiePageProps) {
	const { data: profileData, status } = api.profiles.getProfile.useQuery(
		undefined,
		{
			refetchOnWindowFocus: false,
		}
	);

	useEffect(() => {
		if (status !== 'success') {
			return;
		}

		const urlParams = new URLSearchParams(window.location.search);
		const account = urlParams.get('account');
		if (account === 'true') {
			const billingSection = document.getElementById('billingSection');
			if (billingSection) {
				billingSection.scrollIntoView({ behavior: 'auto' });
			}
		}
	}, [status]);

	const [pageLoaded, setPageLoaded] = useState(false);

	useEffect(() => {
		if (!pageLoaded) {
			setPageLoaded(true);
		}
	}, [pageLoaded]);

	if (!pageLoaded) {
		return (
			<div className="flex h-[100vh] w-full items-center justify-center">
				<Spinner size="medium" />
			</div>
		);
	}

	return (
		<PageLayout
			showSidebar
			pageTitle="Profile"
			pageSubtitle="Provide context for your requests and help your referrers get applications submitted quickly."
			topRightContent={
				<RButton
					size="lg"
					iconName="external-link"
					onClick={() => {
						window.open(
							`${process.env.NEXT_PUBLIC_SERVER_URL}/${linkCode}`
						);
					}}
				>
					View profile
				</RButton>
			}
		>
			<Head>
				<title>Profile - ReferLink</title>
			</Head>
			<div className="flex h-[200vh] w-full">
				{status === 'success' ? (
					<div className="flex max-h-fit w-full flex-col gap-[36px]">
						<PersonalInfoSection />
						<Separator />
						<ResumeSection />
						<Separator />
						<ExperienceSection />
						<Separator />
						<BillingSection id="billingSection" />
					</div>
				) : (
					<div className="flex max-h-fit w-full flex-col items-center justify-center gap-[36px]">
						<Spinner size="large" />
					</div>
				)}
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
			try {
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
						blurbAuthorName: session?.user.name as string,
					});
				}

				const existingProfile = await prisma.userProfile.findFirst({
					where: {
						userId: session?.user.id,
					},
				});

				if (existingProfile) {
					return {
						props: { session, linkCode: link.id },
					};
				}

				// Create a new profile if one doesn't exist
				await prisma.userProfile.create({
					data: {
						user: {
							connect: {
								id: session?.user.id,
							},
						},
						publicEmail: session?.user.email,
						firstName: session?.user.name?.split(' ')[0],
						lastName: session?.user.name?.split(' ')[1],
					},
				});

				return {
					props: { session, linkCode: link.id },
				};
			} catch (e) {
				console.log(e);
			}
		},
	});
}
