import { RText } from './text';

type RTagProps = {
	color?: 'default' | 'green' | 'blue' | 'purple';
	label: string;
	leftContent?: React.ReactNode;
	rightContent?: React.ReactNode;
	onClick?: () => void;
};

const colorMap = {
	default: 'bg-lightGrey border-border',
	green: 'bg-green border-green-border',
	blue: 'bg-blue border-blue-border',
	purple: 'bg-purple border-purple-border',
};

export const RTag = ({
	color = 'default',
	label,
	leftContent,
	rightContent,
	onClick,
}: RTagProps) => {
	return (
		<div
			onClick={onClick}
			className={`${colorMap[color]} m-top-[5px] m-bottom-[5px] flex h-[24px] max-w-fit cursor-pointer flex-row items-center gap-[5px] rounded-[6px] border-[1px] px-2 `}
		>
			{leftContent && leftContent}
			<RText fontSize="b1" fontWeight="normal" color="secondary">
				{label}
			</RText>
			{rightContent && rightContent}
		</div>
	);
};
