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

export default function ShareModal({
	isOpen,
	onOpenChange,
	referralRequest,
	isAllRequests,
	userProfile,
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
}) {
	const [shareableLink, setShareableLink] = useState<Link | null>(null);
	const [generatedLink, setGeneratedLink] = useState<Link | null>(null);
	const [defaultLink, setDefaultLink] = useState<Link | null>(null);
	const [shareableMessage, setShareableMessage] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [generatedLinkAlreadyExists, setGeneratedLinkAlreadyExists] =
		useState<boolean>(false);

	const getLinkMutation = api.links.getLinkMutation.useMutation();
	const generateLinkMutation = api.links.createLink.useMutation();
	const updateLink = api.links.updateLink.useMutation();

	useEffect(() => {
		const initialFetchLink = async () => {
			if (!shareableLink) {
				const storedLinkId = localStorage.getItem(
					referralRequest?.id as string
				);
				const linkId = storedLinkId ? storedLinkId : undefined;

				try {
					const linkData = await getLinkMutation.mutateAsync({
						referralRequestId: referralRequest?.id as string,
						linkId: linkId,
					});

					setShareableLink(linkData);
					setDefaultLink(linkData);
					setShareableMessage(linkData?.blurb as string);
					setName(linkData?.blurbAuthorName as string);

					if (linkId !== undefined) {
						setGeneratedLink(linkData);
					}
				} catch (e) {}
			}
		};

		if (isOpen) {
			initialFetchLink();
		}
	}, [isOpen]);

	useEffect(() => {
		const handleMessageChange = async () => {
			if (shareableMessage === '' || !shareableMessage) {
				setShareableLink(defaultLink);
			} else {
				if (!generatedLink) {
					// Generate a new link with the message
					const newGeneratedLink =
						await generateLinkMutation.mutateAsync({
							userId: userProfile.user.id,
							createdByLoggedInUser: false,
							referralRequestId: referralRequest?.id as string,
						});

					setGeneratedLink(newGeneratedLink);
					setShareableLink(newGeneratedLink);

					// Add link to localstorage as above
					localStorage.setItem(
						referralRequest?.id as string,
						newGeneratedLink.id
					);
				} else {
					setShareableLink(generatedLink);
				}
			}
		};
		handleMessageChange();
	}, [shareableMessage, defaultLink]);

	useEffect(() => {
		const updateLinkAsync = async () => {
			try {
				await updateLink.mutateAsync({
					id: generatedLink?.id as string,
					blurb: shareableMessage ? shareableMessage : undefined,
					blurbAuthorName: name ? (name as string) : undefined,
				});
			} catch (e) {
				console.log(e);
			}
		};

		// Call the function after a delay to simulate debounce
		const timeoutId = setTimeout(updateLinkAsync, 500);

		// Cleanup function to clear the timeout if the component unmounts
		return () => clearTimeout(timeoutId);
	}, [shareableMessage, generatedLink, name]);

	const sections: {
		type: 'single-column' | 'two-column';
		content: JSX.Element[] | null;
	}[] = [
		{
			type: 'single-column',
			content: [
				<RLabeledSection
					key="message"
					label="Custom Message"
					subtitle={`Include a message to give some context about ${userProfile.firstName}`}
					body={
						<RTextarea
							placeholder="enter optional message"
							value={shareableMessage}
							onChange={(e) =>
								setShareableMessage(e.target.value)
							}
						/>
					}
				/>,
			],
		},
		{
			type: 'single-column',
			content: [
				<RLabeledSection
					key="name"
					label="Your name"
					body={
						<RInput
							placeholder="enter your name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					}
				/>,
			],
		},

		{
			type: 'single-column',
			content: [<Separator key="searator" />],
		},

		{
			type: 'single-column',
			content: [
				<RLabeledSection
					key="sharing"
					label="Sharing options"
					subtitle="Pass on the request without any extra typing 🙏"
					body={
						<RTabsSection
							tabs={[
								{ label: 'Link' },
								{ label: 'Email' },
								{ label: 'DM/Text' },
							]}
							tabContents={[
								<div key="link">
									{shareableLink ? (
										<RInput
											readOnly
											className="cursor-pointer underline"
											value={`https://${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${shareableLink?.id}`}
											copyEnabled
											highlighted
										/>
									) : (
										<Spinner size="small" />
									)}
								</div>,
							]}
						/>
					}
				/>,
			],
		},
	];

	return (
		<ActivityModal
			open={isOpen}
			onOpenChange={(open) => {
				onOpenChange(open);
				if (!open) {
					setShareableMessage('');
					setGeneratedLink(null);
					setShareableLink(null);
					setDefaultLink(null);
				}
			}}
			headerText="Share referral request"
			subtitleText={`Pass along ${userProfile.firstName}'s request to someone in your network with a special link.`}
			sections={sections}
			headerRightContent={
				<RTag
					label={
						referralRequest?.isAnyOpenRole
							? 'any open role'
							: (referralRequest?.jobTitle as string)
					}
					rightContent={
						<Image
							src={referralRequest?.company?.logoUrl as string}
							alt="Logo"
							height={14}
							width={14}
						/>
					}
				/>
			}
		/>
	);
}
