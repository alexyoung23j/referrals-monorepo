/* eslint-disable indent */
import { PageLayout } from '~/components/layouts';
import dynamic from 'next/dynamic';

import { RButton } from '~/components/ui/button';
import { RowTable } from '~/components/ui/card';
import Icon from '~/components/ui/icons';
import { RPopover } from '~/components/ui/popover';
import { RTag } from '~/components/ui/tag';
import { RText } from '~/components/ui/text';
import { prisma } from '~/server/db';

import { GetServerSidePropsContext } from 'next';
import {
	Company,
	JobExperience,
	Link,
	ReferralRequest,
	UserProfile,
} from '@prisma/client';

const LinkPageLayout = dynamic(() => import('~/components/layouts/shareable'), {
	ssr: false,
});

type LinkPageProps = {
	link: Link;
	requests: ReferralRequest[];
	userProfile: UserProfile & {
		JobExperience: Array<JobExperience & { company: Company }>;
	};
};

export default function LinkPage({
	link,
	requests,
	userProfile,
}: LinkPageProps) {
	console.log({
		link,
		requests,
		userProfile,
	});

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
		>
			<div className="h-full w-full">
				<RowTable
					columns={[
						{
							label: (
								<RPopover
									trigger={
										<div className="flex gap-1">
											<RText
												fontSize="b2"
												color="tertiary"
											>
												Label
											</RText>
											<Icon
												name="info"
												size="12px"
												color="#94a3b8"
											/>
										</div>
									}
									content={<div>Popover content</div>}
								/>
							),
							minWidth: 200,
							hideOnMobile: false,
						},
						{
							label: 'label2',
							iconName: 'chevrons-up-down',
							hideOnMobile: true,
						},
						{
							label: 'label3',
							iconName: 'chevrons-up-down',
							hideOnMobile: false,
						},
					]}
					rows={[
						{
							label: 'row1',
							cells: [
								{ content: 'cell12', label: 'label1' },
								{ content: 'cell22', label: 'label2' },
								{
									content: <RTag label="tag" />,
									label: 'label22',
								},
							],
						},
						{
							label: 'row2',
							cells: [
								{ content: 'cell1', label: 'label1' },
								{ content: 'cell2', label: 'label2' },
								{
									content: <RTag label="tag" />,
									label: 'label2',
								},
							],
						},
					]}
				/>
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
