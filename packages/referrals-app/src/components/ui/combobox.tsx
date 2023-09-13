/* eslint-disable indent */
'use client';

import * as React from 'react';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';

import { cn } from 'src/lib/utils';
import { Button } from 'src/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from 'src/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from 'src/components/ui/popover';

const frameworks = [
	{
		value: 'next.js',
		label: 'Next.js',
	},
	{
		value: 'sveltekit',
		label: 'SvelteKit',
	},
	{
		value: 'nuxt.js',
		label: 'Nuxt.js',
	},
	{
		value: 'remix',
		label: 'Remix',
	},
	{
		value: 'astro',
		label: 'Astro',
	},
];

import { useEffect, useState } from 'react';
import axios from 'axios'; // or use any other library for making HTTP requests

interface ComboBoxProps {
	placeholder?: string;
	dataFetchFn: (
		value: string
	) => Promise<[{ value: React.ReactNode; label: string }]>;
}

export function Combobox({ placeholder, dataFetchFn }: ComboBoxProps) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState('');
	const [frameworks, setFrameworks] = useState<
		Array<{ value: React.ReactNode; label: string }>
	>([]);

	useEffect(() => {
		// This function will be called whenever `value` changes
		const fetchData = async () => {
			try {
				const response = await dataFetchFn(value);
				setFrameworks(response);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
	}, [value]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="h-10 w-[200px] justify-between"
				>
					{/* You can pass any JSX or React component here */}
					{value
						? frameworks.find(
								(framework) => framework.value === value
						  )?.label
						: 'Select framework...'}
					<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput
						placeholder={placeholder}
						className="h-10"
						value={value}
						onChange={(e) => setValue(e.target.value)}
					/>
					<CommandEmpty>No framework found.</CommandEmpty>
					<CommandGroup>
						{frameworks.map((framework) => (
							<CommandItem
								key={framework.value?.toString()}
								onSelect={(currentValue) => {
									setValue(
										currentValue === value
											? ''
											: currentValue
									);
									setOpen(false);
								}}
							>
								{framework.label}
								<CheckIcon
									className={cn(
										'ml-auto h-4 w-4',
										value === framework.value
											? 'opacity-100'
											: 'opacity-0'
									)}
								/>
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
