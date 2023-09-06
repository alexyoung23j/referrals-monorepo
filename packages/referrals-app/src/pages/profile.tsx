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

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
	process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? ''
);

export default function ProfilePage() {
	const { toast } = useToast();

	const { data: profileData } = api.profiles.getProfile.useQuery(undefined, {
		refetchOnWindowFocus: false,
	});
	const uploadAvatarImage = api.supabase.uploadImage.useMutation();
	const updateProfile = api.profiles.updateProfile.useMutation();
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [publicEmail, setPublicEmail] = useState('');
	const [currentRoleTitle, setCurrentRoleTitle] = useState('');
	const [linkedInUrl, setLinkedInUrl] = useState('');
	const [twitterUrl, setTwitterUrl] = useState('');
	const [personalSiteUrl, setPersonalSiteUrl] = useState('');
	const [currentLocation, setCurrentLocation] = useState('');
	const [education, setEducation] = useState('');
	const [defaultBlurb, setDefaultBlurb] = useState('');

	const [hasFormErrors, setHasFormErrors] = useState(false);
	const [savedStatus, setSavedStatus] = useState('Saved');

	const [localAvatarUrl, setLocalAvatarUrl] = useState('');

	const onFileSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const { files } = event.target;

		let file;
		if (files && files[0]) {
			file = files[0] || null;
		}
		if (!file) {
			return;
		}

		try {
			const { data, error } = await supabase.storage
				.from('avatar_images')
				.upload(file.name, file);

			const path = data?.path;
			const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatar_images/${path}`;

			if (error) {
				return;
			}

			setLocalAvatarUrl(url);
			await updateProfile.mutateAsync({
				avatarUrl: url,
			});
		} catch (e) {
			console.error('Error while generating presigned URL: ', e);
		}
	};

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
		if (profileData?.currentLocation) {
			setCurrentLocation(profileData.currentLocation as string);
		}
		if (profileData?.education) {
			setEducation(profileData.education as string);
		}
		if (profileData?.defaultBlurb) {
			setDefaultBlurb(profileData.defaultBlurb as string);
		}
		if (profileData?.avatarUrl) {
			setLocalAvatarUrl(profileData.avatarUrl as string);
		}
	}, [profileData]);

	if (!profileData) {
		return null; // TODO: Loading state here
	}

	const onSaveProfile = async () => {
		if (hasFormErrors) {
			toast({
				title: 'Please fix form errors.',
				duration: 1500,
			});
			return;
		}
		try {
			await updateProfile.mutateAsync({
				firstName,
				lastName,
				publicEmail,
				currentRoleTitle,
				linkedInUrl,
				twitterUrl,
				personalSiteUrl,
				currentLocation,
				education,
				defaultBlurb,
				avatarUrl: '',
			});

			setSavedStatus('Saved');
			toast({
				title: 'Profile Saved',
				duration: 1500,
			});
		} catch (e) {
			console.log(e);
		}
	};

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
				<div className="flex max-h-fit w-full flex-col gap-[36px]">
					<div className="my-[24px] flex w-full flex-col gap-[36px]">
						<div className="flex w-full justify-between">
							<RText fontSize="h2" fontWeight="medium">
								Personal Information
							</RText>
							<RText fontSize="b2" color="tertiary">
								{savedStatus}
							</RText>
						</div>

						<div className="flex w-full flex-col lg:flex-row">
							<div className="flex w-full flex-col gap-[24px] lg:w-[55%] lg:pr-[10%]">
								<RLabeledSection
									label="Public Email*"
									subtitle="The email address that all your referrals will use and will be shared on your referral links. "
									body={
										<RInput
											value={publicEmail as string}
											onInput={(e) => {
												setPublicEmail(
													(
														e.target as HTMLInputElement
													).value
												);
											}}
											placeholder="enter email address"
											isRequired
											validationSchema={z.string().email({
												message:
													'Must be valid email address.',
											})}
											onErrorFound={() => {
												setHasFormErrors(true);
											}}
											onErrorFixed={() => {
												setHasFormErrors(false);
											}}
											onChange={() => {
												setSavedStatus('Unsaved');
											}}
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
													(
														e.target as HTMLInputElement
													).value
												);
											}}
											isRequired
											validationSchema={z.string()}
											onErrorFound={() => {
												setHasFormErrors(true);
											}}
											onErrorFixed={() => {
												setHasFormErrors(false);
											}}
											onChange={() => {
												setSavedStatus('Unsaved');
											}}
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
													(
														e.target as HTMLInputElement
													).value
												);
											}}
											isRequired
											validationSchema={z.string()}
											onErrorFound={() => {
												setHasFormErrors(true);
											}}
											onErrorFixed={() => {
												setHasFormErrors(false);
											}}
											onChange={() => {
												setSavedStatus('Unsaved');
											}}
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
													(
														e.target as HTMLInputElement
													).value
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
													(
														e.target as HTMLInputElement
													).value
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
											onErrorFound={() => {
												setHasFormErrors(true);
											}}
											onErrorFixed={() => {
												setHasFormErrors(false);
											}}
											onChange={() => {
												setSavedStatus('Unsaved');
											}}
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
													(
														e.target as HTMLInputElement
													).value
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
											onErrorFound={() => {
												setHasFormErrors(true);
											}}
											onErrorFixed={() => {
												setHasFormErrors(false);
											}}
											onChange={() => {
												setSavedStatus('Unsaved');
											}}
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
													(
														e.target as HTMLInputElement
													).value
												);
											}}
											placeholder="enter personal site url"
											validationSchema={z.string().url()}
											onErrorFound={() => {
												setHasFormErrors(true);
											}}
											onErrorFixed={() => {
												setHasFormErrors(false);
											}}
											onChange={() => {
												setSavedStatus('Unsaved');
											}}
										/>
									}
								/>
							</div>
							<div className="mt-[24px] flex h-full w-full flex-col gap-[24px] pr-[5%] lg:mt-[0px] lg:w-[45%]">
								<div className="flex items-center gap-6">
									<Avatar className="h-[15vw] max-h-[220px] w-[15vw] max-w-[220px]">
										<AvatarImage
											src={localAvatarUrl}
											style={{
												objectFit: 'cover',
												objectPosition: 'top',
											}}
										/>
										<AvatarFallback>
											{firstName[0]}
											{lastName[0]}
										</AvatarFallback>
									</Avatar>
									<RButton
										variant="secondary"
										iconName="image-plus"
										onFileChange={onFileSubmit}
									>
										Upload new
									</RButton>
								</div>
								<RLabeledSection
									label="Experience Blurb"
									subtitle="Available to referrers to help communicate your background and experience."
									body={
										<RTextarea
											placeholder="enter short blurb describing yourself"
											className="min-h-[120px]"
											value={defaultBlurb as string}
											onInput={(e) => {
												setDefaultBlurb(
													(
														e.target as HTMLInputElement
													).value
												);
												setSavedStatus('Unsaved');
											}}
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
													(
														e.target as HTMLInputElement
													).value
												);
											}}
											placeholder="enter a city"
											onChange={() => {
												setSavedStatus('Unsaved');
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
													(
														e.target as HTMLInputElement
													).value
												);
											}}
											placeholder="enter a school name"
											onChange={() => {
												setSavedStatus('Unsaved');
											}}
										/>
									}
								/>
							</div>
						</div>
						<RButton
							onClick={onSaveProfile}
							iconName="check"
							className="mt-10"
							variant={
								savedStatus === 'Saved'
									? 'secondary'
									: 'default'
							}
							disabled={savedStatus === 'Saved'}
						>
							Save
						</RButton>
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
