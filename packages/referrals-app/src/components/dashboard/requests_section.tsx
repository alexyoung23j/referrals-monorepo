/* eslint-disable indent */
import { api } from '~/utils/api';
import { RLabeledSection } from '../ui/labeled_section';
import { Checkbox } from '../ui/checkbox';
import { RText } from '../ui/text';
import { RInput } from '../ui/input';
import { RButton } from '../ui/button';
import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';
import { RowTable } from '../ui/card';
import Icon from '../ui/icons';
import Image from 'next/image';
import { RTag } from '../ui/tag';
import { useMediaQuery } from 'react-responsive';
import { RPopover } from '../ui/popover';
import ActivityModal from '../modals/activity_modal';
import { RTextarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { RTabsSection } from '../ui/tabs';
import { useToast } from '../ui/use-toast';
import { RSelector } from '../ui/select';
import { Separator } from '../ui/separator';
import { type ReferralRequestStatus } from '@prisma/client';
import { ConfirmationModal } from '../modals/confirmation_modal';
import RSpinner from '../ui/spinner';

const defaultDMText = (link: string, jobTitle: string, companyName: string) => {
	return `Hey! I was wondering if you'd be able to refer me to ${jobTitle} at ${companyName}. Here's a link to make it easier for you if you can: https://${link}. Thanks!`;
};

export default function RequestsSection({
	shouldUpdate,
	setNewRequestModalOpen,
}: {
	shouldUpdate: boolean;
	setNewRequestModalOpen: (open: boolean) => void;
}) {
	const { toast } = useToast();

	const { data: profileData, status } = api.profiles.getProfile.useQuery(
		undefined,
		{
			refetchOnWindowFocus: false,
		}
	);
	const {
		data: requestsData,
		refetch,
		status: requestsStatus,
	} = api.referralRequest.getRequests.useQuery({});
	const updateLink = api.links.updateLink.useMutation();
	const updateRequest = api.referralRequest.updateRequest.useMutation();
	const deleteRequestMutation =
		api.referralRequest.deleteRequest.useMutation();
	const [searchString, setSearchString] = useState('');
	const [includeCompleted, setIncludeCompleted] = useState(true);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState<null | {
		id: string;
		company: {
			id: string;
			name: string;
			logoUrl: string | null;
			isCreatedByUser: boolean;
			createdAt: Date;
			updatedAt: Date;
		};
		Link: Array<{
			id: string;
			isDefaultLinkForRequest: boolean;
		}>;
		referrer: {
			name: string | null;
			email: string | null;
		} | null;
		jobTitle: string | null;
		status: string | null;
		notLoggedInReferrerId: string | null;
		jobPostingLink: string | null;
		isAnyOpenRole: boolean;
	}>(null);
	const [showShareBlurbInModal, setShowShareBlurbInModal] = useState(false);
	const [shareableMessage, setShareableMessage] = useState('');
	const [selectedRequestReferrerName, setSelectedRequestReferrerName] =
		useState('');
	const [selectedRequestReferrerEmail, setSelectedRequestReferrerEmail] =
		useState('');
	const [selectedRequestStatus, setSelectedRequestStatus] = useState('');
	const [selectedRequestJobLink, setSelectedRequestJobLink] = useState('');
	const [selectedRequestJobTitle, setSelectedRequestJobTitle] = useState('');
	const [selectedRequestAnyOpenRole, setSelectedRequestAnyOpenRole] =
		useState(false);
	const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

	useEffect(() => {
		setSelectedRequestReferrerName(
			selectedRequest?.referrer?.name as string
		);
		setSelectedRequestReferrerEmail(
			selectedRequest?.referrer?.email as string
		);
		setSelectedRequestStatus(selectedRequest?.status as string);
		setSelectedRequestJobLink(
			selectedRequest?.jobPostingLink as string | ''
		);
		setSelectedRequestJobTitle(selectedRequest?.jobTitle as string);
		setSelectedRequestAnyOpenRole(
			selectedRequest?.isAnyOpenRole ??
				(selectedRequest?.jobPostingLink ? false : true)
		);
	}, [selectedRequest]);

	const shareableLink = `${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${
		selectedRequest?.Link?.find(
			(link) => link.isDefaultLinkForRequest === true
		)?.id
	}`;

	useEffect(() => {
		if (profileData?.defaultMessage) {
			setShareableMessage(profileData.defaultMessage);
		}
	}, [profileData]);

	useEffect(() => {
		refetch();
	}, [shouldUpdate, refetch]);

	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const options = {
		keys: ['company.name'], // Define the keys to search
		threshold: 0.2, // Adjust the threshold for fuzzy matching, lower values mean stricter matching
		ignoreLocation: true,
		shouldSort: false,
	};

	const fuse = new Fuse(requestsData ?? [], options);

	const filteredRequests = useMemo(() => {
		if (searchString === '') {
			// Filter out completed requests if includeCompleted is false
			return includeCompleted
				? requestsData
				: requestsData?.filter(
						(request) => request.status !== 'COMPLETED'
				  );
		} else {
			const results = fuse.search(searchString);
			// Map to get the items and filter out completed requests if includeCompleted is false
			const items = results.map((result) => result.item);
			return includeCompleted
				? items
				: items.filter((item) => item.status !== 'COMPLETED');
		}
	}, [searchString, requestsData, includeCompleted]);

	const getStatusTag = (status: string) => {
		switch (status) {
			case 'COMPLETED':
				return <RTag label="Completed" color="green" />;
			case 'COMMITTED':
				return <RTag label="Committed" color="purple" />;
			case 'OPEN':
				return <RTag label="Open" color="blue" />;
			default:
				return <RTag label="Unknown" color="default" />;
		}
	};

	// Save the shareable blurb to the database
	useEffect(() => {
		const updateLinkAsync = async () => {
			if (shareModalOpen) {
				await updateLink.mutateAsync({
					id: selectedRequest?.Link?.find(
						(link) => link.isDefaultLinkForRequest === true
					)?.id as string,
					blurb: shareableMessage,
				});
				refetch();
			}
		};

		// Call the function after a delay to simulate debounce
		const timeoutId = setTimeout(updateLinkAsync, 500);

		// Cleanup function to clear the timeout if the component unmounts
		return () => clearTimeout(timeoutId);
	}, [shareableMessage]); // Depend on shareableBlurb state

	const saveEdits = async () => {
		try {
			await updateRequest.mutateAsync({
				id: selectedRequest?.id as string,
				referrerName:
					(selectedRequestReferrerName as string) ?? undefined,
				referrerEmail:
					(selectedRequestReferrerEmail as string) ?? undefined,
				status: selectedRequestStatus as ReferralRequestStatus,
				jobPostingLink: selectedRequestJobLink,
				jobTitle: selectedRequestJobTitle,
				isAnyOpenRole: selectedRequestAnyOpenRole,
			});
			toast({
				title: 'Saved edits.',
				duration: 2000,
			});
			setEditModalOpen(false);
			await refetch();
		} catch (e) {
			toast({
				title: 'Failed to save edits. Try again.',
				duration: 2000,
			});
		}
	};

	const deleteRequest = async () => {
		try {
			await deleteRequestMutation.mutateAsync({
				id: selectedRequest?.id as string,
			});
			toast({
				title: 'Deleted request.',
				duration: 2000,
			});
			setEditModalOpen(false);
			setConfirmationModalOpen(false);
			await refetch();
		} catch (e) {
			toast({
				title: 'Failed to delete request. Try again.',
				duration: 2000,
			});
		}
	};

	return (
		<div className="mb-[36px] flex flex-col justify-between gap-[32px]">
			<ConfirmationModal
				headerText="Delete request?"
				content={
					<div>
						<RText>{`Are you sure you want to delete your request for ${selectedRequest?.company.name}? All links that include this post will be invalid.	`}</RText>
					</div>
				}
				onCancel={() => {
					setConfirmationModalOpen(false);
				}}
				onOpenChange={(open) => {
					setConfirmationModalOpen(open);
				}}
				onConfirm={deleteRequest}
				open={confirmationModalOpen}
			/>
			<ActivityModal
				open={editModalOpen}
				onOpenChange={(open) => {
					setEditModalOpen(open);
				}}
				headerText="Edit request"
				subtitleText="View request progress and edit details"
				headerRightContent={
					<div className="flex items-center justify-center gap-2">
						<Image
							src={selectedRequest?.company.logoUrl as string}
							alt="Logo"
							height={18}
							width={18}
						/>
						<RText fontSize="b2" fontWeight="medium">
							{selectedRequest?.company.name}
						</RText>
					</div>
				}
				sections={[
					{
						type: 'two-column',
						content: [
							<RLabeledSection
								label="Company"
								key="company"
								body={
									<div
										key="company"
										className="border-input bg-background flex items-center gap-3 rounded-md border px-3 py-2 text-sm "
									>
										<Image
											src={
												selectedRequest?.company
													.logoUrl as string
											}
											alt="Logo"
											height={20}
											width={20}
										/>
										<RText fontWeight="medium">
											{selectedRequest?.company.name}
										</RText>
									</div>
								}
							/>,
							<RLabeledSection
								label="Shareable link"
								key="link"
								body={
									<RInput
										readOnly
										className="cursor-pointer underline"
										value={`https://${
											process.env
												.NEXT_PUBLIC_SERVER_URL_SHORT
										}/${
											selectedRequest?.Link?.find(
												(link) =>
													link.isDefaultLinkForRequest ===
													true
											)?.id
										}`}
										copyEnabled
										highlighted
									/>
								}
							/>,
						],
					},
					{
						type: 'single-column',
						content: [
							<div
								key={status}
								className="flex items-center gap-6"
							>
								<RText fontWeight="medium">Status</RText>
								<RSelector
									onSelect={(value) => {
										setSelectedRequestStatus(
											value as string
										);
									}}
									defaultValue={{
										value: '',
										content: (
											<div className="w-[146px]">
												{getStatusTag(
													selectedRequestStatus
												)}
											</div>
										),
									}}
									items={[
										{
											value: 'COMPLETED',
											content: (
												<div className="w-[146px]">
													{getStatusTag('COMPLETED')}
												</div>
											),
										},
										{
											value: 'COMMITTED',
											content: (
												<div className="w-[146px]">
													{getStatusTag('COMMITTED')}
												</div>
											),
										},
										{
											value: 'OPEN',
											content: (
												<div className="w-[146px]">
													{getStatusTag('OPEN')}
												</div>
											),
										},
									]}
								/>
							</div>,
						],
					},
					{
						type: 'single-column',
						content: [<Separator key="searator" />],
					},
					{
						type: 'two-column',
						content: [
							<RLabeledSection
								key="referrerName"
								label="Referred by"
								body={
									<RInput
										value={selectedRequestReferrerName}
										placeholder="enter manually"
										onInput={(e) => {
											setSelectedRequestReferrerName(
												(e.target as HTMLInputElement)
													?.value
											);
										}}
									/>
								}
							/>,
							<RLabeledSection
								key="referrerEmail"
								label="Referrer email"
								body={
									<RInput
										value={selectedRequestReferrerEmail}
										onInput={(e) => {
											setSelectedRequestReferrerEmail(
												(e.target as HTMLInputElement)
													?.value
											);
										}}
										copyEnabled
										placeholder="enter manually"
									/>
								}
							/>,
						],
					},

					{
						type: 'single-column',
						content: [
							<div
								key="1"
								className="flex w-full items-center gap-3"
							>
								<Switch
									checked={selectedRequestAnyOpenRole}
									onCheckedChange={(checked) => {
										setSelectedRequestAnyOpenRole(checked);
									}}
								/>
								<RText fontWeight="medium">Any open role</RText>
							</div>,
						],
					},
					{
						type: 'single-column',
						content: [
							<RLabeledSection
								label={
									selectedRequestAnyOpenRole
										? 'Job posting link'
										: 'Job posting link*'
								}
								body={
									<RInput
										placeholder="enter job posting link"
										value={selectedRequestJobLink}
										onChange={(e) => {
											setSelectedRequestJobLink(
												e.target.value
											);
										}}
									/>
								}
								key="3"
							/>,
						],
					},
					{
						type: 'single-column',
						content: [
							<RLabeledSection
								label="Job title"
								body={
									<RInput
										placeholder="enter title"
										value={selectedRequestJobTitle}
										onChange={(e) => {
											setSelectedRequestJobTitle(
												e.target.value
											);
										}}
									/>
								}
								key="3"
							/>,
						],
					},
				]}
				bottomRowContent={
					<div className="flex gap-4">
						<RButton iconName="check" onClick={saveEdits}>
							Save changes
						</RButton>
						<RButton
							variant="secondary"
							iconName="trash"
							onClick={() => {
								setConfirmationModalOpen(true);
							}}
						>
							Delete
						</RButton>
					</div>
				}
			/>
			<ActivityModal
				open={shareModalOpen}
				onOpenChange={(open) => {
					setShareModalOpen(open);
					setShareableMessage(profileData?.defaultMessage ?? '');
				}}
				headerText="Share referral request"
				subtitleText={`Copy a shareable link to your referral request at ${selectedRequest?.company?.name}.`}
				headerRightContent={
					<div className="flex items-center justify-center gap-2">
						<Image
							src={selectedRequest?.company.logoUrl as string}
							alt="Logo"
							height={18}
							width={18}
						/>
						<RText fontSize="b2" fontWeight="medium">
							{selectedRequest?.company.name}
						</RText>
					</div>
				}
				bottomRowContent={
					<div className="flex gap-4">
						<RButton
							iconName="copy"
							onClick={() => {
								navigator.clipboard.writeText(shareableLink);
								toast({
									title: 'Copied link to clipboard.',
									duration: 1500,
								});
							}}
						>
							Copy link
						</RButton>
						<RButton
							variant="secondary"
							iconName="eye"
							onClick={() => {
								window.open(
									`http://${shareableLink}`,
									'_blank'
								);
							}}
						>
							Preview page
						</RButton>
					</div>
				}
				sections={[
					{
						type: 'single-column',
						content: [
							<div key="blurb">
								<RLabeledSection
									label="Include message"
									subtitle="Include a message that will appear on your referral page."
									body={
										showShareBlurbInModal ? (
											<div>
												<RTextarea
													placeholder="type your message here"
													value={shareableMessage}
													onInput={(e) => {
														setShareableMessage(
															(
																e.target as HTMLInputElement
															)?.value
														);
													}}
												/>
												<RText
													fontSize="b2"
													color="tertiary"
												>
													*Your default message can be
													edited in the profile page.
												</RText>
											</div>
										) : undefined
									}
									rightContent={
										<Switch
											checked={showShareBlurbInModal}
											onCheckedChange={async (
												checked
											) => {
												setShowShareBlurbInModal(
													checked
												);
												const correctLink =
													selectedRequest?.Link?.find(
														(link) =>
															link.isDefaultLinkForRequest ===
															true
													);
												await updateLink.mutateAsync({
													id: correctLink?.id as string,
													blurb: checked
														? shareableMessage
														: '',
												});
												refetch();
											}}
										/>
									}
									key="blurb"
								/>
							</div>,
						],
					},
					{
						type: 'single-column',
						content: [
							<RLabeledSection
								label="Sharing options"
								key="sharing-options"
								body={
									<div className="mt-[16px]">
										<RTabsSection
											tabs={[
												{ label: 'Link' },
												{ label: 'DM/Text' },
												{ label: 'Email' },
											]}
											tabContents={[
												<div key="link">
													<RInput
														readOnly
														className="cursor-pointer underline"
														value={`https://${
															process.env
																.NEXT_PUBLIC_SERVER_URL_SHORT
														}/${
															selectedRequest?.Link?.find(
																(link) =>
																	link.isDefaultLinkForRequest ===
																	true
															)?.id
														}`}
														copyEnabled
														highlighted
													/>
												</div>,
												<RTextarea
													key="DM"
													readOnly
													value={defaultDMText(
														shareableLink,
														selectedRequest?.jobTitle
															? selectedRequest?.jobTitle
															: 'any open role',
														selectedRequest?.company
															.name as string
													)}
													copyEnabled
													highlighted
												/>,
												<RTextarea
													key="Email"
													readOnly
													value={defaultDMText(
														// TODO: change to email
														shareableLink,
														selectedRequest?.jobTitle
															? selectedRequest?.jobTitle
															: 'any open role',
														selectedRequest?.company
															.name as string
													)}
													copyEnabled
													highlighted
												/>,
											]}
										/>
									</div>
								}
							/>,
						],
					},
				]}
			/>
			<RLabeledSection
				label="Requests"
				subtitle="You can edit request details after they are created."
				body={<></>}
				labelSize="h3"
				rightContent={
					<div className="flex items-center gap-2">
						<Checkbox
							checked={includeCompleted}
							onCheckedChange={(checked) => {
								if (typeof checked === 'boolean') {
									setIncludeCompleted(checked);
								}
							}}
						/>
						<RText color="tertiary">
							Include completed requests
						</RText>
					</div>
				}
			/>
			<div className="flex w-full items-center justify-between gap-4">
				<div className="w-full">
					<RInput
						placeholder="type to search requests.."
						value={searchString}
						onChange={(e) => {
							setSearchString(e.target.value);
						}}
					/>
				</div>
				<RButton
					variant="secondary"
					iconName="plus"
					onClick={() => {
						setNewRequestModalOpen(true);
					}}
				>
					New referral request
				</RButton>
			</div>
			<div className="flex">
				{requestsStatus === 'success' ? (
					<RowTable
						mobileWidth={840}
						columns={[
							{
								label: 'Company',
								hideOnMobile: false,
								minWidth: 200,
							},
							{
								label: 'Job Listing',
								hideOnMobile: true,
								minWidth: isMobile ? 100 : 200,
							},
							{
								label: 'Referrer',
								hideOnMobile: true,
								minWidth: isMobile ? 100 : 200,
							},
							{
								label: (
									<RPopover
										align="end"
										trigger={
											<div className="flex gap-2">
												<RText
													fontSize="b2"
													color="tertiary"
												>
													Status
												</RText>
												<Icon
													name="info"
													size="12"
													color="#94a3b8"
												/>
											</div>
										}
										content={
											<div>
												<RText
													fontSize="b2"
													color="secondary"
												>
													{`A "committed" status means a
												referrer has set a reminder to
												refer you. "Completed" requests will not appear in your links.`}
												</RText>
											</div>
										}
									/>
								),
								hideOnMobile: false,
								minWidth: isMobile ? 50 : 150,
							},
							{
								label: (
									<RPopover
										align="end"
										trigger={
											<div className="flex gap-2">
												<RText
													fontSize="b2"
													color="tertiary"
												>
													Action
												</RText>
												<Icon
													name="info"
													size="12"
													color="#94a3b8"
												/>
											</div>
										}
										content={
											<div>
												<RText
													fontSize="b2"
													color="secondary"
												>
													You can share referral
													requests individually. Click
													on the share button to get a
													link to share with your
													network.
												</RText>
											</div>
										}
									/>
								),
								hideOnMobile: true,
							},
						]}
						rows={
							filteredRequests?.map((request) => {
								const row = {
									label: request.id,
									cells: [
										{
											content: (
												<div className="flex items-center gap-3">
													<Image
														src={
															request.company
																.logoUrl as string
														}
														alt="Logo"
														height={24}
														width={24}
													/>
													<RText fontWeight="medium">
														{request.company.name}
													</RText>
												</div>
											),
											label: 'company',
										},
										{
											content: (
												<div>
													{request.jobPostingLink ? (
														<div
															className="flex cursor-pointer items-center gap-3"
															onClick={() => {
																if (
																	request.jobPostingLink
																) {
																	window.open(
																		request.jobPostingLink as string,
																		'_blank'
																	);
																}
															}}
														>
															<RText color="secondary">
																{request.jobTitle &&
																	(request
																		.jobTitle
																		.length >
																	20
																		? `${request.jobTitle.slice(
																				0,
																				20
																		  )}...`
																		: request.jobTitle)}
																{!request.jobTitle &&
																	request.jobPostingLink &&
																	(request
																		.jobPostingLink
																		.length >
																	15
																		? `${request.jobPostingLink.slice(
																				0,
																				15
																		  )}...`
																		: request.jobPostingLink)}
															</RText>
															<Icon
																name="link"
																size="14"
																color="#64748b"
															/>
														</div>
													) : (
														<RTag
															label="Any open role"
															color="default"
														/>
													)}
												</div>
											),
											label: 'jobTitle',
										},
										{
											content: (
												<div>
													{request.referrer ? (
														<RText color="secondary">
															{
																request.referrer
																	.name
															}
														</RText>
													) : (
														<RText color="tertiary">
															None yet
														</RText>
													)}
												</div>
											),
											label: 'referrer',
										},
										{
											content: (
												<div>
													{getStatusTag(
														request.status as string
													)}
												</div>
											),
											label: 'status',
										},
										{
											content: (
												<div className="flex items-center gap-6">
													<RButton
														iconName="share"
														onClick={() => {
															setSelectedRequest(
																request
															);
															setShareModalOpen(
																true
															);
															const correctLink =
																request.Link.find(
																	(link) =>
																		link.isDefaultLinkForRequest ===
																		true
																);

															if (
																correctLink &&
																correctLink.blurb
															) {
																setShareableMessage(
																	correctLink.blurb
																);
															}

															setShowShareBlurbInModal(
																correctLink?.blurb &&
																	correctLink
																		.blurb
																		.length >
																		0
																	? true
																	: false
															);
														}}
													>
														Share request
													</RButton>
													<Icon
														name="pencil"
														size="22"
														className="cursor-pointer"
														onClick={() => {
															setSelectedRequest(
																request
															);
															setEditModalOpen(
																true
															);
														}}
													/>
												</div>
											),
											label: 'action',
										},
									],
								};
								return row;
							}) || []
						}
					/>
				) : (
					<div className="flex h-[200px] w-full items-center justify-center">
						<RSpinner size="large" />
					</div>
				)}
			</div>
		</div>
	);
}
