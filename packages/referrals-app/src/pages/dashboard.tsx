/* eslint-disable indent */
import { type GetServerSidePropsContext } from 'next';
import { PageLayout } from '~/components/layouts';
import { RButton } from '~/components/ui/button';
import { redirectIfNotAuthed } from '~/utils/routing';
import { prisma } from '~/server/db';
import { generateValidLink } from '~/utils/links';
import ShareSection from '~/components/dashboard/share_section';
import { Separator } from '~/components/ui/separator';
import { useSession } from 'next-auth/react';
import ActivityModal from '~/components/modals/activity_modal';
import { useState } from 'react';
import { Switch } from '~/components/ui/switch';
import { RText } from '~/components/ui/text';
import { RLabeledSection } from '~/components/ui/labeled_section';
import { RInput } from '~/components/ui/input';
import { z } from 'zod';
import {
	type Company,
	CompanyCombobox,
} from '~/components/company/company_combobox';
import { api } from '~/utils/api';
import { useToast } from '~/components/ui/use-toast';
import RequestsSection from '~/components/dashboard/requests_section';
import Head from 'next/head';

interface DashboardPageProps {
	userMainLink: string; // Replace 'any' with the actual type of 'link'
}

export default function DashboardPage({ userMainLink }: DashboardPageProps) {
	const { toast } = useToast();
	const { data: sessionData } = useSession();
	const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
	const [isAnyOpenRole, setAnyOpenRole] = useState(false);
	const [company, setCompany] = useState<Company | null>(null);
	const [jobTitle, setJobTitle] = useState('');
	const [jobPostingLink, setJobPostingLink] = useState('');
	const [hasFormErrors, setHasFormErrors] = useState(false);
	const [companyIsCreatedByUser, setCompanyIsCreatedByUser] = useState(false);
	const [shouldRefetch, setShouldRefetch] = useState(false);

	const createReferralRequest =
		api.referralRequest.createRequest.useMutation();

	const createRequest = async () => {
		if (hasFormErrors || !company) {
			toast({
				title: 'Please fill out the required fields.',
				duration: 2000,
			});
			return;
		}
		try {
			setNewRequestModalOpen(false);

			await createReferralRequest.mutateAsync({
				companyName: company.name,
				companyLogo: company.logo,
				jobTitle,
				jobPostingLink,
				isAnyOpenRole,
				isCreatedByUser: companyIsCreatedByUser,
			});
			setShouldRefetch((prev) => !prev);

			toast({
				title: 'Created request.',
				duration: 2000,
			});

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			toast({
				title: e.message,
				duration: 2000,
			});
		}
		setCompany(null);
		setJobTitle('');
		setJobPostingLink('');
		setAnyOpenRole(false);
	};

	return (
		<PageLayout
			showSidebar
			pageTitle="Dashboard"
			topRightContent={
				<RButton
					size="lg"
					iconName="plus"
					onClick={() => {
						setNewRequestModalOpen(true);
					}}
				>
					New referral request
				</RButton>
			}
		>
			<Head>
				<title>Dashboard - ReferLink</title>
			</Head>
			<ActivityModal
				open={newRequestModalOpen}
				onOpenChange={(open) => {
					setNewRequestModalOpen(open);
					if (!open) {
						setCompany(null);
						setJobTitle('');
						setJobPostingLink('');
						setAnyOpenRole(false);
					}
				}}
				headerText="Create referral request"
				subtitleText="Link to a job listing or choose “Any open role” for a general referral."
				sections={[
					{
						type: 'single-column',
						content: [
							<div key="1" className="flex items-center gap-3 ">
								<Switch
									checked={isAnyOpenRole}
									onCheckedChange={(checked) => {
										setAnyOpenRole(checked);
										if (checked) {
											setHasFormErrors(false);
										}
									}}
								/>
								<RText fontWeight="medium">Any open role</RText>
							</div>,
						],
					},
					{
						type: 'two-column',
						content: [
							<RLabeledSection
								label="Company*"
								body={
									<CompanyCombobox
										onCreateCompany={(company) => {
											setCompany(company);
											setCompanyIsCreatedByUser(true);
										}}
										onSelectCompany={(company) => {
											setCompany(company);
										}}
									/>
								}
								key="2"
							/>,
							<RLabeledSection
								label="Job title"
								body={
									<RInput
										placeholder="enter title"
										value={jobTitle}
										onChange={(e) => {
											setJobTitle(e.target.value);
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
								label={
									isAnyOpenRole
										? 'Job posting link'
										: 'Job posting link*'
								}
								subtitle={
									isAnyOpenRole
										? 'Feel free to link to your top choice job at this company.'
										: undefined
								}
								body={
									<RInput
										placeholder="enter link"
										validationSchema={z.string().url()}
										isRequired={!isAnyOpenRole}
										value={jobPostingLink}
										onChange={(e) => {
											setJobPostingLink(e.target.value);
										}}
										onErrorFound={() => {
											setHasFormErrors(true);
										}}
										onErrorFixed={() => {
											setHasFormErrors(false);
										}}
									/>
								}
								key="4"
							/>,
						],
					},
				]}
				bottomRowContent={
					<RButton iconName="check" onClick={createRequest}>
						Create request
					</RButton>
				}
			/>
			<div className="my-[16px] flex h-[200vh] w-full flex-col gap-[36px]">
				<ShareSection
					linkCode={userMainLink}
					userName={sessionData?.user.name as string}
				/>
				<Separator />
				<RequestsSection
					shouldUpdate={shouldRefetch}
					setNewRequestModalOpen={setNewRequestModalOpen}
				/>
			</div>
		</PageLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	// Redirect to Landing Page if Not Logged in
	return redirectIfNotAuthed({
		ctx,
		redirectUrl: '/',
		callback: async (session) => {
			// Create a new main link if none yet exists

			let link = await prisma.link.findFirst({
				where: {
					userId: session?.user.id,
					specificRequest: null,
				},
			});

			if (!link) {
				link = await generateValidLink({
					userId: session?.user.id as string,
					createdByLoggedInUser: true,
					blurbAuthorName: session?.user.name as string,
				});
			}

			return {
				props: { session, userMainLink: link.id },
			};
		},
	});
}
