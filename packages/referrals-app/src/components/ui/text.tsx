interface TextProps {
	fontSize?: 'xs' | 'sm' | 'lg' | 'base' | 'xl' | '2xl';
	color?: 'primary' | 'secondary' | 'tertiary';
	children: React.ReactNode;
}

export const RText = ({
	fontSize = 'sm',
	color = 'primary',
	children,
}: TextProps) => {
	return <span className={`text-${fontSize} text-${color}`}>{children}</span>;
};
