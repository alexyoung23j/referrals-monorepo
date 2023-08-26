'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from 'src/lib/utils';
import Icon from './icons';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			'bg-backgroundGrey text-muted-foreground inline-flex h-9 items-center justify-center rounded-md p-1',
			className
		)}
		{...props}
	/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			'ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-primary inline-flex items-center justify-center gap-[6px] whitespace-nowrap rounded-[3px] px-3 py-[2px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm',
			className
		)}
		{...props}
	/>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
			className
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

type TabsSectionProps = {
	tabs: Array<{
		label: string;
		iconName?: keyof typeof dynamicIconImports;
		logoName?: string;
		onTabSelect?: (tab: string) => void;
	}>;
	tabContents?: Array<React.ReactNode>;
	onTabsChange?: (tab: string) => void;
};

export const RTabsSection = ({
	tabs,
	tabContents,
	onTabsChange,
}: TabsSectionProps) => {
	return (
		<Tabs defaultValue={tabs[0]?.label}>
			<TabsList>
				{tabs.map((tab, index) => (
					<TabsTrigger
						key={tab.label}
						value={tab.label}
						onClick={() => {
							if (tab.onTabSelect) {
								tab.onTabSelect(tab.label);
							}
							if (onTabsChange) {
								onTabsChange(tab.label);
							}
						}}
					>
						{tab.iconName && <Icon name={tab.iconName} size={14} />}
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
			{tabContents?.map((content, index) => (
				<TabsContent key={index} value={tabs[index]?.label as string}>
					{content}
				</TabsContent>
			))}
		</Tabs>
	);
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
