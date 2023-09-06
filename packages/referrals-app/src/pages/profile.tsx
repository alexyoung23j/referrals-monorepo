import { GetServerSidePropsContext } from 'next';
import { PageLayout } from '~/components/layouts';
import { RButton } from '~/components/ui/button';
import { prisma } from '~/server/db';
import { redirectIfNotAuthed } from '~/utils/routing';
import { api } from '~/utils/api';
import { Separator } from '~/components/ui/separator';
import { RText } from '~/components/ui/text';
import { RLabeledSection } from '~/components/ui/labeled_section';
import { RInput } from '~/components/ui/input';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { RTextarea } from '~/components/ui/textarea';
import { useToast } from '~/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import PersonalInfoSection from '~/components/profile/personal_info_section';
import ResumeSection from '~/components/profile/resume_section';

export default function ProfilePage() {
	const { data: profileData, status } = api.profiles.getProfile.useQuery(
		undefined,
		{
			refetchOnWindowFocus: false,
		}
	);
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
			<div className="flex h-[200vh] w-full">
				{status === 'success' && (
					<div className="flex max-h-fit w-full flex-col gap-[36px]">
						<PersonalInfoSection />
						<Separator />
						<ResumeSection />
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
				const existingProfile = await prisma.userProfile.findFirst({
					where: {
						userId: session?.user.id,
					},
				});

				if (existingProfile) {
					return {
						props: { session },
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
					props: { session },
				};
			} catch (e) {
				console.log(e);
			}
		},
	});
}
