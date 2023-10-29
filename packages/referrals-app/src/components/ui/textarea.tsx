/* eslint-disable indent */
import * as React from 'react';
import { Label } from './label';

import { cn } from 'src/lib/utils';
import { useEffect, useRef, useState } from 'react';
import Icon from './icons';
import type dynamicIconImports from 'lucide-react/dynamicIconImports';
import { useToast } from './use-toast';

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
	onDebounceFn?: () => void;
}

export const RTextarea = ({
	copyEnabled,
	highlighted,
	onDebounceFn,
	...props
}: RTextareaProps) => {
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [icon, setIcon] = useState('copy');
	const [debounceIcon, setDebounceIcon] = useState<
		NodeJS.Timeout | undefined
	>(undefined);
	const { toast } = useToast();

	const handleIconClick = async () => {
		if (inputRef.current) {
			if (navigator.share) {
				try {
					await navigator.share({
						text: inputRef.current.value,
					});
					console.log('Successful share');
				} catch (error) {
					console.log('Error sharing:', error);
				}
			} else {
				navigator.clipboard.writeText(inputRef.current.value);
				setIcon('check');
				if (debounceIcon) {
					clearTimeout(debounceIcon);
				}
				setDebounceIcon(setTimeout(() => setIcon('copy'), 1500));
				toast({
					title: 'Copied to clipboard',
					duration: 1500,
				});
			}
		}
	};

	const handleMouseEnter = () => {
		if (icon !== 'check') {
			setIcon('copy');
		}
	};

	const [typingTimeout, setTypingTimeout] = useState<
		NodeJS.Timeout | undefined
	>(undefined);

	useEffect(() => {
		return () => {
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
		};
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}

		setTypingTimeout(
			setTimeout(() => {
				if (onDebounceFn) {
					onDebounceFn();
				}
			}, 500)
		);

		if (props.onChange) {
			props.onChange(e);
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
				onChange={handleInputChange}
			/>
			{copyEnabled && (
				<Icon
					name={icon as keyof typeof dynamicIconImports}
					size="14px"
					className="absolute right-3 top-3 cursor-pointer"
					onClick={handleIconClick}
					onMouseEnter={handleMouseEnter}
				/>
			)}
		</div>
	);
};

export { Textarea };
