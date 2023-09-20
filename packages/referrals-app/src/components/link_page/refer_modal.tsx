/* eslint-disable indent */
import {
	ReferralRequest,
	Company,
	Link,
	JobExperience,
	UserProfile,
	User,
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
import { toast } from '../ui/use-toast';
import { RSelector } from '../ui/select';
import { RText } from '../ui/text';
import { useMediaQuery } from 'react-responsive';
import { RCalendar } from '../ui/calendar';

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
									date={new Date()}
									onSelect={(date: Date) => {
										console.log(date);
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
						onClick={() => {
							// Send email do some form validation
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
													{`${userProfile.firstName} connects with recruiter via email`}
												</RText>
											</div>
										),
									},
									// {
									// 	value: ReferralTypeOptions.EMAIL_ME,
									// 	content: (
									// 		<div
									// 			className={`flex ${
									// 				isMobile
									// 					? 'w-[224px]'
									// 					: 'w-[284px]'
									// 			} items-start`}
									// 		>
									// 			<RText>
									// 				{`Email me ${userProfile.firstName}'s info`}
									// 			</RText>
									// 		</div>
									// 	),
									// },
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
													{`I want to connect with ${userProfile.firstName} before referring`}
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
							/>
						}
					/>
				</div>,
			],
		},
	];
};

const mainBody = ({
	link,
	name,
	requesterName,
	isAllRequests,
	referNow,
	selectedReferralOption,
}: {
	link: Link;
	name: string;
	requesterName: string;
	isAllRequests: boolean;
	referNow: boolean;
	selectedReferralOption: string | null;
}): {
	type: 'single-column' | 'two-column';
	content: JSX.Element[] | null;
}[] => {
	return [{ type: 'single-column', content: [<div key="1"></div>] }];
};

const ReferralTypeOptions = {
	LINK: 'link',
	INTERNAL: 'internal',
	CONTACT: 'contact',
	INTRO: 'intro',
	EMAIL_ME: 'email_me',
};

export default function ReferModal({
	isOpen,
	onOpenChange,
	referralRequest,
	isAllRequests,
	userProfile,
	pageViewerName,
	setPageViewerName,
	existingPageLink,
}: {
	isOpen: boolean;
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
	const [referNow, setReferNow] = useState(true);
	const [selectedReferralOption, setSelectedReferralOption] = useState(null);
	const [emailAddress, setEmailAddress] = useState('');
	const topSection: {
		type: 'single-column' | 'two-column';
		content: JSX.Element[] | null;
	}[] = referNow
		? ChoicesSection({
				referralRequest,
				userProfile,
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
								label: 'Set reminder',
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
		}),
	];

	return (
		<ActivityModal
			open={isOpen}
			onOpenChange={(open) => {
				onOpenChange(open);
				if (!open) {
					setReferNow(true);
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
	);
}
