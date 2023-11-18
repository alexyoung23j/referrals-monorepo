/* eslint-disable indent */
import { type GetServerSidePropsContext } from 'next';
import { MobileNotAllowed, PageLayout } from '~/components/layouts';
import { RButton } from '~/components/ui/button';
import { redirectIfNotAuthed } from '~/utils/routing';
import { prisma } from '~/server/db';
import { generateValidLink } from '~/utils/links';
import ShareSection from '~/components/dashboard/share_section';
import { Separator } from '~/components/ui/separator';
import { useSession } from 'next-auth/react';
import ActivityModal from '~/components/modals/activity_modal';
import { useEffect, useState } from 'react';
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
import { ConfirmationModal } from '~/components/modals/confirmation_modal';
import { useRouter } from 'next/router';
import { useMediaQuery } from 'react-responsive';
import { constructEmailMessage } from '~/utils/emailTemplates';
import { EmailJobType, EmailJobStatus } from '@prisma/client';
import Spinner from '~/components/ui/spinner';

interface DashboardPageProps {
	userMainLink: string; // Replace 'any' with the actual type of 'link'
}

const InfoModal = ({
	showInfoModal,
	setShowInfoModal,
	defaultLink,
	isMobileScreen,
}: {
	showInfoModal: boolean;
	setShowInfoModal: (open: boolean) => void;
	defaultLink: string;
	isMobileScreen: boolean;
}) => {
	const router = useRouter();

	return (
		<ActivityModal
			headerText="Welcome to ReferLink!"
			sections={[
				{
					type: 'single-column',
					content: [
						<div key="about" className="flex flex-col gap-4">
							<RText fontSize={isMobileScreen ? 'b1' : 'h3'}>
								{`This is the Dashboard page, where you will manage
							your job search by creating referral requests for
							any job you're interested in!`}
							</RText>
						</div>,
					],
				},

				{
					type: 'single-column',
					content: [
						<div key="about" className="flex flex-col gap-4">
							<RText fontSize={isMobileScreen ? 'b1' : 'h3'}>
								You now have access to a special profile link
								you can use to easily share ALL your referral
								requests with anyone in your network. Here it
								is:
							</RText>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div className="flex items-center gap-3" key="what">
							<RInput
								value={`${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${defaultLink}`}
								copyEnabled
								readOnly
								highlighted
								className="cursor-pointer underline"
								copyOnClick
							/>
							<RText color="tertiary" fontSize="b2">
								Shareable link
							</RText>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div key="about" className="flex flex-col gap-4">
							<RText fontSize={isMobileScreen ? 'b1' : 'h3'}>
								You can also share requests individually by
								clicking{' '}
								<RText
									fontSize={isMobileScreen ? 'b1' : 'h3'}
									fontWeight="bold"
								>
									{'"Share request"'}
								</RText>{' '}
								and copying the link that appears.
							</RText>
						</div>,
					],
				},
				{
					type: 'single-column',
					content: [
						<div key="about" className="flex flex-col gap-4">
							<RText fontSize={isMobileScreen ? 'b1' : 'h3'}>
								{`Edit your profile to give
								your referrer's more context in the `}
								<RText
									fontSize={isMobileScreen ? 'b1' : 'h3'}
									className="cursor-pointer underline"
									fontWeight="bold"
									onClick={() => {
										router.push('/profile');
									}}
								>
									Profile Page
								</RText>
								. The more you include, the easier it is for
								them to complete your request.
							</RText>
						</div>,
					],
				},

				{
					type: 'single-column',
					content: [
						<div key="about" className="flex flex-col gap-4">
							<RText fontSize={isMobileScreen ? 'b1' : 'h3'}>
								Create your first request by clicking{' '}
								<RText
									fontSize={isMobileScreen ? 'b1' : 'h3'}
									fontWeight="bold"
								>
									{'"New request"'}
								</RText>{' '}
								in the Requests section!
							</RText>
						</div>,
					],
				},

				{
					type: 'single-column',
					content: [
						<div
							key="about"
							className="flex w-full flex-col items-end gap-[16px]"
						>
							<div className="w-full" key="separator">
								<Separator />
							</div>
							<div
								className="flex max-w-fit cursor-pointer rounded-[6px] bg-[#D0E6FF] px-[10px] py-[8px] hover:bg-[#F1F5F9]"
								onClick={() => {
									setShowInfoModal(false);
								}}
							>
								<RText fontWeight="medium">Get started →</RText>
							</div>
						</div>,
					],
				},
			]}
			open={showInfoModal}
			onOpenChange={(open: boolean) => {
				setShowInfoModal(open);
			}}
		/>
	);
};

