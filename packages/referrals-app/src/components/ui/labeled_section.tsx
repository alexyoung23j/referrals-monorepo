import Icon from './icons';
import { RPopover } from './popover';
import { RText } from './text';

interface LabeledSectionProps {
	label: string;
	labelSize?: 'h1' | 'h2' | 'h3' | 'b1' | 'b2';
	subtitle?: string;
	rightContent?: React.ReactNode;
	body: React.ReactNode;
	showInfo?: boolean;
	infoContent?: React.ReactNode;
}

export const RLabeledSection = ({
	label,
	labelSize = 'b1',
	subtitle,
	rightContent,
	body,
	showInfo = false,
	infoContent,
}: LabeledSectionProps) => {
	return (
		<div className="labeled-section w-full">
			<div className="flex flex-col gap-[8px] text-lg font-bold">
				<div className="flex w-full flex-row items-center justify-between gap-2">
					{!showInfo ? (
						<RText fontSize={labelSize} fontWeight="medium">
							{label}
						</RText>
					) : (
						<RPopover
							trigger={
								<div className="flex items-center gap-2">
									<RText
										fontSize={labelSize}
										fontWeight="medium"
									>
										{label}
									</RText>
									<Icon
										name="info"
										size="14px"
										color="#0f172a"
									/>
								</div>
							}
							content={infoContent}
						/>
					)}
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
