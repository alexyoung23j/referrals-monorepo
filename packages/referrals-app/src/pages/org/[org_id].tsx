/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable indent */
import dynamic from 'next/dynamic';

import { RButton } from '~/components/ui/button';
import { RCard, RowTable } from '~/components/ui/card';
import Icon from '~/components/ui/icons';
import { RPopover } from '~/components/ui/popover';
import { RTag } from '~/components/ui/tag';
import { RText } from '~/components/ui/text';
import { prisma } from '~/server/db';
import Image from 'next/image';

import { type GetServerSidePropsContext } from 'next';
import OrgPageLayout from '~/components/layouts/org_links';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import { RInput } from '~/components/ui/input';
import { useMediaQuery } from 'react-responsive';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

export default function OrgPage({ org }: { org: any }) {
	const [searchString, setSearchString] = useState('');

	const unfilteredUsers = org?.users?.map((user: any) => {
		return user.user;
	});
	const options = {
		keys: [
			'ReferralRequest.company.name',
			'UserProfile.firstName',
			'UserProfile.lastName',
		], // Define the keys to search
		threshold: 0.2, // Adjust the threshold for fuzzy matching, lower values mean stricter matching
		ignoreLocation: true,
		shouldSort: false,
	};

	const fuse = new Fuse(unfilteredUsers ?? [], options);

	const filteredUsers = useMemo(() => {
		if (!searchString) {
			return unfilteredUsers;
		}
		const results = fuse.search(searchString);
		// Map to get the items and filter out completed requests if includeCompleted is false
		return results.map((result) => result.item);
	}, [searchString]);

	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const isMedium = useMediaQuery({
		query: '(max-width: 1280px)',
	});

	return (
		<OrgPageLayout
			orgName={org.name}
			orgDescription={org.description}
			websiteUrl={org.websiteUrl}
			linkedInUrl={org.linkedInUrl}
			showInfoModal={false}
			avatarUrl={org.avatarUrl}
			setShowInfoModal={() => {
				//
			}}
		>
			<div
				className={`${
					isMobile ? 'mt-[3vh]' : 'mt-[5vh]'
				} flex h-full w-full flex-col gap-[28px] ${
					isMobile ? 'px-[24px]' : 'px-[104px]'
				} relative flex-col pb-[35vh]`}
			>
				<RText
					fontSize={isMobile ? 'h3' : 'h1point5'}
					fontWeight="medium"
				>
					{`${org.name} Referral Requests`}
				</RText>
				{org.instructionText && (
					<RText fontSize={isMobile ? 'b2' : 'b1'} color="secondary">
						{org.instructionText}
					</RText>
				)}
				<RInput
					value={searchString}
					onChange={(e) => {
						setSearchString(e.target.value);
					}}
					placeholder="search requests by member or company"
				/>
				{filteredUsers && filteredUsers.length > 0 ? (
					<RowTable
						cardElevation={filteredUsers.length > 1 ? 'none' : 'md'}
						mobileWidth={1024}
						columns={[
							{
								label: 'Member',
								minWidth: isMobile ? 75 : isMedium ? 175 : 240,
								hideOnMobile: false,
							},
							{
								label: 'Companies',
								minWidth: isMedium ? 75 : 200,
								hideOnMobile: true,
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
													{`Visit the member's profile link to refer them, or quickly copy their link with the copy button`}
												</RText>
											</div>
										}
									/>
								),
								hideOnMobile: false,
								minWidth: 200,
							},
						]}
						rows={
							filteredUsers.map((user: any) => {
								const row = {
									label: user.id,
									cells: [
										{
											content: (
												<div className="flex items-center gap-3">
													<Avatar className="h-[24px] w-[24px]">
														<AvatarImage
															src={
																user
																	?.UserProfile[0]
																	?.avatarUrl as string
															}
															style={{
																objectFit:
																	'cover',
																objectPosition:
																	'top',
															}}
														/>
														<AvatarFallback>
															{
																user
																	?.UserProfile[0]
																	.firstName[0] as string
															}
														</AvatarFallback>
													</Avatar>
													<RText fontWeight="medium">
														{
															user?.UserProfile[0]
																.firstName
														}{' '}
														{
															user?.UserProfile[0]
																.lastName
														}
													</RText>
												</div>
											),
											label: 'Member',
										},
										{
											content: (
												<div className="flex gap-2">
													{user.ReferralRequest.slice(
														0,
														3
													)
														.sort(
															(
																a: any,
																b: any
															) => {
																if (
																	searchString.length >=
																	2
																) {
																	const aMatch =
																		a.company.name
																			.toLowerCase()
																			.startsWith(
																				searchString.toLowerCase()
																			);
																	const bMatch =
																		b.company.name
																			.toLowerCase()
																			.startsWith(
																				searchString.toLowerCase()
																			);
																	if (
																		aMatch &&
																		!bMatch
																	) {
																		return -1;
																	}
																	if (
																		!aMatch &&
																		bMatch
																	) {
																		return 1;
																	}
																}
																return 0;
															}
														)
														.map((request: any) => {
															return (
																<Avatar
																	className="h-[18px] w-[18px]"
																	key={
																		request.id
																	}
																>
																	<AvatarImage
																		src={
																			request
																				.company
																				.logoUrl as string
																		}
																		style={{
																			objectFit:
																				'cover',
																			objectPosition:
																				'top',
																		}}
																	/>
																</Avatar>
															);
														})}
													{user.ReferralRequest
														.length > 3 && (
														<RText
															fontSize="b2"
															color="tertiary"
														>
															+{' '}
															{user
																.ReferralRequest
																.length - 3}
														</RText>
													)}
												</div>
											),
											label: 'jobTitle',
										},
										{
											content: (
												<div className="flex gap-2">
													<RButton
														onClick={() => {
															const generalLink =
																user.Link.find(
																	(
																		link: any
																	) =>
																		!link.specificRequest
																);
															window.open(
																`${process.env.NEXT_PUBLIC_SERVER_URL}/${generalLink.id}`
															);
														}}
														size="sm"
														iconName="external-link"
													>
														see requests
													</RButton>
												</div>
											),
											label: 'action',
										},
									],
								};

								return row;
							}) ?? []
						}
					/>
				) : (
					<RText color="secondary">No members.</RText>
				)}
			</div>
		</OrgPageLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	if (!ctx.params) {
		// handle the case when params is undefined
		return { props: {} };
	}
	const { org_id } = ctx.params;

	const org = await prisma.organization.findUnique({
		where: {
			id: org_id as string,
		},
		include: {
			users: {
				include: {
					user: {
						include: {
							ReferralRequest: {
								include: {
									company: true,
								},
							},
							Link: true,
							UserProfile: true,
						},
					},
				},
			},
		},
	});

	if (!org) {
		// redirect to 404
		return {
			redirect: {
				destination: '/404',
				permanent: false,
			},
		};
	}

	return {
		props: {
			org,
		},
	};
}
