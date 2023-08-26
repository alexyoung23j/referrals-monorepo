import * as React from 'react';
import { Label } from './label';

import { cn } from 'src/lib/utils';
import { useRef, useState } from 'react';
import Icon from './icons';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-border flex min-h-[80px] w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Textarea.displayName = 'Textarea';

interface RTextareaProps extends TextareaProps {
	copyEnabled?: boolean;
	highlighted?: boolean;
}

export const RTextarea = ({
	copyEnabled,
	highlighted,
	...props
}: RTextareaProps) => {
	const inputRef = useRef<HTMLTextAreaElement>(null);
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
			<Textarea
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

export { Textarea };
