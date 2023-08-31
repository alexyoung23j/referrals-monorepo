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

export default function ProfilePage() {
	const { data: profileData } = api.profiles.getProfile.useQuery(undefined, {
		refetchOnWindowFocus: false,
	});
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [publicEmail, setPublicEmail] = useState('');
	const [currentRoleTitle, setCurrentRoleTitle] = useState('');
	const [linkedInUrl, setLinkedInUrl] = useState('');
	const [twitterUrl, setTwitterUrl] = useState('');
	const [personalSiteUrl, setPersonalSiteUrl] = useState('');
	const [currentLocation, setCurrentLocation] = useState('');
	const [education, setEducation] = useState('');

	useEffect(() => {
		if (profileData?.firstName) {
			setFirstName(profileData.firstName as string);
		}
		if (profileData?.lastName) {
			setLastName(profileData.lastName as string);
		}
		if (profileData?.publicEmail) {
			setPublicEmail(profileData.publicEmail as string);
		}
		if (profileData?.currentRoleTitle) {
			setCurrentRoleTitle(profileData.currentRoleTitle as string);
		}
		if (profileData?.linkedInUrl) {
			setLinkedInUrl(profileData.linkedInUrl as string);
		}
		if (profileData?.twitterUrl) {
			setTwitterUrl(profileData.twitterUrl as string);
		}
		if (profileData?.personalSiteUrl) {
			setPersonalSiteUrl(profileData.personalSiteUrl as string);
		}
		if (profileData?.location) {
			setCurrentLocation(profileData.location as string);
		}
		if (profileData?.education) {
			setEducation(profileData.education as string);
		}
	}, [profileData]);

	if (!profileData) {
		return null; // TODO: Loading state here
	}

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
			<div className="flex flex h-[200vh] w-full">
				<div className="flex max-h-fit w-full flex-col">
					<div className="my-[36px] flex w-full flex-col gap-[36px]">
						<RText fontSize="h2" fontWeight="medium">
							Personal Information
						</RText>
						<div className="flex w-[55%] flex-col gap-[24px] pr-[5%]">
							<RLabeledSection
								label="Public Email*"
								subtitle="The email address that all your referrals will use and will be shared on your referral links. "
								body={
									<RInput
										value={publicEmail as string}
										onInput={(e) => {
											setPublicEmail(
												(e.target as HTMLInputElement)
													.value
											);
										}}
										placeholder="enter email address"
										isRequired
										validationSchema={z
											.string()
											.min(3)
											.email({
												message:
													'Must be valid email address.',
											})}
									/>
								}
							/>
							<RLabeledSection
								label="First Name*"
								body={
									<RInput
										value={firstName as string}
										onInput={(e) => {
											setFirstName(
												(e.target as HTMLInputElement)
													.value
											);
										}}
										isRequired
										validationSchema={z.string()}
									/>
								}
							/>
							<RLabeledSection
								label="Last Name*"
								body={
									<RInput
										value={lastName as string}
										onInput={(e) => {
											setLastName(
												(e.target as HTMLInputElement)
													.value
											);
										}}
										isRequired
										validationSchema={z.string()}
									/>
								}
							/>

							<RLabeledSection
								label="Current Role Title"
								body={
									<RInput
										value={currentRoleTitle as string}
										onInput={(e) => {
											setCurrentRoleTitle(
												(e.target as HTMLInputElement)
													.value
											);
										}}
										placeholder="enter current role"
									/>
								}
							/>
							<RLabeledSection
								label="LinkedIn URL"
								body={
									<RInput
										value={linkedInUrl as string}
										onInput={(e) => {
											setLinkedInUrl(
												(e.target as HTMLInputElement)
													.value
											);
										}}
										placeholder="enter Linkedin url"
										validationSchema={z
											.string()
											.url()
											.refine(
												(value) => {
													try {
														const url = new URL(
															value
														);
														return (
															url.hostname ===
															'www.linkedin.com'
														);
													} catch {
														return false;
													}
												},
												{
													message:
														'Must be a valid LinkedIn URL.',
												}
											)}
									/>
								}
							/>
							<RLabeledSection
								label="Twitter URL"
								body={
									<RInput
										value={twitterUrl as string}
										onInput={(e) => {
											setTwitterUrl(
												(e.target as HTMLInputElement)
													.value
											);
										}}
										placeholder="enter Twitter profile url"
										validationSchema={z
											.string()
											.url()
											.refine(
												(value) => {
													try {
														const url = new URL(
															value
														);
														return (
															url.hostname ===
																'twitter.com' ||
															url.hostname ===
																'www.twitter.com' ||
															url.hostname ===
																'x.com' ||
															url.hostname ===
																'www.x.com'
														);
													} catch {
														return false;
													}
												},
												{
													message:
														'Must be a valid Twitter URL.',
												}
											)}
									/>
								}
							/>
							<RLabeledSection
								label="Personal Site URL"
								body={
									<RInput
										value={personalSiteUrl as string}
										onInput={(e) => {
											setPersonalSiteUrl(
												(e.target as HTMLInputElement)
													.value
											);
										}}
										placeholder="enter personal site url"
										validationSchema={z.string().url()}
									/>
								}
							/>
							<RLabeledSection
								label="Current Location"
								body={
									<RInput
										value={currentLocation as string}
										onInput={(e) => {
											setCurrentLocation(
												(e.target as HTMLInputElement)
													.value
											);
										}}
									/>
								}
							/>
							<RLabeledSection
								label="Education"
								body={
									<RInput
										value={education as string}
										onInput={(e) => {
											setEducation(
												(e.target as HTMLInputElement)
													.value
											);
										}}
									/>
								}
							/>
						</div>
					</div>
					<Separator />
				</div>
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
					console.log('exists');
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