export default function DashboardPage({ userMainLink }: DashboardPageProps) {
	const router = useRouter();
	const { info, create } = router.query;
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
	const [isCreatingRequest, setIsCreatingRequest] = useState(false);
	const [updateSubscriptionModalOpen, setUpdateSubscriptionModalOpen] =
		useState(false);

	const [pageLoaded, setPageLoaded] = useState(false);

	useEffect(() => {
		if (!pageLoaded) {
			setPageLoaded(true);
		}
	}, [pageLoaded]);

	const [showInfoModal, setShowInfoModal] = useState(false);

	useEffect(() => {
		if (info === 'true') {
			setShowInfoModal(true);
		}
		if (create === 'true') {
			setNewRequestModalOpen(true);
		}
	}, []);

	const isMobileScreen = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const createReferralRequest =
		api.referralRequest.createRequest.useMutation();

	const createStripeCustomerAndPortal =
		api.stripe.createBillingPortal.useMutation();

	const onSubscribeClick = async () => {
		const res = await createStripeCustomerAndPortal.mutateAsync();
		void router.push(res.billingUrl as string);
	};

	const createRequest = async () => {
		if (hasFormErrors || !company) {
			toast({
				title: 'Please fill out the required fields.',
				duration: 2000,
			});
			return;
		}
		try {
			setIsCreatingRequest(true);
			await createReferralRequest.mutateAsync({
				companyName: company.name,
				companyLogo: company.logo,
				jobTitle,
				jobPostingLink,
				isAnyOpenRole,
				isCreatedByUser: companyIsCreatedByUser,
			});

			setNewRequestModalOpen(false);

			toast({
				title: 'Created request.',
				duration: 2000,
			});

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			console.log(e);
			if (
				e.message ===
				'You must have a Pro subscription to create more referral requests.'
			) {
				setNewRequestModalOpen(false);
				setUpdateSubscriptionModalOpen(true);
			} else {
				toast({
					title: e.message,
					duration: 2000,
				});
			}
		}
		setShouldRefetch((prev) => !prev);
		setIsCreatingRequest(false);
		setCompany(null);
		setJobTitle('');
		setJobPostingLink('');
		setAnyOpenRole(false);
	};

	if (!pageLoaded) {
		return (
			<div className="flex h-[100vh] w-full items-center justify-center">
				<Spinner size="medium" />
			</div>
		);
	}

	return (
		<>
			<InfoModal
				showInfoModal={showInfoModal}
				setShowInfoModal={setShowInfoModal}
				defaultLink={userMainLink}
				isMobileScreen={isMobileScreen}
			/>
			<PageLayout
				showSidebar
				pageTitle="Dashboard"
				pageSubtitle="Create, manage, and share your referral requests."
				topRightContent={
					!isMobileScreen ? (
						<RButton
							size="lg"
							iconName="plus"
							onClick={() => {
								setNewRequestModalOpen(true);
							}}
						>
							Create request
						</RButton>
					) : (
						<RButton
							size="lg"
							iconName="info"
							variant="secondary"
							onClick={() => {
								setShowInfoModal(true);
							}}
						>
							Info
						</RButton>
					)
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
								<div
									key="1"
									className="flex items-center gap-3 "
								>
									<Switch
										checked={isAnyOpenRole}
										onCheckedChange={(checked) => {
											setAnyOpenRole(checked);
											if (checked) {
												setHasFormErrors(false);
											}
										}}
									/>
									<RText fontWeight="medium">
										Any open role
									</RText>
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
												setJobPostingLink(
													e.target.value
												);
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
						<RButton
							iconName="check"
							onClick={createRequest}
							isLoading={isCreatingRequest}
						>
							Create request
						</RButton>
					}
				/>
				<ConfirmationModal
					headerText="Subscribe to Pro?"
					content={
						<div>
							<RText>
								You must be a Pro subscriber to create and share
								more than 5 referral requests. Subscribe now for{' '}
								<RText fontWeight="bold">$9.99/month</RText> and
								access unlimited requests!
							</RText>
						</div>
					}
					onCancel={() => {
						setUpdateSubscriptionModalOpen(false);
					}}
					onOpenChange={(open) => {
						setUpdateSubscriptionModalOpen(open);
					}}
					onConfirm={onSubscribeClick}
					open={updateSubscriptionModalOpen}
					destructive={false}
					confirmButtonText="Subscribe Now"
				/>
				<div className="my-[16px] flex w-full flex-col gap-[36px] pb-[20vh]">
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
		</>
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

			// Create a new user profile if none yet exists
			const existingProfile = await prisma.userProfile.findFirst({
				where: {
					userId: session?.user.id,
				},
			});

			if (!existingProfile) {
				// Create a new profile if one doesn't exist
				await prisma.userProfile.create({
					data: {
						user: {
							connect: {
								id: session?.user.id,
							},
						},
						publicEmail: session?.user.email,
						firstName: session?.user.name?.split(' ')[0],
						lastName: session?.user.name?.split(' ')[1],
						avatarUrl: session?.user.image ?? ''
					},
				});
			}

			const user = await prisma.user.findUnique({
				where: {
					id: session?.user.id,
				},
			});

			if (user && !user.welcomeEmailSent && user.name && user.email) {
				await prisma.emailJob.create({
					data: {
						toAddress: user?.email,
						body: constructEmailMessage(
							EmailJobType.WELCOME_EMAIL,
							{
								firstName:
									user.name?.split(' ')[0] ?? user.name,
								linkId: link.id,
							}
						),
						emailType: EmailJobType.WELCOME_EMAIL,
						status: EmailJobStatus.QUEUED,
						subject: 'Get Started with ReferLink!',
					},
				});

				await prisma.user.update({
					where: {
						id: user.id,
					},
					data: {
						welcomeEmailSent: true,
					},
				});
			}

			return {
				props: { session, userMainLink: link.id },
			};
		},
	});
}
