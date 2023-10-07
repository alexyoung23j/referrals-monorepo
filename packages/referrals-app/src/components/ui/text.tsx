interface TextProps {
	fontSize?: 'h1' | 'h2' | 'h3' | 'b1' | 'b2' | 'h1point5';
	color?: 'primary' | 'midprimary' | 'secondary' | 'tertiary' | 'red';
	fontWeight?: 'bold' | 'normal' | 'medium' | 'light';
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
}

const fontSizeMap = {
	h1: 'text-[24px]',
	h1point5: 'text-[20px]',
	h2: 'text-[18px]',
	h3: 'text-[16px]',
	b1: 'text-[14px] leading-[18px]',
	b2: 'text-[12px] leading-[16px]',
};

const fontColorMap = {
	primary: 'text-textPrimary',
	midprimary: 'text-[#334155]',
	secondary: 'text-textSecondary',
	tertiary: 'text-textTertiary',
	red: 'text-textRed',
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
	onClick,
	className,
}: TextProps) => {
	return (
		<span
			className={`${fontSizeMap[fontSize]} ${fontColorMap[color]} ${fontWeightMap[fontWeight]} ${className}`}
			onClick={onClick}
		>
			{children}
		</span>
	);
};
