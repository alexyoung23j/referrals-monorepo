import { type NextPage } from 'next';
import { Button, RButton } from '~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';

const ComponentsPage: NextPage = () => {
	return (
		<div>
			<div className="mb-5">
				<RButton
					onClick={() => {
						console.log('yo');
					}}
				>
					Click Me
				</RButton>
			</div>
			<div className="mb-15">
				<Avatar>
					<AvatarImage src="https://github.com/shadcn.png" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
			</div>
			<div>Text what font am i</div>
		</div>
	);
};

export default ComponentsPage;
