import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';

type ActivityModalProps = {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	headerText?: string;
	headerRightContent?: React.ReactNode;
	subtitleText?: string;
	bottomRowContent?: React.ReactNode;
	sections?: Array<{
		type: 'single-column' | 'two-column';
		content: [React.ReactNode];
	}>;
};

export default function ActivityModal({
	open,
	onOpenChange,
	headerText,
	headerRightContent,
	subtitleText,
	bottomRowContent,
	sections,
}: ActivityModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure absolutely sure?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently
						delete your account and remove your data from our
						servers.
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
