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
	const { data: requestsData, refetch } =
		api.referralRequest.getRequests.useQuery({});
	const updateLink = api.links.updateLink.useMutation();
	const [searchString, setSearchString] = useState('');
	const [includeCompleted, setIncludeCompleted] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [requestToShare, setRequestToShare] = useState<null | {
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
		jobTitle: string | null;
	}>(null);
	const [showShareBlurbInModal, setShowShareBlurbInModal] = useState(false);
	const [shareableBlurb, setShareableBlurb] = useState('');

	const shareableLink = `${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${
		requestToShare?.Link?.find(
			(link) => link.isDefaultLinkForRequest === true
		)?.id
	}`;

	useEffect(() => {
		if (profileData?.defaultBlurb) {
			setShareableBlurb(profileData.defaultBlurb);
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
			case 'COMMITED':
				return <RTag label="Committed" color="purple" />;
			case 'OPEN':
				return <RTag label="Open" color="blue" />;
			default:
				return <RTag label="Unknown" color="default" />;
		}
	};

	useEffect(() => {
		const updateLinkAsync = async () => {
			console.log({ shareableBlurb });
			if (shareModalOpen) {
				await updateLink.mutateAsync({
					id: requestToShare?.Link?.find(
						(link) => link.isDefaultLinkForRequest === true
					)?.id as string,
					blurb: shareableBlurb,
				});
				refetch();
			}
		};

		// Call the function after a delay to simulate debounce
		const timeoutId = setTimeout(updateLinkAsync, 500);

		// Cleanup function to clear the timeout if the component unmounts
		return () => clearTimeout(timeoutId);
	}, [shareableBlurb]); // Depend on shareableBlurb state

	return (
		<div className="mb-[36px] flex flex-col justify-between gap-[32px]">
			<ActivityModal
				open={shareModalOpen}
				onOpenChange={(open) => {
					setShareModalOpen(open);
					setShareableBlurb(profileData?.defaultBlurb ?? '');
				}}
				headerText="Share referral request"
				subtitleText={`Copy a shareable link to your referral request at ${requestToShare?.company?.name}.`}
				headerRightContent={
					<div className="flex items-center justify-center gap-2">
						<Image
							src={requestToShare?.company.logoUrl as string}
							alt="Logo"
							height={18}
							width={18}
						/>
						<RText fontSize="b2" fontWeight="medium">
							{requestToShare?.company.name}
						</RText>
					</div>
				}
				bottomRowContent={
					<div className="flex gap-4">
						<RButton
							iconName="check"
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
								console.log(shareableLink);
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
									label="Include blurb"
									subtitle="Include a message that will appear on your referral page."
									body={
										showShareBlurbInModal ? (
											<div>
												<RTextarea
													placeholder="type your message here"
													value={shareableBlurb}
													onInput={(e) => {
														setShareableBlurb(
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
													*Your default blurb can be
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
													requestToShare?.Link?.find(
														(link) =>
															link.isDefaultLinkForRequest ===
															true
													);
												await updateLink.mutateAsync({
													id: correctLink?.id as string,
													blurb: checked
														? shareableBlurb
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
															requestToShare?.Link?.find(
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
														requestToShare?.jobTitle
															? requestToShare?.jobTitle
															: 'any open role',
														requestToShare?.company
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
														requestToShare?.jobTitle
															? requestToShare?.jobTitle
															: 'any open role',
														requestToShare?.company
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
				subtitle="Click on a request to see or edit details."
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
							Include completed referrals
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
							label: 'Status',
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
												You can share referral requests
												individually. Click on the share
												button to get a link to share
												with your network.
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
																	.length > 20
																	? `${request.jobTitle.slice(
																			0,
																			20
																	  )}...`
																	: request.jobTitle)}
															{!request.jobTitle &&
																request.jobPostingLink &&
																(request
																	.jobPostingLink
																	.length > 15
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
													<RText>
														{request.referrer.name}
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
											<div className="flex items-center gap-4">
												<RButton
													iconName="share"
													onClick={() => {
														setRequestToShare(
															request
														);
														setShareModalOpen(true);
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
															setShareableBlurb(
																correctLink.blurb
															);
														}

														setShowShareBlurbInModal(
															correctLink?.blurb &&
																correctLink
																	.blurb
																	.length > 0
																? true
																: false
														);
													}}
												>
													Share request
												</RButton>
												<Icon name="pencil" />
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
			</div>
		</div>
	);
}
