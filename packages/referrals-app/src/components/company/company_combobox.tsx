'use client';

import { useState } from 'react';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import debounce from 'lodash/debounce';

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
import { trpc } from '~/utils/api';
import { RInput } from '../ui/input';
import { Label } from '../ui/label';
import Image from 'next/image';
import { RText } from '../ui/text';

export type Company = {
	name: string;
	domain: string;
	logo: string;
};

type CompanyComboboxProps = {
	onSelectCompany?: (company: Company) => void;
	onCreateCompany?: (company: Company) => void;
	initialCompany?: Company;
};

// Maybe use this?
export function CompanyCombobox({
	onCreateCompany,
	onSelectCompany,
	initialCompany,
}: CompanyComboboxProps) {
	const [open, setOpen] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(
		initialCompany ?? null
	);
	const [value, setValue] = useState('');
	const { data: companies = [] } = trpc.company.getCompanyList.useQuery({
		keyword: value,
	});

	const onCompanySelect = (company: Company) => {
		setSelectedCompany(company);
		setOpen(false);
		if (onSelectCompany) {
			onSelectCompany(company);
		}
		setValue('');
	};

	const onValueChange = (value: string) => {
		setValue(value);
	};

	const onCompanyCreate = (companyName: string) => {
		setOpen(false);
		if (onCreateCompany) {
			onCreateCompany({
				name: companyName,
				domain: '',
				logo: 'https://wtshcihzoimxpnrbnnau.supabase.co/storage/v1/object/public/avatar_images/default_logo.png',
			});
		}
		setSelectedCompany({
			name: companyName,
			domain: '',
			logo: 'https://wtshcihzoimxpnrbnnau.supabase.co/storage/v1/object/public/avatar_images/default_logo.png',
		});
		setValue('');
	};

	const debounceOnChange = debounce(onValueChange, 300);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild className="w-full">
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="h-10 w-full justify-between"
				>
					{selectedCompany ? (
						<div className="mx-1 my-3 flex items-center space-x-2">
							<Image
								src={selectedCompany.logo}
								alt={`Logo for ${selectedCompany.name}`}
								height={20}
								width={20}
							/>
							<RText className="overflow-hidden whitespace-nowrap">
								{selectedCompany.name}
							</RText>
						</div>
					) : (
						<RText className="overflow-hidden whitespace-nowrap">
							Search companies..
						</RText>
					)}
					<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="h-fit max-w-[280px] p-0">
				<Command>
					<CommandInput
						placeholder="Type to search"
						className="h-9"
						onValueChange={(value) => {
							debounceOnChange(value);
						}}
					/>
				</Command>
				{value.length > 0 &&
					companies.map((company: Company, index: number) => (
						<div
							key={`${company.domain}_${index}`}
							className="flex cursor-pointer items-center space-x-2 p-2 hover:bg-gray-100"
							onClick={() => onCompanySelect(company)}
						>
							{company.logo ? (
								<Image
									src={company.logo}
									alt={`Logo for ${company.name}`}
									height={30}
									width={30}
								/>
							) : null}
							<RText>{company.name}</RText>
							<CheckIcon
								className={cn(
									'ml-auto h-4 w-4',
									selectedCompany?.name === company.name
										? 'opacity-100'
										: 'opacity-0'
								)}
							/>
						</div>
					))}
				{value.length > 0 && companies.length === 0 && (
					<div
						className="flex cursor-pointer justify-center p-3 text-center hover:bg-gray-100"
						onClick={() => {
							onCompanyCreate(value);
						}}
					>
						<RText>Create {value}</RText>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
