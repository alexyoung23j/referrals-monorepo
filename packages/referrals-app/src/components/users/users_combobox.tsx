'use client';

import { useState } from 'react';
import { api } from '~/utils/api';
import { RText } from '../ui/text';
import { type User } from '@prisma/client';

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
 
export function UsersCombobox() {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState('');
	const { data: users = [] } = api.profiles.getUserList.useQuery();
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
 
	const onUserSelect = (user: User) => {
		const tempArray = [...selectedUsers];
		if (tempArray.some(selectedUser => selectedUser.id === user.id)) {
			setSelectedUsers([...tempArray.filter(selectedUser => selectedUser.id !== user.id)]);
		} else {setSelectedUsers([...tempArray, user]);}
		setValue('');
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					<RText className="overflow-hidden whitespace-nowrap">
							Search users..
					</RText>
					<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-fit p-0">
				<Command>
					<CommandInput placeholder="Search framework..." className="h-9" />
					<CommandEmpty>No framework found.</CommandEmpty>
					<CommandGroup>
						{users.map((user, index) => (
							<CommandItem
								key={`${user.id}_${index}`}
								value={user.name ?? ''}
								onSelect={(currentValue) => {
									setValue(currentValue === value ? '' : currentValue);
									onUserSelect(user);
								}}
							>
								<RText>{user.name}</RText>
								<RText className='ml-1' fontWeight='light'>{user.email}</RText>
								<CheckIcon
									className={cn(
										'ml-1 h-4 w-4',
										selectedUsers.some(selectedUser => selectedUser.id === user.id) ? 'opacity-100' : 'opacity-0'
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