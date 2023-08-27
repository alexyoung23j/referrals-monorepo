interface TextProps {
	fontSize?: 'h1' | 'h2' | 'h3' | 'b1' | 'b2';
	color?: 'primary' | 'secondary' | 'tertiary';
	fontWeight?: 'bold' | 'normal' | 'medium' | 'light';
	children: React.ReactNode;
	className?: string;
}

const fontSizeMap = {
	h1: 'text-[24px]',
	h2: 'text-[18px]',
	h3: 'text-[16px]',
	b1: 'text-[14px] leading-[14px]',
	b2: 'text-[12px] leading-[12px]',
};

const fontColorMap = {
	primary: 'text-textPrimary',
	secondary: 'text-textSecondary',
	tertiary: 'text-textTertiary',
};

const fontWeightMap = {
	bold: 'font-bold',
	normal: 'font-normal',
	medium: 'font-medium',
	light: 'font-light',
};

export const RText = ({
	fontSize = 'b1',
	color = 'primary',
	children,
	fontWeight = 'normal',
	className,
}: TextProps) => {
	return (
		<span
			className={`${fontSizeMap[fontSize]} ${fontColorMap[color]} ${fontWeightMap[fontWeight]} ${className}`}
		>
			{children}
		</span>
	);
};
