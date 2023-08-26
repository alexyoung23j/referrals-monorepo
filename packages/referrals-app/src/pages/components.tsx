import { type NextPage } from 'next';
import { Button, RButton } from '~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { Separator } from '~/components/ui/separator';
import {Label} from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { Input, RInput } from '~/components/ui/input';
import { RTextarea } from '~/components/ui/textarea';

const ComponentsPage: NextPage = () => {
	return (
		<div className='flex flex-col gap-3 p-5'>
			<div className='bora'>
				<div className='flex flex-col gap-3'>
					<Label className='text-2xl'>Switch</Label>
					<Switch onCheckedChange={value => console.log('Checked: ', value)} />
				</div>
				<Separator className='mb-5 mt-5' />
				<div className='flex flex-col gap-3'>
					<Label className='text-2xl'>Inputs</Label>
					<RInput placeholder='Placeholder' />
					<RInput value='Read Only' readOnly />
					<RInput value='Disabled' disabled />
					<RInput copyEnabled label='Label and Icon' placeholder='Enter your blurb' />
				</div>
				<Separator className='mb-5 mt-5' />
				<div className='flex flex-col gap-3'>
					<Label className='text-2xl'>Text Area</Label>
					<RTextarea placeholder='Placeholder' />
					<RTextarea value='Read Only' readOnly />
					<RTextarea value='Disabled' disabled />
					<RTextarea copyEnabled label='Label and Icon' placeholder='Enter your blurb' />
				</div>
				<Separator className='mb-5 mt-5' />
				<div className="mb-15">
					<Label className='text-2xl'>Avatar</Label>
					<Avatar>
						<AvatarImage src="https://github.com/shadcn.png" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
				</div>
				<Separator className='mb-5 mt-5' />
			</div>
			<div className='flex flex-col'>
				<Label className='mb-5 mt-2 text-2xl'>Buttons</Label>
				<RButton
					onClick={() => {
						console.log('yo');
					}}
					className='max-w-fit'
				>
					Click Me
				</RButton>
			</div>
			<Separator className='mb-5 mt-5' />
			<div>Text what font am i</div>
		</div>
	);
};

export default ComponentsPage;
