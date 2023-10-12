import { RButton } from '../ui/button';
import { RText } from '../ui/text';
import ActivityModal from '../modals/activity_modal';

interface ConfirmationModalProps {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	headerText: string;
	content: React.ReactNode | string;
	onCancel: () => void;
	onConfirm: () => Promise<void> | void;
	destructive?: boolean;
	confirmButtonText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	open,
	onOpenChange,
	headerText,
	content,
	onCancel,
	onConfirm,
	destructive = true,
	confirmButtonText = 'Confirm',
}) => {
	return (
		<ActivityModal
			open={open}
			onOpenChange={onOpenChange}
			headerText={headerText}
			sections={[
				{
					type: 'single-column',
					content: [
						typeof content === 'string' ? (
							<RText>{content}</RText>
						) : (
							content
						),
					],
				},
			]}
			bottomRowContent={
				<div className="flex gap-4">
					<RButton
						iconName="x"
						onClick={onCancel}
						variant="secondary"
					>
						Cancel
					</RButton>
					<RButton
						iconName="check"
						onClick={onConfirm}
						variant={destructive ? 'destructive' : 'default'}
					>
						{confirmButtonText}
					</RButton>
				</div>
			}
		/>
	);
};
