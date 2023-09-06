import { RText } from './text';

interface LabeledSectionProps {
	label: string;
	subtitle?: string;
	rightContent?: React.ReactNode;
	body: React.ReactNode;
}

export const RLabeledSection = ({
	label,
	subtitle,
	rightContent,
	body,
}: LabeledSectionProps) => {
	return (
		<div className="labeled-section w-full">
			<div className="flex flex-col gap-[8px] text-lg font-bold">
				<div className="flex max-w-fit flex-row items-center gap-2">
					<RText fontSize="b1" fontWeight="medium">
						{label}
					</RText>
					{rightContent && rightContent}
				</div>
				{subtitle && (
					<RText fontSize="b2" fontWeight="normal" color="secondary">
						{subtitle}
					</RText>
				)}
			</div>
			<div className={subtitle ? 'mt-[16px]' : 'mt-[8px]'}>{body}</div>
		</div>
	);
};
