import { type NextPage } from 'next';
import { Button, RButton } from '~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { RText } from '~/components/ui/text';

const ComponentsPage: NextPage = () => {
	return (
		<div className="flex flex-col gap-3 p-5">
			<div className="alex">
				<div className="flex flex-col gap-3">
					<RText fontSize="h1">H1 Text</RText>
					<RText fontSize="h2">H2 Text</RText>
					<RText fontSize="h3">H3 Text</RText>

					<RText fontSize="b1">B1 Text</RText>
					<RText fontSize="b2">B2 Text</RText>

					<RText color="primary">Primary Text</RText>
					<RText color="secondary">Secondary Text</RText>
					<RText color="tertiary">Tertiary Text</RText>

					<RText fontWeight="bold">Bold Text</RText>
					<RText fontWeight="normal">Normal Text</RText>
				</div>

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
			<div className="bora"></div>
		</div>
	);
};

export default ComponentsPage;
