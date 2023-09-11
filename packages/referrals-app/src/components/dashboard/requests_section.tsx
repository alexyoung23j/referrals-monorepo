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

export default function RequestsSection({
	shouldUpdate,
	setNewRequestModalOpen,
}: {
	shouldUpdate: boolean;
	setNewRequestModalOpen: (open: boolean) => void;
}) {
	const { data: requestsData, refetch } =
		api.referralRequest.getRequests.useQuery({});
	const [searchString, setSearchString] = useState('');
	const [includeCompleted, setIncludeCompleted] = useState(false);

	useEffect(() => {
		console.log('useEffect');
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
				return <RTag label="Committed" color="blue" />;
			case 'OPEN':
				return <RTag label="Open" color="default" />;
			default:
				return <RTag label="Unknown" color="default" />;
		}
	};

	return (
		<div className="mb-[36px] flex flex-col justify-between gap-[32px]">
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
						placeholder="search requests"
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
							minWidth: isMobile ? 50 : 150,
						},
						{
							label: (
								<div className="flex gap-2">
									<RText fontSize="b2" color="tertiary">
										Status
									</RText>
									<Icon
										name="info"
										size="12"
										color="#94a3b8"
									/>
								</div>
							),
							hideOnMobile: false,
							minWidth: isMobile ? 50 : 150,
						},
						{
							label: (
								<div className="flex gap-2">
									<RText fontSize="b2" color="tertiary">
										Action
									</RText>
									<Icon
										name="info"
										size="12"
										color="#94a3b8"
									/>
								</div>
							),
							hideOnMobile: true,
						},
					]}
					rows={
						filteredRequests?.map((request) => {
							const row = {
								label: 'row1',
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
														color="blue"
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
												<RButton iconName="share">
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
