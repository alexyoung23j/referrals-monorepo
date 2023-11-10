/* eslint-disable indent */
import { RButton } from '~/components/ui/button';
import { api } from '~/utils/api';
import { RText } from '~/components/ui/text';
import { RLabeledSection } from '~/components/ui/labeled_section';
import { RInput } from '~/components/ui/input';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { RTextarea } from '~/components/ui/textarea';
import { useToast } from '~/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '../ui/spinner';
import RSpinner from '../ui/spinner';
import { useMediaQuery } from 'react-responsive';
import { RSelector } from '../ui/select';
import { useSession } from 'next-auth/react';
import Icon from '../ui/icons';
import { ConfirmationModal } from '../modals/confirmation_modal';
import { Organization } from '@prisma/client';
import { RTooltip } from '../ui/tooltip';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
	process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? ''
);

export default function PersonalInfoSection() {
	const { toast } = useToast();
	const { data: profileData, status } = api.profiles.getProfile.useQuery(
		undefined,
		{
			refetchOnWindowFocus: false,
		}
	);

	const {
		data: organizationsData,
		status: organizationsStatus,
		refetch: refetchOrgsData,
	} = api.organizations.getOrganizations.useQuery(undefined, {
		refetchOnWindowFocus: false,
	});

	const { data: sessionData } = useSession();

	const isMobileScreen = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const updateProfile = api.profiles.updateProfile.useMutation();
	const joinOrg = api.organizations.joinOrganization.useMutation();
	const leaveOrg = api.organizations.leaveOrganization.useMutation();
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [publicEmail, setPublicEmail] = useState('');
	const [currentRoleTitle, setCurrentRoleTitle] = useState('');
	const [linkedInUrl, setLinkedInUrl] = useState('');
	const [twitterUrl, setTwitterUrl] = useState('');
	const [githubUrl, setGithubUrl] = useState('');
	const [personalSiteUrl, setPersonalSiteUrl] = useState('');
	const [currentLocation, setCurrentLocation] = useState('');
	const [education, setEducation] = useState('');
	const [defaultMessage, setDefaultMessage] = useState('');
	const [experienceBlurb, setExperienceBlurb] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');

	const [hasFormErrors, setHasFormErrors] = useState(false);
	const [savedStatus, setSavedStatus] = useState('Saved');

	const [localAvatarUrl, setLocalAvatarUrl] = useState('');
	const [avatarLoading, setAvatarLoading] = useState(true);

	const [joinOrgModalOpen, setJoinOrgModalOpen] = useState(false);
	const [orgToJoin, setOrgToJoin] = useState<Organization | null>(null);
	const [orgPassword, setOrgPassword] = useState('');

	const onFileSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setAvatarLoading(true);

		const { files } = event.target;

		let file;
		if (files && files[0]) {
			file = files[0] || null;
		}
		if (!file) {
			return;
		}

		try {
			const id = uuidv4();

			const { data, error } = await supabase.storage
				.from('avatar_images')
				.upload(`${id}/${file.name}`, file);

			const path = data?.path;
			const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatar_images/${path}`;

			if (error) {
				console.error(error);
				toast({
					title: 'Error uploading image.',
					duration: 1500,
				});
				return;
			}

			setLocalAvatarUrl(url);
			await updateProfile.mutateAsync({
				avatarUrl: url,
			});
		} catch (e) {
			console.error('Error while generating presigned URL: ', e);
		}
		setAvatarLoading(false);
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
		if (profileData?.githubUrl) {
			setGithubUrl(profileData.githubUrl as string);
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
		if (profileData?.defaultMessage) {
			setDefaultMessage(profileData.defaultMessage as string);
		}
		if (profileData?.avatarUrl) {
			setLocalAvatarUrl(profileData.avatarUrl as string);
		}
		if (profileData?.experienceBlurb) {
			setExperienceBlurb(profileData.experienceBlurb as string);
		}
		if (profileData?.phoneNumber) {
			setPhoneNumber(profileData.phoneNumber as string);
		}
		setAvatarLoading(false);
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
				githubUrl,
				personalSiteUrl,
				currentLocation,
				education,
				defaultMessage,
				experienceBlurb,
				phoneNumber,
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
		<div className="my-[24px] flex w-full flex-col gap-[36px]">
			<ConfirmationModal
				open={joinOrgModalOpen}
				onOpenChange={(isOpen) => {
					setJoinOrgModalOpen(isOpen);
				}}
				headerText={`Join ${orgToJoin?.name}`}
				content={
					<div className="flex flex-col gap-4">
						<RText>
							{`Joining will add your profile to the ${orgToJoin?.name} page `}
							<RText
								className="cursor-pointer underline"
								onClick={() => {
									window.open(
										`/org/${orgToJoin?.id}`,
										'_blank'
									);
								}}
							>
								here
							</RText>
							.
						</RText>
						<RInput
							onChange={(e) => {
								setOrgPassword(e.target.value);
							}}
							placeholder="enter password"
							value={orgPassword}
						/>
					</div>
				}
				onCancel={() => {
					setJoinOrgModalOpen(false);
					setOrgPassword('');
				}}
				onConfirm={async () => {
					try {
						await joinOrg.mutateAsync({
							organizationId: orgToJoin?.id as string,
							password: orgPassword,
						});
						toast({
							title: 'Joined organization!',
							duration: 1500,
						});
						setJoinOrgModalOpen(false);
						await refetchOrgsData();
					} catch (e) {
						toast({
							title: 'Error joining organization.',
							duration: 1500,
						});
					}
					setOrgPassword('');
				}}
				destructive={false}
				confirmButtonText="Join"
			/>
			<div className="flex w-full items-center justify-between">
				<RText fontSize="h2" fontWeight="medium">
					Personal Information
				</RText>
				<RText fontSize="b2" color="tertiary">
					{savedStatus}
				</RText>
			</div>

			{status === 'success' ? (
				<div className="flex w-full flex-col lg:flex-row">
					<div className="flex w-full flex-col gap-[24px] lg:w-[55%] lg:pr-[10%]">
						<RLabeledSection
							label="First Name*"
							body={
								<RInput
									value={firstName as string}
									onInput={(e) => {
										setFirstName(
											(e.target as HTMLInputElement).value
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
											(e.target as HTMLInputElement).value
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
							label="LinkedIn URL"
							body={
								<RInput
									value={linkedInUrl as string}
									onInput={(e) => {
										setLinkedInUrl(
											(e.target as HTMLInputElement).value
										);
									}}
									placeholder="enter Linkedin url"
									validationSchema={z
										.string()
										.url()
										.refine(
											(value) => {
												try {
													const url = new URL(value);
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
											(e.target as HTMLInputElement).value
										);
									}}
									placeholder="enter Twitter profile url"
									validationSchema={z
										.string()
										.url()
										.refine(
											(value) => {
												try {
													const url = new URL(value);
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
							label="Github URL"
							body={
								<RInput
									value={githubUrl as string}
									onInput={(e) => {
										setGithubUrl(
											(e.target as HTMLInputElement).value
										);
									}}
									placeholder="enter Github profile url"
									validationSchema={z
										.string()
										.url()
										.refine(
											(value) => {
												try {
													const url = new URL(value);
													return (
														url.hostname ===
															'github.com' ||
														url.hostname ===
															'www.github.com'
													);
												} catch {
													return false;
												}
											},
											{
												message:
													'Must be a valid Github URL.',
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
											(e.target as HTMLInputElement).value
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
						<RLabeledSection
							label="Phone number"
							body={
								<RInput
									value={phoneNumber as string}
									onInput={(e) => {
										setPhoneNumber(
											(e.target as HTMLInputElement).value
										);
									}}
									placeholder="enter phone number"
									validationSchema={z
										.string()
										.regex(
											/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/,
											'Must be a valid phone number'
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
							label="Current Location"
							body={
								<RInput
									value={currentLocation as string}
									onInput={(e) => {
										setCurrentLocation(
											(e.target as HTMLInputElement).value
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
											(e.target as HTMLInputElement).value
										);
									}}
									placeholder="enter a school name"
									onChange={() => {
										setSavedStatus('Unsaved');
									}}
								/>
							}
						/>
						{organizationsData && organizationsData.length > 0 && (
							<RLabeledSection
								label="Organizations"
								showInfo
								infoContent={
									<div>
										<RText fontSize="b2" color="secondary">
											{`Joining an organization will allow your profile to appear on the Organization page, 
										which lists the members of the org and their referral requests. You will need a password to join an org.`}
										</RText>
									</div>
								}
								subtitle="Join an organization. If you'd like to create an organization, please contact us."
								body={
									<div className="w-full">
										<div className="border-input bg-background placeholder:text-muted-foreground flex max-h-[200px] w-full  flex-col overflow-auto rounded-md border px-2 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50">
											{organizationsData?.map((org) => {
												const isJoined = org.users.some(
													(user) =>
														user.userId ===
														sessionData?.user.id
												);

												return (
													<div
														key={org.id}
														className="hover:bg-accent flex w-full cursor-pointer items-center justify-between gap-2 rounded-[4px] px-2 py-2"
														onClick={async () => {
															if (
																!isJoined &&
																org
															) {
																setOrgToJoin(
																	org as Organization
																);
																setJoinOrgModalOpen(
																	true
																);
															} else if (
																isJoined &&
																org
															) {
																window.open(
																	`/org/${org?.id}`,
																	'_blank'
																);
															}
														}}
													>
														{org?.name}
														{isJoined && (
															<RTooltip
																trigger={
																	<Icon
																		name="check"
																		size={
																			14
																		}
																		onClick={async () => {
																			try {
																				await leaveOrg.mutateAsync(
																					{
																						organizationId:
																							org.id,
																					}
																				);
																				toast(
																					{
																						title: 'Left organization.',
																						duration: 1500,
																					}
																				);
																			} catch (e) {
																				toast(
																					{
																						title: 'Error leaving organization.',
																						duration: 1500,
																					}
																				);
																			}
																			await refetchOrgsData();
																		}}
																	/>
																}
																content={
																	<div>
																		<RText fontSize="b2">
																			Click
																			to
																			remove
																			yourself
																			from
																			this
																			organization.
																		</RText>
																	</div>
																}
																align="start"
																side="right"
															/>
														)}
													</div>
												);
											})}
										</div>
									</div>
								}
							/>
						)}
					</div>
					<div
						className={`mt-[24px] flex h-full w-full flex-col gap-[24px] lg:mt-[0px] lg:w-[45%] ${
							isMobileScreen ? '' : 'pr-[5%]'
						}`}
					>
						<div
							className={`${
								isMobileScreen && 'flex-col'
							} flex items-center gap-6`}
						>
							<Avatar
								className={`${
									isMobileScreen
										? 'h-[15vh] w-[15vh]'
										: 'h-[15vw] max-h-[220px] w-[15vw] max-w-[220px]'
								}`}
							>
								<AvatarImage
									src={localAvatarUrl}
									style={{
										objectFit: 'cover',
										objectPosition: 'top',
									}}
								/>
								<AvatarFallback>
									{avatarLoading ? (
										<RSpinner size="medium" />
									) : (
										`${firstName[0]}${lastName[0]}`
									)}
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
							label="Current Role Title"
							body={
								<RInput
									value={currentRoleTitle as string}
									onInput={(e) => {
										setCurrentRoleTitle(
											(e.target as HTMLInputElement).value
										);
									}}
									placeholder="enter current role"
								/>
							}
						/>
						<RLabeledSection
							label="Public Email*"
							subtitle="This address will be shared via your referral links."
							body={
								<RInput
									value={publicEmail as string}
									onInput={(e) => {
										setPublicEmail(
											(e.target as HTMLInputElement).value
										);
									}}
									placeholder="enter email address"
									isRequired
									validationSchema={z.string().email({
										message: 'Must be valid email address.',
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
							label="Experience Blurb"
							showInfo
							infoContent={
								<div>
									<RText fontSize="b2" color="secondary">
										{`Referrers often need a quick blurb to help them communicate your background and experience.
										 This blurb will be available to referrers by default on your shareable link pages.`}
									</RText>
								</div>
							}
							subtitle="Available to referrers to help communicate your background and experience."
							body={
								<RTextarea
									placeholder="enter short blurb describing yourself"
									className="min-h-[120px]"
									value={experienceBlurb as string}
									onInput={(e) => {
										setExperienceBlurb(
											(e.target as HTMLInputElement).value
										);
										setSavedStatus('Unsaved');
									}}
								/>
							}
						/>
						<RLabeledSection
							label="Default Link Message"
							showInfo
							infoContent={
								<div>
									<RText fontSize="b2" color="secondary">
										{`This message will appear on link pages you share. Use it to thank your referrers, provide additional context
											about your job search, or even offer a reward for successful referrals. You can customize this
											message for specific requests in the dasbboard, but this will be the default.`}
									</RText>
								</div>
							}
							subtitle="This message will appear on link pages you share."
							body={
								<RTextarea
									placeholder="enter short message to thank your referrers or provide them additional context."
									className="min-h-[120px]"
									value={defaultMessage as string}
									onInput={(e) => {
										setDefaultMessage(
											(e.target as HTMLInputElement).value
										);
										setSavedStatus('Unsaved');
									}}
								/>
							}
						/>
					</div>
				</div>
			) : (
				<Spinner size="large" />
			)}
			<RButton
				onClick={onSaveProfile}
				iconName="check"
				className="mt-10"
				variant={savedStatus === 'Saved' ? 'secondary' : 'default'}
				disabled={savedStatus === 'Saved'}
			>
				Save
			</RButton>
		</div>
	);
}
