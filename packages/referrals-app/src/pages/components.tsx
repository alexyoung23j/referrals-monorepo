import { type NextPage } from 'next';
import { Button, RButton } from '~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { Separator } from '~/components/ui/separator';
import {Label} from '~/components/ui/label';

const ComponentsPage: NextPage = () => {
	return (
		<div>
			<div className=''>
				<Label className='mb-5 mt-2'>Buttons</Label>
				<RButton
					onClick={() => {
						console.log('yo');
					}}
					className=''
				>
					Click Me
				</RButton>
			</div>
			<Separator className='mb-5 mt-5' />
			<div className="mb-15">
				<Avatar>
					<AvatarImage src="https://github.com/shadcn.png" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
			</div>
			<Separator className='mb-5 mt-5' />
			<div>Text what font am i</div>
		</div>
	);
};

export default ComponentsPage;
