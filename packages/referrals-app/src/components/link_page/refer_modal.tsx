/* eslint-disable indent */
import {
	type ReferralRequest,
	type Company,
	type Link,
	type JobExperience,
	type UserProfile,
	type User,
} from '@prisma/client';
import ActivityModal from '../modals/activity_modal';
import { api } from '~/utils/api';
import { useEffect, useState } from 'react';
import { RLabeledSection } from '../ui/labeled_section';
import { RTextarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { RTabsSection } from '../ui/tabs';
import { RInput } from '../ui/input';
import Spinner from '../ui/spinner';
import { RTag } from '../ui/tag';
import Image from 'next/image';
import { RButton } from '../ui/button';
import { toast, useToast } from '../ui/use-toast';
import { RSelector } from '../ui/select';
import { RText } from '../ui/text';
import { useMediaQuery } from 'react-responsive';
import { RCalendar } from '../ui/calendar';
import { handleDownload } from '../ui/pdf';
import { z } from 'zod';
import Confetti from 'react-confetti';
import { TRPCClientError } from '@trpc/client';

const buildIntroMessage = ({
	blurb,
	firstName,
	jobTitle,
	companyName,
	jobPostingLink,
	isAnyOpenRole,
}: {
	blurb: string;
	firstName: string;
	jobTitle: string;
	companyName: string;
	jobPostingLink: string;
	isAnyOpenRole: boolean;
}) => {
	return `Hey [[contact name]], \n\nI'd like to introduce ${firstName}, who is interested in ${
		isAnyOpenRole ? 'a' : 'the ' + jobTitle
	} role at ${companyName}${
		isAnyOpenRole ? '' : ` (${jobPostingLink})`
	}. I've CC'd ${firstName} on this email and attached a current resume. Here's a little bit about ${firstName}:\n\n"${blurb}"\n\nI'll let you take it from here!\n\nThanks,\n[[your name]]
	`;
};

const RemindSection = ({
	link,
	name,
	requesterName,
	isAllRequests,
	referNow,
	selectedReferralOption,
	setPageViewerName,
	emailAddress,
	setEmailAddress,
	setEmailScheduledAt,
	validateFormAndScheduleEmail,
	setIsOpen,
	runConfetti,
	closeModalCleanup,
	isProcessing,
	setIsProcessing,
}: {
	link: Link;
	name: string;
	requesterName: string;
	isAllRequests: boolean;
	referNow: boolean;
	selectedReferralOption: string | null;
	setPageViewerName: (name: string) => void;
	emailAddress: string;
	setEmailAddress: (email: string) => void;
	setEmailScheduledAt: (date: Date) => void;
	validateFormAndScheduleEmail: (emailType: EmailType) => Promise<void>;
	setIsOpen: (open: boolean) => void;
	runConfetti: () => void;
	closeModalCleanup: () => void;
	isProcessing: boolean;
	setIsProcessing: (processing: boolean) => void;
}): {
	type: 'single-column' | 'two-column';
	content: JSX.Element[] | null;
}[] => {
	// Cannot delete this for stupid react reasons
	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});

	return [
		{
			type: 'two-column',
			content: [
				<div key="name" className="w-full">
					<RLabeledSection
						label="Your Name*"
						body={
							<RInput
								value={requesterName}
								onInput={(e) => {
									setPageViewerName(e.currentTarget.value);
								}}
							/>
						}
					/>
				</div>,
				<div key="email" className="w-full">
					<RLabeledSection
						label="Your Email*"
						body={
							<RInput
								value={emailAddress}
								onInput={(e) => {
									setEmailAddress(e.currentTarget.value);
								}}
								validationSchema={z.string().email()}
							/>
						}
					/>
				</div>,
			],
		},
		{
			type: 'single-column',
			content: [
				<div key="calendar">
					<RLabeledSection
						label="Set a reminder date*"
						subtitle={`You will be emailed with a reminder to refer ${name}, along with all the info you need 🫡 `}
						body={
							<div className="flex w-full justify-center">
								<RCalendar
									futureOnly
									date={new Date()}
									onSelect={(date: Date) => {
										const now = new Date();
										let scheduledDate;
										if (
											date.getDate() === now.getDate() &&
											date.getMonth() ===
												now.getMonth() &&
											date.getFullYear() ===
												now.getFullYear()
										) {
											console.log('Huh');
											// If the selected date is today, schedule the email for 3 hours from now
											scheduledDate = new Date(
												now.getTime() +
													3 * 60 * 60 * 1000
											);
											console.log({ scheduledDate });
										} else {
											console.log('in here??');
											// If the selected date is in the future, schedule the email for a random time between 10AM and 2PM
											scheduledDate = new Date(
												date.getTime()
											);
											scheduledDate.setHours(
												Math.floor(
													Math.random() *
														(14 - 10 + 1)
												) + 10
											);
											// Set minutes to a random value between 0 and 59
											scheduledDate.setMinutes(
												Math.floor(Math.random() * 60)
											);
											scheduledDate.setSeconds(0);
										}
										setEmailScheduledAt(scheduledDate);
									}}
								/>
							</div>
						}
					/>
				</div>,
			],
		},
		{
			type: 'single-column',
			content: [
				<div
					key="button"
					className="mt-[8px] flex w-full justify-center"
				>
					<RButton
						iconName="calendar-plus"
						isLoading={isProcessing}
						onClick={async () => {
							setIsProcessing(true);
							try {
								await validateFormAndScheduleEmail(
									'REFERRAL_REMINDER'
								);
								runConfetti();
								closeModalCleanup();
								toast({
									title: 'Reminder scheduled!',
									duration: 4000,
								});
							} catch (e) {}
							setIsProcessing(false);
						}}
					>
						Schedule reminder
					</RButton>
				</div>,
			],
		},
	];
};

