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

	const isMobileScreen = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const updateProfile = api.profiles.updateProfile.useMutation();
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
		console.log('im here');
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
