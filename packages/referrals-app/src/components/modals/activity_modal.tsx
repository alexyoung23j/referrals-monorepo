import { useMediaQuery } from 'react-responsive';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { RText } from '../ui/text';

type ActivityModalProps = {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	headerText?: string;
	headerRightContent?: React.ReactNode;
	subtitleText?: string;
	bottomRowContent?: React.ReactNode;
	sections?: Array<{
		type: 'single-column' | 'two-column';
		content: React.ReactNode[];
	}>;
};

export default function ActivityModal({
	open,
	onOpenChange,
	headerText,
	headerRightContent,
	subtitleText,
	bottomRowContent,
	sections,
}: ActivityModalProps) {
	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showClose={isMobile}
				className="flex max-h-[94vh] w-[90vw] max-w-[640px] flex-col gap-[0px] overflow-auto rounded-[8px] p-[18px] sm:p-[24px]"
			>
				{headerText && (
					<div className="flex w-full flex-col gap-[8px]">
						<div className="flex w-full flex-col items-start justify-between gap-1 sm:flex-row sm:items-center">
							<RText fontSize="h2" fontWeight="medium">
								{headerText}
							</RText>
							{headerRightContent && headerRightContent}
						</div>
						{subtitleText && (
							<RText color="tertiary">{subtitleText}</RText>
						)}
						<Separator />
					</div>
				)}
				<div className="mt-[32px] flex flex-col gap-[32px]">
					{sections?.map((section, index) => {
						if (section.type === 'single-column') {
							return (
								<div key={index} className="w-full">
									{section.content}
								</div>
							);
						} else if (section.type === 'two-column') {
							return (
								<div
									key={index}
									className="flex flex-col justify-between gap-[32px] sm:flex-row"
								>
									{section.content}
								</div>
							);
						}
					})}
				</div>
				{bottomRowContent && (
					<div className="mt-[32px] flex justify-center">
						{bottomRowContent}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
