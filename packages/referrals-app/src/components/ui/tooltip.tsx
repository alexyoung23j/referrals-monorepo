'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from 'src/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
	React.ElementRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
	<TooltipPrimitive.Content
		ref={ref}
		sideOffset={sideOffset}
		className={cn(
			'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md',
			className
		)}
		{...props}
	/>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

type RTooltipProps = {
	trigger: React.ReactNode;
	content: React.ReactNode;
	align?: 'start' | 'center' | 'end';
	side?: 'top' | 'bottom' | 'left' | 'right';
	className?: string;
	delayDuration?: number;
};

export const RTooltip = ({
	trigger,
	content,
	align,
	className,
	side = 'top',
	delayDuration = 200,
}: RTooltipProps) => {
	return (
		<TooltipProvider delayDuration={delayDuration}>
			<Tooltip>
				<TooltipTrigger>{trigger}</TooltipTrigger>
				<TooltipContent side={side} align={align} className={className}>
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
