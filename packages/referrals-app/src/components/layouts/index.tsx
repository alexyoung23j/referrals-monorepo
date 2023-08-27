import Icon from '../ui/icons';
import { useRouter } from 'next/router';
import { RTooltip } from '../ui/tooltip';
import { RText } from '../ui/text';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Separator } from '../ui/separator';

const SidebarMap = {
	selected: 'bg-backgroundGrey',
};

const Sidebar = () => {
	const router = useRouter();

	const dashboardSelected = router.pathname === '/dashboard';
	const profileSelected = router.pathname === '/profile';
	return (
		<div className="border-border flex h-full min-w-[72px] max-w-[72px] flex-col items-center justify-between border-r-[1px] pb-[24px] pt-[32px]">
			<div>
				<div
					className={`flex flex-col ${
						dashboardSelected ? 'bg-grey' : 'hover:bg-lightGrey'
					}  max-h-fit max-w-fit cursor-pointer rounded-[6px] p-[12px]`}
					onClick={() => {
						router.push('/dashboard');
					}}
				>
					<Icon
						name="layers"
						color={dashboardSelected ? '#64748B' : '#94A3B8'}
						size="24px"
					/>
				</div>
				<div
					className={`flex flex-col ${
						profileSelected ? 'bg-grey' : 'hover:bg-lightGrey'
					} max-h-fit max-w-fit cursor-pointer rounded-[6px] p-[12px]`}
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
				<RTooltip
					trigger={
						<div
							className={`hover:bg-lightGrey flex max-h-fit max-w-fit cursor-pointer flex-col rounded-[6px] p-[12px]`}
						>
							<Icon name="bell" color={'#94A3B8'} size="24px" />
						</div>
					}
					content={
						<div>
							<RText fontSize="b2">Coming Soon!</RText>
						</div>
					}
					align="start"
					side="right"
				/>
			</div>
			<div>
				<div
					className={`hover:bg-lightGrey flex max-h-fit max-w-fit cursor-pointer flex-col rounded-[6px] p-[12px]`}
					onClick={() => {
						void signOut();
					}}
				>
					<Icon
						name="log-out"
						color={profileSelected ? '#64748B' : '#94A3B8'}
						size="24px"
					/>
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
			<div className="flex h-screen w-full flex-col items-center overflow-y-auto">
				<div className="mt-[48px] flex max-h-fit max-w-fit justify-center">
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
				</div>
			</div>
		</div>
	);
};
