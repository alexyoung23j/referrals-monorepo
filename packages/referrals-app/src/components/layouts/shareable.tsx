/* eslint-disable indent */
import { useMediaQuery } from 'react-responsive';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Icon from '../ui/icons';
import { RText } from '../ui/text';
import { RTabsSection } from '../ui/tabs';
import { RLogo } from '../ui/logo';
import { ScrollArea } from '../ui/scroll-area';
import { useState } from 'react';
import { Separator } from '~/components/ui/separator';
import { Toaster } from '../ui/toaster';
import { PDFRenderer, handleDownload } from '../ui/pdf';
import { supabase } from '~/server/api/routers/supabase_bucket';
import { RPopover } from '../ui/popover';
import ActivityModal from '../modals/activity_modal';

type LinkPageLayoutProps = {
	avatarUrl?: string;
	profileName: string;
	currentRoleTitle?: string;
	location?: string;
	education?: string;
	linkedInUrl?: string;
	twitterUrl?: string;
	personalSiteUrl?: string;
	resumeUrl?: string;
	jobExperience?: Array<{
		company: string;
		companyLogoUrl?: string;
		jobTitle: string;
		startDate: string;
		endDate?: string;
	}>;
	children?: React.ReactNode;
	showInfoModal: boolean;
	setShowInfoModal: (open: boolean) => void;
};