const ChoicesSection = ({
	referralRequest,
	userProfile,
	setSelectedReferralOption,
}: {
	referralRequest:
		| null
		| (ReferralRequest & {
				company: Company;
		  });
	userProfile: UserProfile & {
		JobExperience: Array<JobExperience & { company: Company }>;
		user: User;
	};
	setSelectedReferralOption: (value: string | null) => void;
}): {
	type: 'single-column' | 'two-column';
	content: JSX.Element[] | null;
}[] => {
	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});

	return [
		{
			type: 'single-column',
			content: [
				<div key="type-choice">
					<RLabeledSection
						label={`How does ${referralRequest?.company.name} handle referrals?`}
						body={
							<RSelector
								items={[
									{
										value: ReferralTypeOptions.INTERNAL,
										content: (
											<div
												className={`flex ${
													isMobile
														? 'w-[224px]'
														: 'w-[284px]'
												} items-start`}
											>
												<RText>{`I submit ${userProfile.firstName}'s info internally`}</RText>
											</div>
										),
									},
									{
										value: ReferralTypeOptions.LINK,
										content: (
											<div
												className={`flex ${
													isMobile
														? 'w-[224px]'
														: 'w-[284px]'
												} items-start`}
											>
												<RText>
													{`${userProfile.firstName} fills out a job posting link`}
												</RText>
											</div>
										),
									},
									{
										value: ReferralTypeOptions.INTRO,
										content: (
											<div
												className={`flex ${
													isMobile
														? 'w-[224px]'
														: 'w-[284px]'
												} items-start`}
											>
												<RText>
													{`Connect ${userProfile.firstName} with recruiter/HR`}
												</RText>
											</div>
										),
									},
									{
										value: ReferralTypeOptions.CONTACT,
										content: (
											<div
												className={`flex ${
													isMobile
														? 'w-[224px]'
														: 'w-[284px]'
												} items-start`}
											>
												<RText>
													{`I want to connect with ${userProfile.firstName} first`}
												</RText>
											</div>
										),
									},
								]}
								defaultValue={{
									value: ReferralTypeOptions.INTERNAL,
									content: (
										<div
											className={`flex ${
												isMobile
													? 'w-[224px]'
													: 'w-[284px]'
											} items-start`}
										>
											<RText color="secondary">
												Select option
											</RText>
										</div>
									),
								}}
								onSelect={(value) => {
									// TODO: this value is not persisting when you switch tabs from Refer Now to Schedule
									setSelectedReferralOption(value);
								}}
							/>
						}
					/>
				</div>,
			],
		},
	];
};

