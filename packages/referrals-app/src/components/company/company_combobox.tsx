'use client';

import {useState} from 'react';
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
import { api } from '~/utils/api';
import { RInput } from '../ui/input';
import { Label } from '../ui/label';
import Image from 'next/image';

type Company = {
	name: string;
	domain: string;
	logo: string;
}

// Maybe use this?
export function CompanyCombobox() {
	const [open, setOpen] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
	const [value, setValue] = useState('');
	const {data: companies = []} = api.company.getCompanyList.useQuery({keyword: value});

	const onCompanySelect = (company: Company) => {
		setSelectedCompany(company);
		setOpen(false);
	};

	const onValueChange = (value: string) => {
		console.log('DEBOUNCED', value);
		setValue(value);
	};
	const debounceOnChange = debounce(onValueChange, 300);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{selectedCompany
						? (
							<div className="flex items-center space-x-2 my-3 mx-1">
								 <Image src={selectedCompany.logo} alt={`Logo for ${selectedCompany.name}`} height={20} width={20} />
								 <Label>{selectedCompany.name}</Label>
							</div>
						)
						: 'Select company...'}
					<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0 h-fit">
				{/* <Command>
					<CommandInput
						placeholder="Search companies..."
						className="h-9"
						onValueChange={debounce(setValue, 500)}
					/>
					<CommandEmpty>No company found.</CommandEmpty>
					<CommandGroup>
						{companies.map((element: Company) => (
							<CommandItem
								key={element.domain}
								onSelect={(currentValue) => {
									console.log('Current', currentValue);
									setValue(
										currentValue === value
											? ''
											: currentValue
									);
									setOpen(false);
								}}
							>
								{element.name}
								<CheckIcon
									className={cn(
										'ml-auto h-4 w-4',
										value === element.domain
											? 'opacity-100'
											: 'opacity-0'
									)}
								/>
							</CommandItem>
						))}
					</CommandGroup>
				</Command> */}
				<RInput
					placeholder='Search companies...'
					className='h-9'
					onChange={e => {
						console.log('E', e.target.value);
						debounceOnChange(e.target.value);
					}}
				/>
				{companies.map((company: Company, index: number) => (
					<div key={`${company.domain}_${index}`} className="flex items-center space-x-2 my-5 mx-3" onClick={() => onCompanySelect(company)}>
						{company.logo ? <Image src={company.logo} alt={`Logo for ${company.name}`} height={30} width={30} /> : null}
						<Label>{company.name}</Label>
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
			</PopoverContent>
		</Popover>
	);
}