const LinkPageMobile = ({
	avatarUrl,
	profileName,
	currentRoleTitle,
	location,
	education,
	linkedInUrl,
	twitterUrl,
	resumeUrl,
	personalSiteUrl,
	jobExperience,
	children,
}: LinkPageLayoutProps) => {
	const [showRequests, setShowRequests] = useState(true);
	const [maxExperiences, setMaxExperiences] = useState(3);

	return (
		<div className="bg-background flex h-screen flex-col">
			<div className="bg-profileBackgroundGrey flex flex-col items-center gap-[12px] p-[24px]">
				<div className="flex flex-col items-center gap-[8px]">
					<Avatar className="h-[56px] w-[56px]">
						<AvatarImage
							src={avatarUrl}
							style={{
								objectFit: 'cover',
								objectPosition: 'top',
							}}
						/>
						<AvatarFallback>
							{profileName[0] as string}
						</AvatarFallback>
					</Avatar>
					<RText fontSize="h1" fontWeight="medium">
						{profileName}
					</RText>
				</div>

				<RTabsSection
					tabs={[
						{ label: 'Referral requests' },
						{ label: 'Profile' },
					]}
					onTabsChange={(tab) => {
						if (tab === 'Referral requests') {
							setShowRequests(true);
						} else {
							setShowRequests(false);
						}
					}}
				/>
			</div>
			<Toaster />
			{showRequests ? (
				<div className="scrollbar flex h-full flex-col items-center">
					{children}
				</div>
			) : (
				<div className="scrollbar flex h-full flex-col items-center overflow-auto p-5">
					<div className="mt-2 flex w-full max-w-[360px] flex-col gap-6">
						<div className="flex flex-col gap-3 px-[24px]">
							{currentRoleTitle && (
								<div className="flex items-center gap-3">
									<Icon
										name="tag"
										size="16px"
										color="#64748b"
									/>
									<RText
										color="secondary"
										fontWeight="medium"
									>
										{currentRoleTitle}
									</RText>
								</div>
							)}
							{location && (
								<div className="flex items-center gap-3">
									<Icon
										name="map-pin"
										size="16px"
										color="#64748b"
									/>
									<RText
										color="secondary"
										fontWeight="medium"
									>
										{location}
									</RText>
								</div>
							)}
							{education && (
								<div className="flex items-center gap-3">
									<Icon
										name="graduation-cap"
										size="16px"
										color="#64748b"
									/>
									<RText
										color="secondary"
										fontWeight="medium"
									>
										{education}
									</RText>
								</div>
							)}
						</div>

						<Separator />

						<div
							key="Experience"
							className="flex flex-col justify-between gap-6 pl-[24px] pr-[12px]"
						>
							{jobExperience &&
								jobExperience
									.slice(0, maxExperiences)
									.map((experience, idx) => {
										return (
											<div
												key={`${experience.company}${experience.startDate}`}
												className="flex h-full flex-row items-center gap-4"
											>
												<RLogo
													logoUrl={
														experience.companyLogoUrl
													}
													size={32}
												/>
												<div className="flex flex-col gap-2">
													<div className="flex items-center gap-2">
														<RText
															fontSize="b1"
															fontWeight="medium"
															color="secondary"
															className="truncate"
														>
															{experience.company
																.length > 20
																? `${experience.company.substring(
																		0,
																		20
																  )}...`
																: experience.company}
														</RText>
														<RText
															fontWeight="light"
															color="tertiary"
															fontSize="b2"
														>{`${
															experience.startDate
														} - ${
															experience.endDate ??
															'Present'
														}`}</RText>
													</div>
													<RText
														color="primary"
														fontSize="b1"
														fontWeight="medium"
													>
														{experience.jobTitle}
													</RText>
												</div>
											</div>
										);
									})}
							{jobExperience &&
								jobExperience.length > maxExperiences && (
									<div
										className="cursor-pointer"
										onClick={() => {
											setMaxExperiences(
												maxExperiences + 3
											);
										}}
									>
										<RText color="tertiary" fontSize="b2">
											see more
										</RText>
									</div>
								)}
						</div>
						<Separator />
						{resumeUrl && (
							<div className="mb-[200px] flex flex-col items-center gap-3">
								<PDFRenderer
									fileName={resumeUrl}
									preUploadedResumeUrl={resumeUrl}
									size="md"
								/>
							</div>
						)}
						<div
							className="bg-background fixed bottom-[0px] left-[0px] flex w-full justify-center gap-8 pb-[16px] pt-[32px]"
							style={{
								background:
									'linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(255,255,255,1) 40%)',
							}}
						>
							{twitterUrl && (
								<Icon
									name="twitter"
									size="24px"
									color="#64748b"
									fill="#64748b"
									className="cursor-pointer"
									onClick={() => {
										window.open(twitterUrl, '_blank');
									}}
								/>
							)}
							{linkedInUrl && (
								<Icon
									name="linkedin"
									size="24px"
									color="#64748b"
									fill="#64748b"
									className="cursor-pointer"
									onClick={() => {
										window.open(linkedInUrl, '_blank');
									}}
								/>
							)}
							{personalSiteUrl && (
								<Icon
									name="link"
									size="24px"
									color="#64748b"
									strokeWidth={2.5}
									className="cursor-pointer"
									onClick={() => {
										window.open(personalSiteUrl, '_blank');
									}}
								/>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
const LinkPageDesktop = ({
	avatarUrl,
	profileName,
	currentRoleTitle,
	location,
	education,
	linkedInUrl,
	twitterUrl,
	personalSiteUrl,
	resumeUrl,
	jobExperience,
	children,
}: LinkPageLayoutProps) => {
	const [maxExperiences, setMaxExperiences] = useState(3);

	return (
		<div className="bg-background flex h-screen">
			<div className="bg-profileBackgroundGrey scrollbar scrollbar-thumb-transparent scrollbar-track-transparent flex min-w-[35vw] max-w-[496px] justify-center overflow-auto">
				<div className="flex flex-col gap-[20px] pt-[15vh]">
					<Avatar className="h-[76px] w-[76px]">
						<AvatarImage
							src={avatarUrl}
							style={{
								objectFit: 'cover',
								objectPosition: 'top',
							}}
						/>
						<AvatarFallback>{profileName[0]}</AvatarFallback>
					</Avatar>
					<RText fontSize="h2" fontWeight="medium">
						{profileName}
					</RText>
					<div className="flex flex-col gap-3">
						{currentRoleTitle && (
							<div className="flex items-center gap-3">
								<Icon name="tag" size="16px" color="#64748b" />
								<RText color="secondary" fontWeight="medium">
									{currentRoleTitle}
								</RText>
							</div>
						)}
						{location && (
							<div className="flex items-center gap-3">
								<Icon
									name="map-pin"
									size="16px"
									color="#64748b"
								/>
								<RText color="secondary" fontWeight="medium">
									{location}
								</RText>
							</div>
						)}
						{education && (
							<div className="flex items-center gap-3">
								<Icon
									name="graduation-cap"
									size="16px"
									color="#64748b"
								/>
								<RText color="secondary" fontWeight="medium">
									{education}
								</RText>
							</div>
						)}
					</div>
					<div className="flex gap-4">
						{twitterUrl && (
							<Icon
								name="twitter"
								size="24px"
								color="#64748b"
								fill="#64748b"
								className="cursor-pointer"
								onClick={() => {
									window.open(twitterUrl, '_blank');
								}}
							/>
						)}
						{linkedInUrl && (
							<Icon
								name="linkedin"
								size="24px"
								color="#64748b"
								fill="#64748b"
								className="cursor-pointer"
								onClick={() => {
									window.open(linkedInUrl, '_blank');
								}}
							/>
						)}
						{personalSiteUrl && (
							<Icon
								name="link"
								size="24px"
								color="#64748b"
								strokeWidth={2.5}
								className="cursor-pointer"
								onClick={() => {
									window.open(personalSiteUrl, '_blank');
								}}
							/>
						)}
					</div>
					<div className="mt-[24px] flex flex-col gap-[24px]">
						{(resumeUrl ||
							(jobExperience && jobExperience.length > 0)) && (
							<RTabsSection
								tabs={[
									{ label: 'Experience' },
									{ label: 'Resume' },
								]}
								tabContents={[
									<div
										key="Experience"
										className="mb-10 mt-5 flex min-w-[23vw] max-w-[23vw] flex-col justify-between gap-6 pl-1"
									>
										{jobExperience &&
											jobExperience
												.slice(0, maxExperiences)
												.map((experience, idx) => {
													return (
														<div
															key={`${experience.company}${experience.startDate}`}
															className="flex h-full flex-row items-center gap-4"
														>
															<RLogo
																logoUrl={
																	experience.companyLogoUrl
																}
																size={28}
															/>
															<div className="flex flex-col gap-2">
																<div className="flex items-center gap-3">
																	<RText
																		fontSize="b1"
																		fontWeight="medium"
																		color="secondary"
																	>
																		{experience
																			.company
																			.length >
																		20
																			? `${experience.company.substring(
																					0,
																					20
																			  )}...`
																			: experience.company}
																	</RText>
																	<RText
																		fontWeight="light"
																		color="tertiary"
																		fontSize="b2"
																	>{`${
																		experience.startDate
																	} - ${
																		experience.endDate ??
																		'Present'
																	}`}</RText>
																</div>
																<RText
																	color="primary"
																	fontSize="b1"
																	fontWeight="medium"
																>
																	{
																		experience.jobTitle
																	}
																</RText>
															</div>
														</div>
													);
												})}
										{jobExperience &&
											jobExperience.length >
												maxExperiences && (
												<div
													className="cursor-pointer"
													onClick={() => {
														setMaxExperiences(
															maxExperiences + 3
														);
													}}
												>
													<RText
														color="tertiary"
														fontSize="b2"
													>
														see more
													</RText>
												</div>
											)}
									</div>,
									<div
										key="resume"
										className="mb-10 mt-5 flex min-w-[23vw] max-w-[23vw] flex-col justify-between gap-6 pl-1"
									>
										{resumeUrl && (
											<div className="flex items-center gap-3">
												<PDFRenderer
													fileName={resumeUrl}
													preUploadedResumeUrl={
														resumeUrl
													}
													size="md"
												/>
												<Icon
													name="download"
													color="#64748b"
													className="cursor-pointer"
													onClick={() => {
														handleDownload(
															resumeUrl
														);
													}}
												/>
											</div>
										)}
									</div>,
								]}
							/>
						)}
					</div>
				</div>
			</div>
			<div className="flex h-screen w-full flex-col items-center overflow-y-auto">
				{children}
				<Toaster />
			</div>
		</div>
	);
};

const LinkPageLayout = ({ ...props }: LinkPageLayoutProps) => {
	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const InfoModal = () => (
		<ActivityModal
			headerText="Instructions"
			sections={[
				{
					type: 'single-column',
					content: [
						<div key="about" className="flex flex-col gap-4">
							<RText
								fontSize={isMobile ? 'b1' : 'h3'}
								fontWeight="light"
							>{`Click 'Refer' for all the details needed for a quick referral, and optionally schedule an email reminder.
							 Or, 'Share' the request with your network and add your own context.`}</RText>

							<RText
								fontSize={isMobile ? 'b1' : 'h3'}
								fontWeight="light"
							>
								You can create your own referral request link{' '}
								<RText
									fontSize={isMobile ? 'b1' : 'h3'}
									fontWeight="normal"
									className="cursor-pointer underline"
									onClick={() => {
										window.open(
											`${process.env.NEXT_PUBLIC_SERVER_URL}`,
											'_blank'
										);
									}}
								>
									here
								</RText>
								.
							</RText>
						</div>,
					],
				},
			]}
			open={props.showInfoModal}
			onOpenChange={(open: boolean) => {
				props.setShowInfoModal(open);
			}}
		/>
	);

	return isMobile ? (
		<>
			<InfoModal />
			<LinkPageMobile {...props} />
		</>
	) : (
		<>
			<InfoModal />
			<LinkPageDesktop {...props} />
		</>
	);
};

export default LinkPageLayout;
