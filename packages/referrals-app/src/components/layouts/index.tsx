import Icon, { ReferLinkLogo } from '../ui/icons';
import { useRouter } from 'next/router';
import { RTooltip } from '../ui/tooltip';
import { RText } from '../ui/text';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Separator } from '../ui/separator';
import { Toaster } from '../ui/toaster';
import { isMobile } from 'react-device-detect';
import Head from 'next/head';

const Sidebar = () => {
	const router = useRouter();

	const dashboardSelected = router.pathname === '/dashboard';
	const profileSelected = router.pathname === '/profile';
	return (
		<div className="border-border flex h-full min-w-[72px] max-w-[72px] flex-col items-center justify-between border-r-[1px] pb-[24px] pt-[32px]">
			<div className="flex flex-col items-center">
				<RTooltip
					delayDuration={400}
					trigger={
						<div
							className={`flex flex-col ${
								dashboardSelected
									? 'bg-grey'
									: 'hover:bg-lightGrey'
							}  max-h-fit max-w-fit cursor-pointer rounded-[6px] p-[8px]`}
							onClick={() => {
								router.push('/dashboard');
							}}
						>
							<Icon
								name="layers"
								color={
									dashboardSelected ? '#64748B' : '#94A3B8'
								}
								size="24px"
							/>
						</div>
					}
					content={
						<div>
							<RText fontSize="b2">Dashboard</RText>
						</div>
					}
					align="start"
					side="right"
				/>

				<RTooltip
					delayDuration={400}
					trigger={
						<div
							className={`flex flex-col ${
								profileSelected
									? 'bg-grey'
									: 'hover:bg-lightGrey'
							} max-h-fit max-w-fit cursor-pointer rounded-[6px] p-[8px]`}
							onClick={() => {
								router.push('/profile');
							}}
						>
							<Icon
								name="user"
								color={profileSelected ? '#64748B' : '#94A3B8'}
								size="24px"
							/>
						</div>
					}
					content={
						<div>
							<RText fontSize="b2">Profile</RText>
						</div>
					}
					align="start"
					side="right"
				/>
				<RTooltip
					trigger={
						<div
							className={
								'hover:bg-lightGrey flex max-h-fit max-w-fit cursor-not-allowed cursor-pointer flex-col rounded-[6px] p-[8px]'
							}
						>
							<Icon name="bell" color={'#94A3B8'} size="24px" />
						</div>
					}
					content={
						<div>
							<RText fontSize="b2">
								Notifications Coming Soon!
							</RText>
						</div>
					}
					align="start"
					side="right"
				/>
			</div>
			<div>
				<div
					className={
						'hover:bg-lightGrey flex max-h-fit max-w-fit cursor-pointer flex-col rounded-[6px] p-[8px]'
					}
					onClick={() => {
						void signOut();
					}}
				>
					<Icon name="log-out" color={'#94A3B8'} size="24px" />
				</div>
			</div>
		</div>
	);
};

type PageLayoutProps = {
	children: React.ReactNode | undefined;
	showSidebar?: boolean;
	pageTitle: string;
	pageSubtitle?: string;
	topRightContent?: React.ReactNode;
};

export const PageLayout = ({
	children,
	showSidebar = true,
	pageTitle,
	pageSubtitle,
	topRightContent,
}: PageLayoutProps) => {
	return (
		<div className="bg-background flex h-screen">
			{showSidebar && <Sidebar />}
			<div className="flex h-screen w-full flex-col items-center overflow-y-auto px-[20px] lg:px-[0px]">
				<div className="mt-[48px] flex max-h-fit max-w-fit flex-col justify-center">
					<div className="flex flex-col gap-[16px]">
						<div className="flex w-[75vw] max-w-[1092px] items-center justify-between">
							<RText fontSize="h1" fontWeight="medium">
								{pageTitle}
							</RText>
							{topRightContent && topRightContent}
						</div>
						{pageSubtitle && (
							<RText fontWeight="medium" color="secondary">
								{pageSubtitle}
							</RText>
						)}
						<Separator className="mb-5 mt-5" />
					</div>
					{children}
					<Toaster />
				</div>
			</div>
		</div>
	);
};

export const MobileNotAllowed = () => {
	const router = useRouter();

	return (
		<div
			className="flex h-[100vh] w-full flex-col items-center justify-center"
			style={{
				background: 'linear-gradient(to bottom, #ffffff 25%, #E2F1FF)',
			}}
		>
			<Head>
				<title>ReferLink</title>
			</Head>
			<div
				className="absolute left-6 top-6 cursor-pointer"
				onClick={() => {
					router.push('/');
				}}
			>
				<ReferLinkLogo size={24} />
			</div>
			<div
				className="absolute right-7 top-7 cursor-pointer"
				onClick={() => {
					void signOut();
				}}
			>
				<Icon name="log-out" color={'#94A3B8'} size="18px" />
			</div>

			<div className="flex flex-col items-center justify-center gap-[24px] px-8">
				<RText
					fontSize="h2"
					fontWeight="medium"
					className="text-center"
				>
					Visit this page on desktop for the best user experience.
				</RText>
			</div>
		</div>
	);
};
