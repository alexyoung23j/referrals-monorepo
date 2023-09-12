import { type GetServerSidePropsContext } from 'next';
import { type NextPage } from 'next';
import { RButton } from '~/components/ui/button';
import { RSelector } from '~/components/ui/select';
import { trpc } from '~/utils/api';
import { redirectIfNotAuthed } from '~/utils/routing';
import {useForm} from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
 
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { CompanyCombobox } from '~/components/company/company_combobox';

const emailTypeEnum = [
	{value: 'REFERRAL_REMINDER', content: 'REFERRAL_REMINDER'},
	{value: 'REFERRAL_REMINDER_NOTIFICATION', content: 'REFERRAL_REMINDER_NOTIFICATION'},
	{value: 'REFERRAL_CONFIRMATION', content: 'REFERRAL_CONFIRMATION'},
	{value: 'REFERRAL_CONFIRMATION_NOTIFICATION', content: 'REFERRAL_CONFIRMATION_NOTIFICATION'},
	{value: 'MESSAGE_FROM_REFERRER', content: 'MESSAGE_FROM_REFERRER'}
];

const formSchema = z.object({
	emailType: z.enum([
		'REFERRAL_REMINDER',
		'REFERRAL_REMINDER_NOTIFICATION',
		'REFERRAL_CONFIRMATION',
		'REFERRAL_CONFIRMATION_NOTIFICATION',
		'MESSAGE_FROM_REFERRER'
	]),
	seeker: z.string(),
	referrerName: z.string(),
	referrerEmail: z.string(),
	companyName: z.string(),
	meetingLink: z.string().optional()
});
 
function EmailForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});
	const { mutate: queueEmailJob } =
		trpc.email.queueEmailJob.useMutation();
	const { data: usersToRefer = [] } =
		trpc.email.getUsersToRefer.useQuery();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSubmit = ({seeker, emailType, referrerName, referrerEmail, companyName}: any) => {
		console.log('seeker', seeker);
		queueEmailJob({emailType, seekerUserId: seeker, referrerName, referrerEmail, companyName});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="seeker"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Choose Seeker</FormLabel>
							<FormControl>
								<RSelector
									items={usersToRefer}
									onSelect={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="emailType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email Type</FormLabel>
							<FormControl>
								<RSelector
									items={emailTypeEnum}
									onSelect={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="referrerName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Referrer</FormLabel>
							<FormControl>
								<Input placeholder="Bora Yuksel" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="referrerEmail"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Referrer Email Address</FormLabel>
							<FormControl>
								<Input placeholder="abc@gmail.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="companyName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Select Company</FormLabel>
							<FormControl>
								<CompanyCombobox onSelectCompany={(company => field.onChange(company.name))} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="meetingLink"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Meeting Link</FormLabel>
							<FormControl>
								<Input placeholder="Bora Yuksel" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<RButton type="submit">Queue Email Job</RButton>
			</form>
		</Form>
	);
}

const EmailPage: NextPage = () => {
	const { mutate: createMockEmailJobEntries } =
		trpc.email.createMockEmailJobEntries.useMutation();

	const { mutate: deleteMockEmails } =
		trpc.email.deleteMockEmails.useMutation();

	// const handleQueueEmail = async () => {
	// 	await queueEmailJob();
	// };

	const handleGenerateMockEmailJobs = async () => {
		await createMockEmailJobEntries();
	};

	const handleDeleteMockEmailJobs = async () => {
		await deleteMockEmails();
	};

	return (
		<div className="flex flex-col gap-3 p-5">
			<EmailForm />
			<RButton onClick={handleGenerateMockEmailJobs}>Generate Mock EmailJob Entries</RButton>
			<RButton onClick={handleDeleteMockEmailJobs}>Delete Test Entries</RButton>
		</div>
	);
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	// Redirect to Landing Page if Not Logged in
	return redirectIfNotAuthed({
		ctx,
		redirectUrl: '/',
	});
}

export default EmailPage;