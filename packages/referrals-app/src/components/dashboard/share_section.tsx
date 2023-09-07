import { useRouter } from 'next/router';
import { RInput } from '../ui/input';
import { RLabeledSection } from '../ui/labeled_section';
import { RText } from '../ui/text';
import { RTextarea } from '../ui/textarea';
import { RTabsSection } from '../ui/tabs';

const defaultEmailText = (link: string, name: string) => {
	return `Hey [[Contact name]],\n\nI'm currently on a job search and I was wondering if you or someone in your network would be able to refer me to any of the jobs listed here: ${link}. I would really appreciate it! \n\nThanks,\n${name}`;
};

const defaultDMText = (link: string, name: string) => {
	return `Hey [[Contact name]], I'm currently on a job search and I was wondering if you or someone in your network would be able to refer me to any of the jobs listed here: ${link}. I would really appreciate it, thanks!`;
};

export default function ShareSection({
	linkCode,
	userName,
}: {
	linkCode: string;
	userName: string;
}) {
	const router = useRouter();

	return (
		<div className="mb-[36px] flex w-full justify-between">
			<div className="flex flex-col gap-[24px]">
				<RLabeledSection
					label="Share"
					subtitle="Send all your requests to potential referrers from one simple link."
					body={
						<div className="flex items-center gap-3">
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
							/>
							<RText color="tertiary" fontSize="b2">
								Shareable link
							</RText>
						</div>
					}
					labelSize="h3"
				/>
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
			</div>
			<div>
				<RTabsSection
					tabs={[{ label: 'Email' }, { label: 'DM/Text' }]}
					tabLabel="Editable templates coming soon!"
					tabContents={[
						<div key="1" className="mt-[16px] w-[540px]">
							<RTextarea
								copyEnabled
								readOnly
								highlighted
								value={defaultEmailText(
									`${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${linkCode}`,
									userName
								)}
								className="h-[180px] text-[#334155]"
							/>
						</div>,
						<div key="2" className="mt-[16px] w-[540px]">
							<RTextarea
								copyEnabled
								readOnly
								highlighted
								value={defaultDMText(
									`${process.env.NEXT_PUBLIC_SERVER_URL_SHORT}/${linkCode}`,
									userName
								)}
								className="h-[80px] text-[#334155]"
							/>
						</div>,
					]}
				/>
			</div>
		</div>
	);
}
