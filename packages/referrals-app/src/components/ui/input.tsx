/* eslint-disable indent */
import * as React from 'react';

import { cn } from 'src/lib/utils';
import { Label } from './label';
import Icon from './icons';
import { useEffect, useRef, useState } from 'react';
import * as z from 'zod';

import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { RText } from './text';
import { useDebouncedCallback } from 'use-debounce';
import { ZodSchema } from 'zod';

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
	validationSchema?: ZodSchema;
	isRequired?: boolean;
	onErrorFound?: () => void;
	onErrorFixed?: () => void;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RInput = ({
	copyEnabled,
	highlighted,
	isRequired,
	validationSchema,
	onChange,
	...props
}: RInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [icon, setIcon] = useState('copy');
	const [debounceIcon, setDebounceIcon] = useState<
		NodeJS.Timeout | undefined
	>(undefined);
	const [currentValueLocal, setCurrentValueLocal] = useState(
		props.value ?? ''
	);

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

	useEffect(() => {
		if (props.value !== currentValueLocal) {
			setCurrentValueLocal(props.value ?? '');
		}
	}, [props.value, currentValueLocal]);

	const [error, setError] = useState<string | null>(null);

	const validateInput = useDebouncedCallback((value: string) => {
		if (validationSchema && value.length > 0) {
			try {
				validationSchema.parse(value);
				setError(null);
				if (props.onErrorFixed) {
					props.onErrorFixed();
				}
			} catch (e) {
				if (e instanceof z.ZodError) {
					setError(e.errors[0]?.message as string);
				}
				if (props.onErrorFound) {
					props.onErrorFound();
				}
			}
		} else {
			setError(null);
		}
	}, 500); // 500ms debounce

	const firstUpdate = useRef(true);

	useEffect(() => {
		if (firstUpdate.current) {
			firstUpdate.current = false;
			return;
		}

		validateInput(String(props.value ?? ''));
	}, [props.value, validateInput]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(event);
		}
	};

	return (
		<div className="relative flex flex-col">
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
				onChange={handleChange}
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
			{isRequired && (currentValueLocal as string).length < 1 && (
				<RText fontSize="b2" className="ml-[6px] mt-[12px]" color="red">
					This field is required*
				</RText>
			)}
			{error &&
				error.length > 0 &&
				!(isRequired && (currentValueLocal as string).length < 1) && (
					<RText
						fontSize="b2"
						className="ml-[6px] mt-[12px]"
						color="red"
					>
						{error}
					</RText>
				)}
		</div>
	);
};

export { Input };
