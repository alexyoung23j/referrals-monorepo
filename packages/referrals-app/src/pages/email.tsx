import { type GetServerSidePropsContext } from 'next';
import { type NextPage } from 'next';
import { RButton } from '~/components/ui/button';
import { RSelector } from '~/components/ui/select';
import { api } from '~/utils/api';
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
import { useState } from 'react';
import { RCalendar } from '~/components/ui/calendar';

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
	seekerUserId: z.string(),
	referrerName: z.string(),
	referrerEmail: z.string(),
	referralRequestId: z.string(),
	meetingLink: z.string().optional(),
	scheduledAt: z.date()
});
 
function EmailForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});
	const [userId, setUserId] = useState<string>('');
	const { mutate: queueEmailJob } =
		api.email.queueEmailJob.useMutation();
	const { data: usersToRefer = [] } =
		api.email.getUsersToRefer.useQuery();
	const { data: referralRequests = [] } =
		api.email.getReferralRequests.useQuery({userId});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSubmit = (data: any) => {
		queueEmailJob(data);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="seekerUserId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Choose Seeker</FormLabel>
							<FormControl>
								<RSelector
									items={usersToRefer}
									onSelect={value => {
										setUserId(value);
										field.onChange(value);
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="referralRequestId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Choose Referral Request</FormLabel>
							<FormControl>
								<RSelector
									items={referralRequests}
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
					name="scheduledAt"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Meeting Link</FormLabel>
							<FormControl>
								<RCalendar date={new Date()} onSelect={field.onChange} />
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
		api.email.createMockEmailJobEntries.useMutation();

	const { mutate: deleteMockEmails } =
		api.email.deleteMockEmails.useMutation();

	const { mutate: cancelEmailJob } =
		api.email.deleteMockEmails.useMutation();

	// const handleQueueEmail = async () => {
	// 	await queueEmailJob();
	// };

	const handleGenerateMockEmailJobs = async () => {
		await createMockEmailJobEntries();
	};

	const handleDeleteMockEmailJobs = async () => {
		await deleteMockEmails();
	};

	const handleCancelEmailJob = async () => {
		await cancelEmailJob();
	};

	return (
		<div className="flex flex-col gap-3 p-5">
			<EmailForm />
			<RButton onClick={handleGenerateMockEmailJobs}>Generate Mock EmailJob Entries</RButton>
			<RButton onClick={handleDeleteMockEmailJobs}>Delete Test Entries</RButton>
			<RButton onClick={handleCancelEmailJob}>Edit Email Job</RButton>
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