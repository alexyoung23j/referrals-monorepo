/* eslint-disable indent */
import { PageLayout } from '~/components/layouts';
import dynamic from 'next/dynamic';

import { RButton } from '~/components/ui/button';
import { RCard, RowTable } from '~/components/ui/card';
import Icon from '~/components/ui/icons';
import { RPopover } from '~/components/ui/popover';
import { RTag } from '~/components/ui/tag';
import { RText } from '~/components/ui/text';
import { prisma } from '~/server/db';
import Image from 'next/image';

import { GetServerSidePropsContext } from 'next';
import {
	Company,
	JobExperience,
	Link,
	ReferralRequest,
	UserProfile,
} from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useMediaQuery } from 'react-responsive';
import ActivityModal from '~/components/modals/activity_modal';
import { useState } from 'react';

const LinkPageLayout = dynamic(() => import('~/components/layouts/shareable'), {
	ssr: false,
});

type LinkPageProps = {
	link: Link;
	requests: Array<
		ReferralRequest & {
			company: Company;
		}
	>;
	userProfile: UserProfile & {
		JobExperience: Array<JobExperience & { company: Company }>;
	};
};

export default function LinkPage({
	link,
	requests,
	userProfile,
}: LinkPageProps) {
	const [showInfoModal, setShowInfoModal] = useState(false);

	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const linkMessage = link?.blurb ?? userProfile?.defaultMessage ?? null;

	return (
		<LinkPageLayout
			avatarUrl={userProfile.avatarUrl as string}
			currentRoleTitle={
				userProfile?.currentRoleTitle &&
				userProfile.currentRoleTitle.length > 0
					? (userProfile.currentRoleTitle as string)
					: 'unkown role'
			}
			location={
				userProfile.currentLocation &&
				userProfile.currentLocation.length > 0
					? (userProfile.currentLocation as string)
					: 'unkown location'
			}
			profileName={`${
				userProfile.firstName && userProfile.firstName.length > 0
					? (userProfile.firstName as string)
					: 'not public'
			} ${
				userProfile.lastName && userProfile.lastName.length > 0
					? (userProfile.lastName as string)
					: 'not public'
			}`}
			education={userProfile.education as string}
			linkedInUrl={userProfile.linkedInUrl as string}
			twitterUrl={userProfile.twitterUrl as string}
			personalSiteUrl={userProfile.personalSiteUrl as string}
			resumeUrl={userProfile.resumeUrl as string}
			jobExperience={
				userProfile?.JobExperience?.map((job) => ({
					jobTitle: job.title as string,
					company: job.company?.name as string,
					companyLogoUrl: job.company?.logoUrl as string,
					startDate: new Date(
						job.startDate as Date
					).toLocaleDateString('en-US', {
						month: 'short',
						year: 'numeric',
					}) as string,
					endDate: job.endDate
						? new Date(job.endDate as Date).toLocaleDateString(
								'en-US',
								{
									month: 'short',
									year: 'numeric',
								}
						  )
						: ('Present' as string),
				})) ?? []
			}
			showInfoModal={showInfoModal}
			setShowInfoModal={setShowInfoModal}
		>
			{isMobile ? (
				<div
					className={`fixed right-5 top-5 flex cursor-pointer items-center gap-2`}
					onClick={() => {
						setShowInfoModal(true);
					}}
				>
					<Icon name="info" size="18" color="#64748b" />
				</div>
			) : (
				<div className="flex w-full justify-end p-8">
					<div
						className={`${
							isMobile ? 'right-5 top-5' : 'right-10 top-10'
						} flex cursor-pointer items-center gap-2`}
						onClick={() => {
							setShowInfoModal(true);
						}}
					>
						<RText color="secondary" fontSize="b1">
							How it works
						</RText>
						<Icon name="info" size="18" color="#64748b" />
					</div>
				</div>
			)}

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
				<RButton size="lg" iconName="share">
					Share {requests.length > 1 ? 'page' : 'request'}
				</RButton>
			</div>

			<div
				className={`${
					isMobile ? 'mt-[3vh]' : 'mt-[5vh]'
				} flex h-full w-full flex-col gap-[28px] ${
					isMobile ? 'px-[24px]' : 'px-[104px]'
				} relative mb-[35vh] flex-col`}
			>
				<RText
					fontSize={isMobile ? 'h3' : 'h1point5'}
					fontWeight="medium"
				>
					{`${
						userProfile.firstName
					} is on a referral hunt! Can you lend a hand${
						isMobile
							? '?'
							: ` with ${
									requests.length > 1
										? 'these companies?'
										: 'this company?'
							  }`
					}`}
				</RText>
				<div
					className={`flex gap-[28px] ${
						requests && requests.length > 1
							? 'flex-col'
							: 'flex-col-reverse justify-end'
					} `}
				>
					{linkMessage && (
						<div className="w-full">
							<RCard
								elevation={requests.length > 1 ? 'md' : 'none'}
							>
								<div
									className={`flex flex-col  ${
										isMobile
											? 'gap-[8px] p-[4px]'
											: 'gap-[8px] p-[8px]'
									}`}
								>
									<div className="flex items-center gap-3">
										<RText
											fontSize="h3"
											fontWeight="medium"
										>
											From{' '}
											{
												link.blurbAuthorName?.split(
													' '
												)[0]
											}
											:
										</RText>
									</div>
									<RText
										fontSize={isMobile ? 'b2' : 'b1'}
										color="secondary"
										fontWeight="light"
									>
										{`"${linkMessage}"`}
									</RText>
								</div>
							</RCard>
						</div>
					)}
					<div className="flex flex-col gap-[16px]">
						<RowTable
							cardElevation={requests.length > 1 ? 'none' : 'md'}
							mobileWidth={1024}
							columns={[
								{
									label: 'Company',
									minWidth: isMobile ? 75 : 200,
									hideOnMobile: false,
								},
								{
									label: 'Job listing',
									minWidth: 200,
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
														{`"Share request" allows you
													to pass on this request to
													someone else in your
													network. "Refer" allows you
													to refer this person to the
													company.`}
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
								requests.map((request) => {
									const row = {
										label: request.id,
										cells: [
											{
												content: (
													<div className="flex items-center gap-3">
														<Image
															src={
																request?.company
																	?.logoUrl as string
															}
															alt="Logo"
															height={24}
															width={24}
														/>
														<RText fontWeight="medium">
															{
																request.company
																	?.name
															}
														</RText>
													</div>
												),
												label: 'Company',
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
													<div className="flex gap-2">
														<RButton
															variant="secondary"
															size="md"
														>
															Share{' '}
															{isMobile
																? ''
																: 'request'}
														</RButton>
														<RButton size="md">
															Refer
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
					</div>
				</div>
			</div>
		</LinkPageLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	if (!ctx.params) {
		// handle the case when params is undefined
		return { props: {} };
	}
	const { link_code } = ctx.params;

	const link = await prisma.link.findFirst({
		where: {
			id: link_code as string,
		},
		include: {
			user: true,
		},
	});

	const userProfile = await prisma.userProfile.findFirst({
		where: {
			userId: link?.user.id,
		},
		include: {
			JobExperience: {
				include: {
					company: true,
				},
				orderBy: {
					endDate: 'desc',
				},
			},
		},
	});

	if (!userProfile) {
		// TODO: this is broken
	}

	let requests: ReferralRequest[] = [];

	if (link?.referralRequestId) {
		const request = await prisma.referralRequest.findFirst({
			where: {
				id: link.referralRequestId,
			},
			include: {
				company: true,
			},
		});
		if (request) {
			requests = [request];
		} else {
			// TODO: This is a broken link, decide how to handle
		}
	} else {
		requests = await prisma.referralRequest.findMany({
			where: {
				requesterId: link?.user.id,
			},
			include: {
				company: true,
			},
		});
	}

	return {
		props: {
			link,
			requests,
			userProfile,
		},
	};
}
