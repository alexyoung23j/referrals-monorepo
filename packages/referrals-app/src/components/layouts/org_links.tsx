/* eslint-disable indent */
import { useMediaQuery } from 'react-responsive';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Icon, { ReferLinkLogo } from '../ui/icons';
import { RText } from '../ui/text';
import { RTabsSection } from '../ui/tabs';
import { RLogo } from '../ui/logo';
import { useEffect, useState } from 'react';
import { Separator } from '~/components/ui/separator';
import { Toaster } from '../ui/toaster';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

type OrgPageLayoutProps = {
	avatarUrl?: string;
	orgName: string;
	orgDescription?: string;
	linkedInUrl?: string;
	websiteUrl?: string;
	children?: React.ReactNode;
	showInfoModal: boolean;
	setShowInfoModal: (open: boolean) => void;
};

const OrgPageMobile = ({
	avatarUrl,
	orgName,
	orgDescription,
	linkedInUrl,
	websiteUrl,
	children,
	setShowInfoModal,
}: OrgPageLayoutProps) => {
	const [showMembers, setShowMembers] = useState(true);
	const router = useRouter();

	return (
		<div className="bg-background flex h-screen flex-col">
			<div className="bg-profileBackgroundGrey flex flex-col items-center gap-[12px] p-[24px]">
				<div className="absolute left-[-1.25rem] top-5 flex w-fit justify-start">
					<div
						className={'flex cursor-pointer items-center gap-2'}
						onClick={() => {
							router.push('/');
						}}
					>
						<ReferLinkLogo size={14} />
					</div>
				</div>

				<div className="flex flex-col items-center gap-[8px]">
					<Avatar className="h-[56px] w-[56px]">
						<AvatarImage
							src={avatarUrl}
							style={{
								objectFit: 'cover',
								objectPosition: 'top',
							}}
						/>
						<AvatarFallback>{orgName[0] as string}</AvatarFallback>
					</Avatar>
					<RText fontSize="h1" fontWeight="medium">
						{orgName}
					</RText>
				</div>

				<RTabsSection
					tabs={[{ label: 'Members' }, { label: 'About' }]}
					onTabsChange={(tab) => {
						if (tab === 'Members') {
							setShowMembers(true);
						} else {
							setShowMembers(false);
						}
					}}
				/>
			</div>
			<Toaster />
			{showMembers ? (
				<div className="scrollbar flex h-full flex-col items-center">
					{children}
				</div>
			) : (
				<div className="scrollbar flex h-full flex-col items-center overflow-auto p-5">
					<div className="mt-2 flex w-full max-w-[360px] flex-col gap-6">
						<div className="flex flex-col gap-3 px-[24px]">
							{orgDescription && (
								<RText color="secondary" fontWeight="medium">
									{orgDescription}
								</RText>
							)}
						</div>

						<Separator />

						<div
							className="bg-background fixed bottom-[0px] left-[0px] flex w-full justify-center gap-8 pb-[16px] pt-[32px]"
							style={{
								background:
									'linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(255,255,255,1) 40%)',
							}}
						>
							{websiteUrl && (
								<Icon
									name="link"
									size="24px"
									color="#64748b"
									className="cursor-pointer"
									onClick={() => {
										window.open(websiteUrl, '_blank');
									}}
								/>
							)}
							{linkedInUrl && (
								<Icon
									name="linkedin"
									size="24px"
									color="#64748b"
									className="cursor-pointer"
									onClick={() => {
										window.open(linkedInUrl, '_blank');
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

const OrgPageDesktop = ({
	avatarUrl,
	orgName,
	orgDescription,
	linkedInUrl,
	websiteUrl,
	children,
	setShowInfoModal,
}: OrgPageLayoutProps) => {
	const { data: sessionData } = useSession();
	const router = useRouter();

	return (
		<div className="bg-background flex h-screen">
			<div className="bg-profileBackgroundGrey scrollbar scrollbar-thumb-transparent scrollbar-track-transparent flex min-w-[35vw] max-w-[496px] justify-center overflow-auto">
				{sessionData?.user ? (
					<div
						className="fixed left-6 mt-6"
						onClick={() => {
							router.push('/dashboard');
						}}
					>
						<RText
							color="secondary"
							className="cursor-pointer hover:underline"
							fontWeight="medium"
						>
							← Dashboard
						</RText>
					</div>
				) : (
					<div
						className="fixed ml-6 mt-6 h-fit cursor-pointer"
						onClick={() => {
							router.push('/');
						}}
					>
						<ReferLinkLogo size={18} />
					</div>
				)}
				<div className="flex flex-col gap-[20px] pt-[20vh]">
					<Avatar className="h-[180px] w-[180px]">
						<AvatarImage
							src={avatarUrl}
							style={{
								objectFit: 'cover',
								objectPosition: 'top',
							}}
						/>
						<AvatarFallback>{orgName[0]}</AvatarFallback>
					</Avatar>
					<RText fontSize="h2" fontWeight="medium">
						{orgName}
					</RText>
					<RText
						color="secondary"
						fontWeight="normal"
						className="max-w-[20vw]"
					>
						{orgDescription}
					</RText>
					<div className="flex flex-col gap-3">
						{websiteUrl && (
							<div
								className="flex cursor-pointer items-center gap-3"
								onClick={() => {
									window.open(websiteUrl, '_blank');
								}}
							>
								<Icon name="link" size="20px" color="#64748b" />
								<RText color="secondary" fontWeight="medium">
									Website
								</RText>
							</div>
						)}
						{linkedInUrl && (
							<div
								className="flex cursor-pointer items-center gap-3"
								onClick={() => {
									window.open(linkedInUrl, '_blank');
								}}
							>
								<Icon
									name="linkedin"
									size="20px"
									color="#64748b"
								/>
								<RText color="secondary" fontWeight="medium">
									LinkedIn
								</RText>
							</div>
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

const OrgPageLayout = ({ ...props }: OrgPageLayoutProps) => {
	const [isClient, setIsClient] = useState(false);

	// This effect will run after the component has mounted, setting isClient to true
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Call useMediaQuery unconditionally at the top level of your component
	const isMobileQuery = useMediaQuery({
		query: '(max-width: 840px)',
	});

	// Use the result of useMediaQuery inside your if statement
	const isMobile = isClient && isMobileQuery;

	// We only render the component if we're on the client
	return isClient ? (
		isMobile ? (
			<OrgPageMobile {...props} />
		) : (
			<OrgPageDesktop {...props} />
		)
	) : null;
};

export default OrgPageLayout;