interface InfoSectionProps {
	firstName: string;
	publicEmail: string;
	experienceBlurb: string;
	onClickDownload?: () => void;
	includeBlurb?: boolean;
}

const InfoSection: React.FC<InfoSectionProps> = ({
	firstName,
	publicEmail,
	experienceBlurb,
	onClickDownload,
	includeBlurb = true,
}) => {
	return (
		<RLabeledSection
			label={`${firstName}'s information`}
			subtitle="Quick access to the info you need to get this referral submitted."
			body={
				<div className="flex flex-col gap-4">
					<div className="flex flex-col justify-between gap-4 sm:flex-row">
						<RInput
							readOnly
							copyEnabled
							value={publicEmail}
							className="min-w-[240px]"
							highlighted
						/>
						<RButton
							variant="secondary"
							iconName="download"
							onClick={onClickDownload}
						>
							Download Resume
						</RButton>
					</div>
					{includeBlurb && (
						<div className="flex flex-col gap-1">
							<RText fontSize="b2" color="tertiary">
								Blurb
							</RText>
							<RTextarea
								value={
									experienceBlurb
										? experienceBlurb
										: 'No blurb set'
								}
								readOnly
								copyEnabled
								highlighted
								className="text-textSecondary h-[140px]"
							/>
						</div>
					)}
				</div>
			}
		/>
	);
};

