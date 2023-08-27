/* eslint-disable indent */
import { useMediaQuery } from 'react-responsive';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Icon from '../ui/icons';
import { RText } from '../ui/text';
import { RTabsSection } from '../ui/tabs';
import { RLogo } from '../ui/logo';
import { ScrollArea } from '../ui/scroll-area';
import { useState } from 'react';

type LinkPageLayoutProps = {
	avatarUrl?: string;
	profileName?: string;
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
	jobExperience,
	children,
}: LinkPageLayoutProps) => {
	return <div></div>;
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
	const [maxExperiences, setMaxExperiences] = useState(4);

	return (
		<div className="bg-background flex h-screen">
			<div className="bg-profileBackgroundGrey scrollbar scrollbar-thumb-transparent scrollbar-track-transparent flex min-w-[35vw] max-w-[496px] justify-center overflow-auto">
				<div className="flex flex-col gap-[24px] pt-[10vh]">
					<Avatar className="h-[112px] w-[112px]">
						<AvatarImage src={avatarUrl} />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-3">
						{currentRoleTitle && (
							<div className="flex items-center gap-1">
								<Icon name="tag" size="16px" color="#64748b" />
								<RText color="secondary" fontWeight="medium">
									{currentRoleTitle}
								</RText>
							</div>
						)}
						{location && (
							<div className="flex items-center gap-1">
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
							<div className="flex items-center gap-1">
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
					<div className="mt-[36px] flex flex-col gap-[24px]">
						{resumeUrl &&
							jobExperience &&
							jobExperience.length > 0 && (
								<RTabsSection
									tabs={[
										{ label: 'Experience' },
										{ label: 'Resume' },
									]}
									tabContents={[
										<div
											key="Experience"
											className="mb-10 mt-5 flex flex-col justify-between gap-6 pl-1"
										>
											{jobExperience
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
																<div className="flex gap-2">
																	<RText
																		fontSize="b1"
																		fontWeight="medium"
																		color="secondary"
																	>
																		{
																			experience.company
																		}
																	</RText>
																	<RText
																		fontWeight="light"
																		color="tertiary"
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
											{jobExperience.length >
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
										<div key="resume"></div>,
									]}
								/>
							)}
					</div>
				</div>
			</div>
			<div className="flex h-screen w-full flex-col items-center overflow-y-auto p-[104px]">
				{children}
			</div>
		</div>
	);
};

export const LinkPageLayout = ({ ...props }: LinkPageLayoutProps) => {
	const isMobile = useMediaQuery({
		query: '(max-width: 640px)',
	});

	return isMobile ? (
		<LinkPageMobile {...props} />
	) : (
		<LinkPageDesktop {...props} />
	);
};
