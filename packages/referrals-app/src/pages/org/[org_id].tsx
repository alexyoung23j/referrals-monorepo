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
import { RTooltip } from '~/components/ui/tooltip';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ConfirmationModal } from '~/components/modals/confirmation_modal';
import { useToast } from '~/components/ui/use-toast';
import { api } from '~/utils/api';
import Head from 'next/head';

export default function OrgPage({ org }: { org: any }) {
	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const isMedium = useMediaQuery({
		query: '(max-width: 1280px)',
	});
	const [searchString, setSearchString] = useState('');
	const router = useRouter();
	const [joinOrgModalOpen, setJoinOrgModalOpen] = useState(false);
	const [orgPassword, setOrgPassword] = useState('');

	const { data: sessionData } = useSession();
	const joinOrg = api.organizations.joinOrganization.useMutation();

	const { toast } = useToast();

	const maxNumCompanies = isMobile ? 4 : isMedium ? 6 : 8;

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

	return (
		<>
			<Head>
				<title>{`${org.name} Referral Requests`}</title>
				<meta
					property="og:title"
					content={`Join ${org.name}'s Referral Board`} // TODO: marketing copy here
				/>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<meta
					property="og:description"
					content="ReferLink - Job referrals faster than ever"
				/>

				<meta property="og:url" content="referlink.xyz" />
				<meta
					property="og:image"
					content="https://referlink.xyz/image_preview.png"
				/>
			</Head>
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
				<ConfirmationModal
					open={joinOrgModalOpen}
					onOpenChange={(isOpen) => {
						setJoinOrgModalOpen(isOpen);
					}}
					headerText={`Join ${org?.name}`}
					content={
						<div className="flex flex-col gap-4">
							<RText>
								{`Joining will add your profile to this page.`}
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
								organizationId: org?.id as string,
								password: orgPassword,
							});
							router.reload();
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
				<div
					className={`to-background fixed bottom-0 z-50 flex max-h-fit items-center justify-center ${
						isMobile
							? 'w-[100vw] pb-[24px] pt-[50px]'
							: 'w-[60vw] pb-[32px] pt-[80px]'
					}`}
					style={{
						background:
							'linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(255,255,255,1) 40%)',
					}}
				>
					<RButton
						size="lg"
						iconName="key-round"
						onClick={() => {
							// check if current user is already in org
							const userInOrg = org?.users?.find(
								(user: any) =>
									user.user.id === sessionData?.user?.id
							);

							if (sessionData?.user && !userInOrg) {
								setJoinOrgModalOpen(true);
							} else if (!sessionData?.user) {
								router.push('/auth/login');
							} else if (userInOrg) {
								toast({
									title: 'You are already in this organization.',
									duration: 1500,
								});
							}
						}}
					>
						Join {org.name}
					</RButton>
				</div>
				<div
					className={`${
						isMobile ? 'mt-[3vh]' : 'mt-[10vh]'
					} flex h-full w-full flex-col gap-[28px] ${
						isMobile ? 'px-[24px]' : 'px-[104px]'
					} relative flex-col pb-[35vh]`}
				>
					{!isMobile && (
						<RText
							fontSize={isMobile ? 'h3' : 'h1point5'}
							fontWeight="medium"
						>
							{`${org.name} Referral Requests`}
						</RText>
					)}
					{org.instructionText && (
						<RText
							fontSize={isMobile ? 'b2' : 'b1'}
							color="secondary"
						>
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
							cardElevation={
								filteredUsers.length > 1 ? 'none' : 'md'
							}
							pl="pl-[16px]"
							pr="pr-[16px]"
							columns={[
								{
									label: 'Member',
									minWidth: isMobile
										? 150
										: isMedium
										? 150
										: 240,
									hideOnMobile: false,
								},
								{
									label: 'Companies',
									minWidth: isMedium ? 75 : 200,
									hideOnMobile: false,
								},
								{
									label: 'Details',
									hideOnMobile: true,
									minWidth: 200,
								},
							]}
							rows={
								filteredUsers.map((user: any) => {
									const row = {
										label: user.id,
										onClick: () => {
											if (isMobile) {
												const generalLink =
													user.Link.find(
														(link: any) =>
															!link.specificRequest
													);
												window.open(
													`${process.env.NEXT_PUBLIC_SERVER_URL}/${generalLink.id}`,
													'_blank'
												);
											}
										},
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
																user
																	?.UserProfile[0]
																	.firstName
															}{' '}
															{
																user
																	?.UserProfile[0]
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
															maxNumCompanies
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
															.map(
																(
																	request: any
																) => {
																	return (
																		<RTooltip
																			key={
																				request.id
																			}
																			delayDuration={
																				200
																			}
																			trigger={
																				<Avatar
																					className="h-[18px] w-[18px]"
																					onClick={(
																						e
																					) => {
																						const link =
																							user.Link.find(
																								(
																									link: any
																								) =>
																									link.referralRequestId ===
																									request.id
																							);

																						console.log(
																							link
																						);

																						if (
																							link
																						) {
																							e.stopPropagation();
																							window.open(
																								`${process.env.NEXT_PUBLIC_SERVER_URL}/${link.id}`,
																								'_blank'
																							);
																						}
																					}}
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
																			}
																			content={
																				<div>
																					<RText fontSize="b2">
																						{
																							request
																								.company
																								.name
																						}
																					</RText>
																				</div>
																			}
																			align="start"
																			side="bottom"
																		/>
																	);
																}
															)}
														{user.ReferralRequest
															.length >
															maxNumCompanies && (
															<RText
																fontSize="b2"
																color="tertiary"
															>
																+{' '}
																{user
																	.ReferralRequest
																	.length -
																	maxNumCompanies}
															</RText>
														)}
													</div>
												),
												label: 'jobTitle',
											},
											{
												content: (
													<div className="flex items-center gap-2">
														{!isMobile && (
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
																		`${process.env.NEXT_PUBLIC_SERVER_URL}/${generalLink.id}`,
																		'_blank'
																	);
																}}
																size="md"
																iconName="external-link"
															>
																see requests
															</RButton>
														)}

														{isMobile ? (
															<Icon
																name="external-link"
																className="cursor-pointer"
																size={14}
																onClick={(
																	e
																) => {
																	const generalLink =
																		user.Link.find(
																			(
																				link: any
																			) =>
																				!link.specificRequest
																		);

																	if (
																		generalLink
																	) {
																		e.stopPropagation();
																		window.open(
																			`${process.env.NEXT_PUBLIC_SERVER_URL}/${generalLink.id}`,
																			'_blank'
																		);
																	}
																}}
															/>
														) : (
															<Icon
																name="copy"
																className="cursor-pointer"
																size={12}
																onClick={() => {
																	const generalLink =
																		user.Link.find(
																			(
																				link: any
																			) =>
																				!link.specificRequest
																		);

																	navigator.clipboard.writeText(
																		`${process.env.NEXT_PUBLIC_SERVER_URL}/${generalLink.id}`
																	);
																	toast({
																		title: 'Copied ReferLink to clipboard.',
																		duration: 1500,
																	});
																}}
															/>
														)}
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
		</>
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
