import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';
import Icon, { IconName } from './icons';

const buttonVariants = cva(
	'inline-flex items-center text-sm font-normal gap-[10px] justify-center rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-[34px] max-sm:h-[26px] px-4 py-2',
				sm: 'h-[26px] rounded-md px-3 text-[12px] leading-[12px] font-normal',
				md: 'h-[30px] max-sm:h-[26px] px-4 py-2 font-normal',
				lg: 'h-[40px] max-sm:h-[26px] px-4 py-2',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	iconName?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(
					buttonVariants({ variant, size, className }),
					'whitespace-nowrap'
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Button.displayName = 'Button';

interface RButtonProps extends ButtonProps {
	iconName?: IconName;
	onFileChange?: React.ChangeEventHandler<HTMLInputElement>; // renamed to onFileChange
	onClick?: React.MouseEventHandler<HTMLButtonElement>; // added
}

export const RButton = ({
	iconName,
	variant = 'default',
	children,
	onFileChange,
	onClick,
	...props
}: RButtonProps) => {
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (onFileChange) {
			onFileChange(e);
		}
	};

	const handleClick = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		if (onClick) {
			onClick(e);
		}
		if (onFileChange) {
			fileInputRef.current?.click();
		}
	};

	return (
		<>
			<Button
				variant={variant}
				{...props}
				className="max-w-fit"
				onClick={handleClick}
			>
				{iconName && (
					<Icon
						name={iconName}
						size={props.size === 'sm' ? '12px' : '14px'}
					/>
				)}
				{children}
			</Button>
			<input
				type="file"
				ref={fileInputRef}
				style={{ display: 'none' }}
				onChange={handleFileChange}
			/>
		</>
	);
};

export { Button, buttonVariants };
