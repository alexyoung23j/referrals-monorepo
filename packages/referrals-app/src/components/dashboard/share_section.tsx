import { useRouter } from 'next/router';
import { RInput } from '../ui/input';
import { RLabeledSection } from '../ui/labeled_section';
import { RText } from '../ui/text';
import { RTextarea } from '../ui/textarea';
import { RTabsSection } from '../ui/tabs';
import { useMediaQuery } from 'react-responsive';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';

const defaultEmailText = (link: string, name: string) => {
	return `Hey [[Contact name]],\n\nI'm currently on a job search and I was wondering if you or someone in your network would be able to refer me to any of the jobs listed here: https://${link}. I would really appreciate it! \n\nThanks,\n${name}`;
};

const defaultDMText = (link: string, name: string) => {
	return `Hey [[Contact name]], I'm currently on a job search and I was wondering if you or someone in your network would be able to refer me to any of the jobs listed here: https://${link}`;
};

export default function ShareSection({
	linkCode,
	userName,
}: {
	linkCode: string;
	userName: string;
}) {
	const router = useRouter();

	const isMobileScreen = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const [showShareOptions, setShowShareOptions] = useState(false);

	useEffect(() => {
		if (isMobile) {
			setShowShareOptions(false);
		} else {
			setShowShareOptions(true);
		}
	}, []);

	return (
		<div className="flex w-full flex-col justify-between gap-6 lg:flex-row">
			<div className="flex flex-col gap-[24px]">
				<RLabeledSection
					label="Share"
					subtitle="Send all your requests to potential referrers from one simple link."
					body={
						<div className="flex w-full items-center gap-3">
							<RInput
								value={`${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${linkCode}`}
								copyEnabled
								readOnly
								highlighted
								className="cursor-pointer underline"
								onClick={() => {
									window.open(
										`${process.env.NEXT_PUBLIC_SERVER_URL}/${linkCode}`
									);
								}}
								copyOnClick={isMobileScreen}
							/>
							<RText color="tertiary" fontSize="b2">
								{isMobileScreen ? '' : 'Shareable link'}
							</RText>
						</div>
					}
					labelSize="h3"
				/>
				{!isMobileScreen && (
					<RText color="tertiary" fontSize="b2" className="flex">
						*Add your default blurb in the
						<div
							onClick={() => {
								router.push('/profile');
							}}
							className="ml-1"
						>
							<RText
								color="tertiary"
								className="cursor-pointer underline"
								fontSize="b2"
							>
								Profile Page
							</RText>
						</div>
						.
					</RText>
				)}
			</div>
			{isMobileScreen && !showShareOptions && (
				<div>
					<RText
						color="tertiary"
						fontSize="b2"
						onClick={() => {
							setShowShareOptions(true);
						}}
					>
						+ See more options
					</RText>
				</div>
			)}
			{showShareOptions && (
				<div>
					<RTabsSection
						tabs={[{ label: 'Email' }, { label: 'DM/Text' }]}
						tabLabel={
							isMobileScreen
								? ''
								: 'Editable templates coming soon!'
						}
						tabContents={[
							<div
								key="1"
								className={`mt-[16px] ${
									isMobileScreen ? 'w-[85vw]' : 'w-[540px]'
								} `}
							>
								<RTextarea
									copyEnabled
									readOnly
									highlighted
									value={defaultEmailText(
										`${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${linkCode}`,
										userName
									)}
									className={`${
										isMobileScreen
											? 'h-[300px]'
											: 'h-[180px]'
									}  text-[#334155]`}
								/>
							</div>,
							<div
								key="2"
								className={`mt-[16px] ${
									isMobileScreen ? 'w-[85vw]' : 'w-[540px]'
								} `}
							>
								<RTextarea
									copyEnabled
									readOnly
									highlighted
									value={defaultDMText(
										`${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${linkCode}`,
										userName
									)}
									className={`${
										isMobileScreen
											? 'h-[300px]'
											: 'h-[180px]'
									}  text-[#334155]`}
								/>
							</div>,
						]}
					/>
				</div>
			)}
		</div>
	);
}