const mainBody = ({
	link,
	name,
	requesterName,
	isAllRequests,
	referNow,
	selectedReferralOption,
	referralRequest,
	userProfile,
	emailAddress,
	setEmailAddress,
	setPageViewerName,
	messageToRequester,
	setMessageToRequester,
	specialJobPostingLink,
	setSpecialJobPostingLink,
	meetingScheduleLink,
	setMeetingScheduleLink,
	isMobile,
	validateFormAndScheduleEmail,
	closeModalCleanup,
	isProcessing,
	setIsProcessing,
	runConfetti,
}: {
	link: Link;
	name: string;
	requesterName: string;
	isAllRequests: boolean;
	referNow: boolean;
	selectedReferralOption: string | null;
	referralRequest:
		| null
		| (ReferralRequest & {
				company: Company;
		  });
	userProfile: UserProfile & {
		JobExperience: Array<JobExperience & { company: Company }>;
		user: User;
	};
	emailAddress: string;
	setEmailAddress: (email: string) => void;
	setPageViewerName: (name: string) => void;
	messageToRequester: string;
	setMessageToRequester: (message: string) => void;
	specialJobPostingLink: string;
	setSpecialJobPostingLink: (link: string) => void;
	meetingScheduleLink: string;
	setMeetingScheduleLink: (link: string) => void;
	isMobile: boolean;
	validateFormAndScheduleEmail: (emailType: EmailType) => Promise<void>;
	closeModalCleanup: () => void;
	isProcessing: boolean;
	setIsProcessing: (processing: boolean) => void;
	runConfetti: () => void;
}): {
	type: 'single-column' | 'two-column';
	content: JSX.Element[] | null;
}[] => {
	if (!referNow) {
		return [];
	}

	switch (selectedReferralOption) {
		case ReferralTypeOptions.CONTACT: {
			return [
				{
					type: 'two-column',
					content: [
						<div key="name" className="w-full">
							<RLabeledSection
								label="Your Name*"
								body={
									<RInput
										value={requesterName}
										onInput={(e) => {
											setPageViewerName(
												e.currentTarget.value
											);
										}}
										placeholder="enter name"
									/>
								}
							/>
						</div>,
						<div key="email" className="w-full">
							<RLabeledSection
								label="Your Email*"
								body={
									<RInput
										value={emailAddress}
										onInput={(e) => {
											setEmailAddress(
												e.currentTarget.value
											);
										}}
										placeholder="enter email"
										validationSchema={z.string().email()}
									/>
								}
							/>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div key="1">
							<RLabeledSection
								label="Scheduling link"
								subtitle="Include an optional scheduling link to meet."
								body={
									<RInput
										placeholder="enter link, e.g. calendly.com/.."
										value={meetingScheduleLink}
										onInput={(e) => {
											setMeetingScheduleLink(
												e.currentTarget.value
											);
										}}
										validationSchema={z.string().url()}
									/>
								}
							/>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div key="1">
							<RLabeledSection
								label="Message*"
								subtitle={`A message to ${userProfile.firstName}, included in the email.`}
								body={
									<RTextarea
										value={messageToRequester}
										onInput={(e) => {
											setMessageToRequester(
												e.currentTarget.value
											);
										}}
										placeholder="type your message here"
										required
									/>
								}
							/>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div
							key="1"
							className="flex flex-col items-center gap-3 sm:flex-row"
						>
							<RInput
								readOnly
								highlighted
								copyEnabled
								value={userProfile.publicEmail as string}
								className="min-w-[240px]"
							/>
							<RText
								fontSize="b2"
								fontWeight="light"
								color="tertiary"
							>
								Feel free to reach out manually instead
							</RText>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div
							key="button"
							className="mt-[8px] flex w-full justify-center"
						>
							<RButton
								isLoading={isProcessing}
								iconName="send"
								onClick={async () => {
									setIsProcessing(true);
									try {
										await validateFormAndScheduleEmail(
											'MESSAGE_FROM_REFERRER'
										);
										runConfetti();
										closeModalCleanup();
										toast({
											title: 'Email sent!',
											duration: 4000,
										});
									} catch (e) {}
									setIsProcessing(false);
								}}
							>
								Send message
							</RButton>
						</div>,
					],
				},
			];
		}
		case ReferralTypeOptions.INTRO: {
			return [
				{
					type: 'single-column',
					content: [
						<div key="1">
							<InfoSection
								publicEmail={userProfile.publicEmail as string}
								firstName={userProfile.firstName as string}
								experienceBlurb={
									userProfile.experienceBlurb as string
								}
								onClickDownload={() => {
									if (userProfile.resumeUrl) {
										handleDownload(
											userProfile.resumeUrl as string
										);
									}
								}}
								includeBlurb={false}
							/>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div key="1">
							<RLabeledSection
								label="Intro message template"
								subtitle="An example intro message to send to your recruiter/HR contact. Edit as needed!"
								body={
									<RTextarea
										defaultValue={buildIntroMessage({
											blurb: userProfile.experienceBlurb as string,
											firstName:
												userProfile.firstName as string,
											jobTitle:
												referralRequest?.jobTitle as string,
											companyName: referralRequest
												?.company.name as string,
											jobPostingLink:
												referralRequest?.jobPostingLink as string,
											isAnyOpenRole:
												referralRequest?.isAnyOpenRole as boolean,
										})}
										placeholder="type your message here"
										highlighted
										copyEnabled
										className={
											isMobile ? 'h-[500px]' : 'h-[300px]'
										}
									/>
								}
							/>
						</div>,
					],
				},
				{
					type: 'two-column',
					content: [
						<div key="name" className="w-full">
							<RLabeledSection
								label="Your Name*"
								body={
									<RInput
										value={requesterName}
										onInput={(e) => {
											setPageViewerName(
												e.currentTarget.value
											);
										}}
										placeholder="enter name"
									/>
								}
							/>
						</div>,
						<div key="email" className="w-full">
							<RLabeledSection
								label="Your Email*"
								body={
									<RInput
										value={emailAddress}
										onInput={(e) => {
											setEmailAddress(
												e.currentTarget.value
											);
										}}
										placeholder="enter email"
										validationSchema={z.string().email()}
									/>
								}
							/>
						</div>,
					],
				},

				{
					type: 'single-column',
					content: [
						<div
							key="button"
							className="mt-[8px] flex w-full justify-center"
						>
							<RButton
								iconName="check"
								isLoading={isProcessing}
								onClick={async () => {
									setIsProcessing(true);
									try {
										await validateFormAndScheduleEmail(
											'REFERRAL_CONFIRMATION'
										);
										runConfetti();
										closeModalCleanup();
										toast({
											title: 'Referral confirmation sent!',
											duration: 4000,
										});
									} catch (e) {}
									setIsProcessing(false);
								}}
							>
								Confirm intro sent
							</RButton>
						</div>,
					],
				},
			];
		}
		case ReferralTypeOptions.LINK: {
			return [
				{
					type: 'two-column',
					content: [
						<div key="name" className="w-full">
							<RLabeledSection
								label="Your Name*"
								body={
									<RInput
										value={requesterName}
										onInput={(e) => {
											setPageViewerName(
												e.currentTarget.value
											);
										}}
										placeholder="enter name"
									/>
								}
							/>
						</div>,
						<div key="email" className="w-full">
							<RLabeledSection
								label="Your Email*"
								body={
									<RInput
										value={emailAddress}
										onInput={(e) => {
											setEmailAddress(
												e.currentTarget.value
											);
										}}
										placeholder="enter email"
										validationSchema={z.string().email()}
									/>
								}
							/>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div key="1">
							<RLabeledSection
								label="Special job posting link*"
								subtitle={`This link will be sent to ${userProfile.firstName}. `}
								body={
									<RInput
										placeholder="enter link"
										value={specialJobPostingLink}
										onInput={(e) => {
											setSpecialJobPostingLink(
												e.currentTarget.value
											);
										}}
										validationSchema={z.string().url()}
									/>
								}
							/>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div key="1">
							<RLabeledSection
								label="Message"
								subtitle={`A message to ${userProfile.firstName}, included with the job posting link.`}
								body={
									<RTextarea
										value={messageToRequester}
										onInput={(e) => {
											setMessageToRequester(
												e.currentTarget.value
											);
										}}
										placeholder="type your message here"
									/>
								}
							/>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div
							key="button"
							className="mt-[8px] flex w-full justify-center"
						>
							<RButton
								iconName="send"
								isLoading={isProcessing}
								onClick={async () => {
									setIsProcessing(true);
									try {
										await validateFormAndScheduleEmail(
											'JOB_LINK'
										);
										runConfetti();
										closeModalCleanup();
										toast({
											title: 'Reminder scheduled!',
											duration: 4000,
										});
									} catch (e) {}
									setIsProcessing(false);
								}}
							>
								Send Link
							</RButton>
						</div>,
					],
				},
			];
		}
		case ReferralTypeOptions.INTERNAL: {
			return [
				{
					type: 'single-column',
					content: [
						<div key="1">
							<InfoSection
								publicEmail={userProfile.publicEmail as string}
								firstName={userProfile.firstName as string}
								experienceBlurb={
									userProfile.experienceBlurb as string
								}
								onClickDownload={() => {
									if (userProfile.resumeUrl) {
										handleDownload(
											userProfile.resumeUrl as string
										);
									}
								}}
							/>
						</div>,
					],
				},
				{
					type: 'two-column',
					content: [
						<div key="name" className="w-full">
							<RLabeledSection
								label="Your Name*"
								body={
									<RInput
										value={requesterName}
										onInput={(e) => {
											setPageViewerName(
												e.currentTarget.value
											);
										}}
										placeholder="enter name"
									/>
								}
							/>
						</div>,
						<div key="email" className="w-full">
							<RLabeledSection
								label="Your Email*"
								body={
									<RInput
										value={emailAddress}
										onInput={(e) => {
											setEmailAddress(
												e.currentTarget.value
											);
										}}
										placeholder="enter email"
										validationSchema={z.string().email()}
									/>
								}
							/>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div key="1">
							<RLabeledSection
								label="Message"
								subtitle={`A message to ${userProfile.firstName}, included in a confirmation email. `}
								body={
									<RTextarea
										value={messageToRequester}
										onInput={(e) => {
											setMessageToRequester(
												e.currentTarget.value
											);
										}}
										placeholder="type your message here"
									/>
								}
							/>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div
							key="button"
							className="mt-[8px] flex w-full justify-center"
						>
							<RButton
								iconName="check"
								isLoading={isProcessing}
								onClick={async () => {
									setIsProcessing(true);
									try {
										await validateFormAndScheduleEmail(
											'REFERRAL_CONFIRMATION'
										);
										runConfetti();
										closeModalCleanup();
										toast({
											title: 'Reminder scheduled!',
											duration: 4000,
										});
									} catch (e) {}
									setIsProcessing(false);
								}}
							>
								Confirm referral submitted
							</RButton>
						</div>,
					],
				},
			];
		}
		default: {
			return [{ type: 'single-column', content: [<div key="1"></div>] }];
		}
	}
};

