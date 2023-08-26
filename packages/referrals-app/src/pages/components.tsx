import { type NextPage } from 'next';
import { Button, RButton } from '~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { RText } from '~/components/ui/text';
import Icon from '~/components/ui/icons';
import {
	RTabsSection,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/ui/tabs';
import { RCalendar } from '~/components/ui/calendar';
import { RPopover } from '~/components/ui/popover';
import { RCard } from '~/components/ui/card';
import { RInput } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { Switch } from '~/components/ui/switch';
import { RTextarea } from '~/components/ui/textarea';

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

				<div className="m-top-5 mt-10 flex flex-col gap-3">
					<RText fontSize="h1">Buttons</RText>
					<RButton
						onClick={() => {
							console.log('yo');
						}}
					>
						Primary
					</RButton>
					<RButton
						onClick={() => {
							console.log('yo');
						}}
						variant="secondary"
					>
						Secondary
					</RButton>
					<RButton
						onClick={() => {
							console.log('yo');
						}}
						size="sm"
					>
						Small
					</RButton>
					<RButton
						onClick={() => {
							console.log('yo');
						}}
						iconName="pencil"
					>
						Icon
					</RButton>
				</div>
				<div className="m-top-5 mt-10 flex flex-col gap-3">
					<RText fontSize="h1">Card</RText>
					<RCard>
						<div>Content in card, no elevation</div>
					</RCard>
					<RCard elevation="md">
						<div>Content in card, no elevation</div>
					</RCard>
				</div>
				<div className="m-top-5 mt-10 flex flex-col gap-3">
					<RText fontSize="h1">Popover</RText>
					<RPopover
						trigger={
							<div className="flex max-w-fit flex-row items-center gap-1">
								<RText>Click for Info</RText>
								<Icon name="info" size="12px" />
							</div>
						}
						content={<div className="p-4">I am in the popover</div>}
						align="start"
					/>
				</div>
				<div className="m-top-5 mt-10 flex flex-col gap-3">
					<RText fontSize="h1">Avatar</RText>

					<Avatar>
						<AvatarImage src="https://github.com/shadcn.png" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
				</div>
				<div className="m-top-5 mt-10 flex flex-col gap-3">
					<RText fontSize="h1">Icons</RText>
					<Icon name="pencil" />
				</div>
				<div className="m-top-5 mt-10 flex flex-col gap-3">
					<RText fontSize="h1">Tabs</RText>
					<RTabsSection
						tabs={[
							{
								label: 'Tab 1',
								iconName: 'pencil',
								onTabSelect: (tab) => console.log(tab),
							},
							{ label: 'Tab 2' },
						]}
						onTabsChange={(tab) => console.log('Changed')}
					/>
					<RTabsSection
						tabs={[
							{ label: 'Tab with content 1' },
							{ label: 'Tab with content 2' },
						]}
						tabContents={[
							<div key="1">Content for Tab 1</div>,
							<div key="2">Content for Tab 2</div>,
						]}
					/>
				</div>
				<div className="m-top-5 mt-10 flex flex-col gap-3">
					<RText fontSize="h1">Calendar</RText>
					<RCalendar
						date={new Date()}
						onSelect={(date) => {
							console.log(date);
						}}
					/>
				</div>
			</div>
			<div className="bora">
				<div className="flex flex-col gap-3">
					<Label className="text-2xl">Switch</Label>
					<Switch
						onCheckedChange={(value: boolean) =>
							console.log('Checked: ', value)
						}
					/>
				</div>
				<Separator className="mb-5 mt-5" />
				<div className="flex max-w-[500px] flex-col gap-3">
					<Label className="text-2xl">Inputs</Label>
					<RInput placeholder="Placeholder" />
					<RInput
						value="Read Only"
						readOnly
						highlighted
						copyEnabled
					/>
					<RInput value="Disabled" disabled />
					<RInput copyEnabled placeholder="Enter your blurb" />
				</div>
				<Separator className="mb-5 mt-5" />
				<div className="flex max-w-[500px] flex-col gap-3">
					<Label className="text-2xl">Text Area</Label>
					<RTextarea placeholder="Placeholder" />
					<RTextarea value="Read Only" readOnly />
					<RTextarea value="Disabled" disabled />
					<RTextarea
						copyEnabled
						label="Label and Icon"
						placeholder="Enter your blurb"
					/>
				</div>
				<Separator className="mb-5 mt-5" />
				<div className="mb-15">
					<Label className="text-2xl">Avatar</Label>
				</div>
			</div>
		</div>
	);
};

export default ComponentsPage;
