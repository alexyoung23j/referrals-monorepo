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

const defaultEmailText = (
	link: string,
	name: string,
	requesterName: string,
	isAllRequests: boolean
) => {
	return `Hey [[Contact name]],\n\nI was wondering if you'd be able to help ${requesterName} get a referral to the job${
		isAllRequests ? 's' : ''
	} listed here: https://${link}. I would really appreciate it! \n\nThanks,\n${name}`;
};

const defaultDMText = (link: string, name: string) => {
	return `Hey [[Contact name]], I'm currently on a job search and I was wondering if you or someone in your network would be able to refer me to any of the jobs listed here: https://${link}. I would really appreciate it, thanks!`;
};

export default function ShareModal({
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
	const [shareableLink, setShareableLink] = useState<Link | null>(null);
	const [generatedLink, setGeneratedLink] = useState<Link | null>(null);
	const [defaultLink, setDefaultLink] = useState<Link | null>(null);
	const [shareableMessage, setShareableMessage] = useState<string>('');
	const [name, setName] = useState<string>('');

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

				if (isAllRequests) {
					setShareableLink(existingPageLink);
					setDefaultLink(existingPageLink);
				} else {
					try {
						const linkData = await getLinkMutation.mutateAsync({
							referralRequestId: referralRequest?.id as string,
							linkId: linkId,
						});

						setShareableLink(linkData);
						setDefaultLink(linkData);
						setShareableMessage(linkData?.blurb as string);
						setName(
							linkData.isDefaultLinkForRequest
								? pageViewerName ?? ''
								: linkData?.blurbAuthorName ??
										pageViewerName ??
										''
						);

						if (linkId !== undefined) {
							setGeneratedLink(linkData);
						}
					} catch (e) {}
				}
			}
		};

		if (isOpen) {
			initialFetchLink();
		}
	}, [isOpen, isAllRequests]);

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
							referralRequestId: referralRequest
								? (referralRequest?.id as string)
								: undefined,
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
			if (generatedLink) {
				try {
					await updateLink.mutateAsync({
						id: generatedLink?.id as string,
						blurb: shareableMessage ? shareableMessage : undefined,
						blurbAuthorName: name ? (name as string) : undefined,
					});
				} catch (e) {
					console.log(e);
				}
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
					subtitle={`Include a message to provide some context about ${userProfile.firstName}. This will appear in the link you share.`}
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
							onChange={(e) => {
								setName(e.target.value);
								setPageViewerName(e.target.value);
							}}
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
					subtitle="Pass on the request without any extra typing 🙏."
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
										<div className="flex w-full items-center justify-center">
											<Spinner size="small" />
										</div>
									)}
								</div>,
								<div key="email">
									{shareableLink ? (
										<RTextarea
											readOnly
											value={defaultEmailText(
												`${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${shareableLink?.id}`,
												name,
												userProfile.firstName as string,
												false
											)}
											className="h-[180px] text-[#334155]"
											copyEnabled
											highlighted
										/>
									) : (
										<div className="flex w-full items-center justify-center">
											<Spinner size="small" />
										</div>
									)}
								</div>,
								<div key="dm">
									{shareableLink ? (
										<RTextarea
											readOnly
											value={defaultEmailText(
												`${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${shareableLink?.id}`,
												name,
												userProfile.firstName as string,
												false
											)}
											className="h-[180px] text-[#334155]"
											copyEnabled
											highlighted
										/>
									) : (
										<div className="flex w-full items-center justify-center">
											<Spinner size="small" />
										</div>
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
			headerText={`Share referral request${isAllRequests ? 's' : ''}`}
			subtitleText={`Pass along ${userProfile.firstName}'s request${
				isAllRequests ? 's' : ''
			} to someone in your network with a special link.`}
			sections={sections}
			headerRightContent={
				isAllRequests ? (
					<RTag label="All referral requests" />
				) : (
					<RTag
						label={
							referralRequest?.isAnyOpenRole
								? 'any open role'
								: (referralRequest?.jobTitle as string)
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
					/>
				)
			}
			bottomRowContent={
				<RButton
					iconName="copy"
					onClick={() => {
						navigator.clipboard.writeText(
							`https://${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${shareableLink?.id}`
						);
						toast({
							title: 'Copied link to request!',
							duration: 2000,
						});
					}}
				>
					Copy link
				</RButton>
			}
		/>
	);
}