const ReferralTypeOptions = {
	LINK: 'link',
	INTERNAL: 'internal',
	CONTACT: 'contact',
	INTRO: 'intro',
	EMAIL_ME: 'email_me',
};

type EmailType =
	| 'REFERRAL_REMINDER'
	| 'REFERRAL_REMINDER_NOTIFICATION'
	| 'REFERRAL_CONFIRMATION'
	| 'REFERRAL_CONFIRMATION_NOTIFICATION'
	| 'MESSAGE_FROM_REFERRER'
	| 'JOB_LINK';

export default function ReferModal({
	isOpen,
	setIsOpen,
	onOpenChange,
	referralRequest,
	isAllRequests,
	userProfile,
	pageViewerName,
	setPageViewerName,
	existingPageLink,
}: {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	onOpenChange: (open: boolean) => void;
	referralRequest:
		| null
		| (ReferralRequest & {
				company: Company;
		  });
	isAllRequests: boolean;
	userProfile: UserProfile & {
		JobExperience: Array<JobExperience & { company: Company }>;
		user: User;
	};
	pageViewerName?: string;
	setPageViewerName: (name: string) => void;
	existingPageLink: Link;
}) {
	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});
	const queueEmailJob = api.email.queueEmailJob.useMutation();
	const updateReferralRequest =
		api.referralRequest.updateRequest.useMutation();

	const [referNow, setReferNow] = useState(true);
	const [selectedReferralOption, setSelectedReferralOption] = useState<
		string | null
	>(null);
	const [emailAddress, setEmailAddress] = useState('');
	const [messageToRequester, setMessageToRequester] = useState('');
	const [specialJobPostingLink, setSpecialJobPostingLink] = useState('');
	const [meetingScheduleLink, setMeetingScheduleLink] = useState('');
	const [emailScheduledAt, setEmailScheduledAt] = useState<Date>(new Date()); // default set this to 3 hours from right now
	const { toast } = useToast();
	const [showConfetti, setShowConfetti] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	const runConfetti = () => {
		setShowConfetti(true);
		setTimeout(() => {
			setShowConfetti(false);
		}, 5000);
	};

	// Update email time to 3 hours from now if referNow is false (for reminders)
	useEffect(() => {
		if (referNow) {
			setEmailScheduledAt(new Date());
		} else {
			setEmailScheduledAt(new Date(Date.now() + 1000 * 60 * 60 * 3));
		}
	}, [referNow]);

	const validateFormAndScheduleEmail = async (emailType: EmailType) => {
		if (
			emailAddress.length < 1 ||
			(pageViewerName && pageViewerName?.length < 1) ||
			!pageViewerName
		) {
			toast({
				title: 'Missing email and name fields.',
				duration: 2000,
			});
			throw new Error('Missing field.');
		}
		try {
			await queueEmailJob.mutateAsync({
				message: messageToRequester,
				referralsLink: `${process.env.NEXT_PUBLIC_SERVER_URL}/${existingPageLink.id}`,
				meetingScheduleLink,
				scheduledAt: emailScheduledAt,
				referrerName: pageViewerName as string,
				referrerEmail: emailAddress,
				emailType,
				seekerUserId: userProfile.id,
				referralRequestId: referralRequest?.id,
				jobTitle: referralRequest?.jobTitle ?? '',
				specialJobPostingLink,
			});

			if (emailType === 'REFERRAL_REMINDER') {
				await updateReferralRequest.mutateAsync({
					id: referralRequest?.id as string,
					status: 'COMMITTED',
					referrerName: pageViewerName as string,
					referrerEmail: emailAddress,
				});
			} else if (emailType === 'REFERRAL_CONFIRMATION') {
				await updateReferralRequest.mutateAsync({
					id: referralRequest?.id as string,
					status: 'COMPLETED',
					referrerName: pageViewerName as string,
					referrerEmail: emailAddress,
				});
			} else if (emailType === 'JOB_LINK') {
				await updateReferralRequest.mutateAsync({
					id: referralRequest?.id as string,
					status: 'COMMITTED',
					referrerName: pageViewerName as string,
					referrerEmail: emailAddress,
				});
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			console.error(e);
			toast({
				title: e['message'],
				duration: 2000,
			});
			throw e;
		}
	};

	const closeModalCleanup = () => {
		setIsOpen(false);
		setReferNow(true);
		setMessageToRequester('');
		setSelectedReferralOption(null);
		setIsProcessing(false);
	};

	const topSection: {
		type: 'single-column' | 'two-column';
		content: JSX.Element[] | null;
	}[] = referNow
		? ChoicesSection({
				referralRequest,
				userProfile,
				setSelectedReferralOption,
		  })
		: RemindSection({
				link: existingPageLink,
				name: userProfile.firstName as string,
				requesterName: pageViewerName as string,
				isAllRequests,
				referNow,
				selectedReferralOption,
				setPageViewerName,
				emailAddress,
				setEmailAddress,
				setEmailScheduledAt,
				validateFormAndScheduleEmail,
				setIsOpen,
				runConfetti,
				closeModalCleanup,
				isProcessing,
				setIsProcessing,
		  });

	const sections: {
		type: 'single-column' | 'two-column';
		content: JSX.Element[] | null;
	}[] = [
		{
			type: 'single-column',
			content: [
				<div key="refer-now" className="flex w-full justify-center">
					<RTabsSection
						tabs={[
							{
								label: 'Refer now',
							},
							{
								label: 'Email reminder',
								iconName: 'calendar-plus',
							},
						]}
						onTabsChange={(tab) => {
							if (tab === 'Refer now') {
								setReferNow(true);
							} else {
								setReferNow(false);
							}
						}}
					/>
				</div>,
			],
		},
		...topSection,
		...mainBody({
			link: existingPageLink,
			name: userProfile.firstName as string,
			requesterName: pageViewerName as string,
			isAllRequests,
			referNow,
			selectedReferralOption,
			referralRequest,
			userProfile,
			emailAddress,
			setEmailAddress,
			setPageViewerName,
			messageToRequester,
			setMessageToRequester,
			specialJobPostingLink,
			setSpecialJobPostingLink,
			meetingScheduleLink,
			setMeetingScheduleLink,
			isMobile,
			validateFormAndScheduleEmail,
			closeModalCleanup,
			isProcessing,
			setIsProcessing,
			runConfetti,
		}),
	];

	return (
		<>
			{showConfetti && <Confetti tweenDuration={5000} />}
			<ActivityModal
				open={isOpen}
				onOpenChange={(open) => {
					onOpenChange(open);
					if (!open) {
						setReferNow(true);
						setMessageToRequester('');
						setSelectedReferralOption(null);
					}
				}}
				headerText={`Refer ${userProfile.firstName} to ${referralRequest?.company.name}`}
				subtitleText={`You're a kind soul or on the hunt for that referral bonus 💰. ${userProfile.firstName} thanks you either way!`}
				headerRightContent={
					<div className="flex items-center gap-2">
						<RTag
							className="cursor-pointer"
							label={
								referralRequest?.isAnyOpenRole
									? 'any open role'
									: 'Listing: ' +
									  (referralRequest?.jobTitle as string)
							}
							leftContent={
								<div className="mt-[3px]">
									<Image
										src={
											referralRequest?.company
												?.logoUrl as string
										}
										alt="Logo"
										height={14}
										width={14}
									/>
								</div>
							}
							onClick={() => {
								window.open(
									referralRequest?.jobPostingLink as string
								);
							}}
						/>
					</div>
				}
				sections={sections}
			/>
		</>
	);
}
