import * as React from 'react';
import {Label} from './label';

import { cn } from 'src/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Textarea.displayName = 'Textarea';

interface RTextareaProps extends TextareaProps {
	label?: string
	copyEnabled?: boolean
}

export const RTextarea = ({label, copyEnabled, ...props}: RTextareaProps) => {
	return (
		<div>
			{label && <Label>{label}</Label>}
			<Textarea {...props} />
		</div>

	);
};

export { Textarea };
