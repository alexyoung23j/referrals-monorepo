import { type NextPage } from 'next';
import { Button, RButton } from '~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { RText } from '~/components/ui/text';

const ComponentsPage: NextPage = () => {
	return (
		<div className="flex-col gap-3 p-5">
			<RText fontSize="sm">H1 Text</RText>
			<div className="mb-5">
				{/* <RButton
					onClick={() => {
						console.log('yo');
					}}
				>
					Click Me
				</RButton> */}
			</div>
			<div className="mb-15">
				<Avatar>
					<AvatarImage src="https://github.com/shadcn.png" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
			</div>
		</div>
	);
};

export default ComponentsPage;
