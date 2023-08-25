import { type NextPage } from 'next';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';

const ComponentsPage: NextPage = () => {
	return (
		<div>
			<div className='mb-5'>
				<Button>Click Me</Button>
			</div>
			<div className='mb-15'>
				<Avatar>
					<AvatarImage src="https://github.com/shadcn.png" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
			</div>
		</div>
	);
};


export default ComponentsPage;