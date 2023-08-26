type RCardProps = {
	elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
	children: React.ReactNode;
	className?: string;
};

export const RCard = ({
	elevation = 'none',
	children,
	...props
}: RCardProps) => {
	return (
		<div
			className={`border-border max-w-fit rounded-[6px] border p-4 shadow-${elevation}`}
			{...props}
		>
			{children}
		</div>
	);
};

type RCardRowProps = {
	columns: Array<{ content: React.ReactNode; minWidth?: number }>;
};

export const RRowCard = ({}) => {};
