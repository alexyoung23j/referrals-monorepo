import * as React from 'react';

import { cn } from 'src/lib/utils';
import { Label } from './label';
import Icon from './icons';
import { useRef, useState } from 'react';

import dynamicIconImports from 'lucide-react/dynamicIconImports';

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-border flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Input.displayName = 'Input';

interface RInputProps extends InputProps {
	copyEnabled?: boolean;
	highlighted?: boolean;
}

export const RInput = ({ copyEnabled, highlighted, ...props }: RInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [icon, setIcon] = useState('copy');
	const [debounceIcon, setDebounceIcon] = useState<
		NodeJS.Timeout | undefined
	>(undefined);

	const handleIconClick = () => {
		if (inputRef.current) {
			navigator.clipboard.writeText(inputRef.current.value);
			setIcon('check');
			if (debounceIcon) {
				clearTimeout(debounceIcon);
			}
			setDebounceIcon(setTimeout(() => setIcon('copy'), 1500));
		}
	};

	const handleMouseEnter = () => {
		if (icon !== 'check') {
			setIcon('copy');
		}
	};

	return (
		<div className="relative">
			<Input
				ref={inputRef}
				{...props}
				className={cn(
					{
						'bg-backgroundGrey': highlighted,
						'focus-visible:ring-0': props.readOnly,
						'pr-[32px]': copyEnabled,
					},
					props.className
				)}
			/>
			{copyEnabled && (
				<Icon
					name={icon as keyof typeof dynamicIconImports}
					size="14px"
					className="absolute right-3 top-[0.8rem] cursor-pointer"
					onClick={handleIconClick}
					onMouseEnter={handleMouseEnter}
				/>
			)}
		</div>
	);
};

export { Input };
