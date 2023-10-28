import { type GetServerSidePropsContext } from 'next';
import { MobileNotAllowed, PageLayout } from '~/components/layouts';
import { RButton } from '~/components/ui/button';
import { prisma } from '~/server/db';
import { redirectIfNotAuthed } from '~/utils/routing';
import { api } from '~/utils/api';
import Spinner from '~/components/ui/spinner';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/ui/form';
import { RCalendar } from '~/components/ui/calendar';
import {useForm} from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RSelector } from '~/components/ui/select';
import { UsersCombobox } from '~/components/users/users_combobox';
import { Checkbox } from '~/components/ui/checkbox';

const formSchema = z.object({
	sendToEveryone: z.boolean(),
	sendTo: z.string().optional(),
	scheduledAt: z.date()
});

function EmailForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});
	const [sendToEveryone, setSendToEveryone] = useState<boolean | 'indeterminate'>(false);
	const [userId, setUserId] = useState<string>('');
	const { mutate: queueEmailJob } =
		api.email.queueEmailJob.useMutation();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSubmit = (data: any) => {
		queueEmailJob(data);
	};

	console.log('FORM', form.getValues());
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="sendToEveryone"
					render={({ field }) => (
						<FormItem className='flex flex-col'>
							<FormLabel>Send to everyone</FormLabel>
							<FormControl>
								<Checkbox
									onCheckedChange={value => {
										setSendToEveryone(value);
										field.onChange(value);
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{!sendToEveryone && <FormField
					control={form.control}
					name="sendTo"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Choose users to send email to</FormLabel>
							<FormControl>
								<UsersCombobox
									onSelectCompany={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>}
				<FormField
					control={form.control}
					name="scheduledAt"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Send email on</FormLabel>
							<FormControl>
								<RCalendar date={new Date()} onSelect={field.onChange} />
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

export default function AdminPage() {
	const { data: profileData, status } = api.profiles.getProfile.useQuery(
		undefined,
		{
			refetchOnWindowFocus: false,
		}
	);

	useEffect(() => {
		if (status !== 'success') {
			return;
		}

		const urlParams = new URLSearchParams(window.location.search);
		const account = urlParams.get('account');
		if (account === 'true') {
			const billingSection = document.getElementById('billingSection');
			if (billingSection) {
				billingSection.scrollIntoView({ behavior: 'auto' });
			}
		}
	}, [status]);

	const [pageLoaded, setPageLoaded] = useState(false);

	useEffect(() => {
		if (!pageLoaded) {
			setPageLoaded(true);
		}
	}, [pageLoaded]);

	if (!pageLoaded) {
		return (
			<div className="flex h-[100vh] w-full items-center justify-center">
				<Spinner size="medium" />
			</div>
		);
	}

	return (
		<PageLayout
			showSidebar
			pageTitle="Admin"
			pageSubtitle="For admin eyes only."
		>
			<Head>
				<title>Admin - ReferLink</title>
			</Head>
			<div className="flex h-[200vh] w-full">
				<EmailForm />
			</div>
		</PageLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	return redirectIfNotAuthed({
		ctx,
		redirectUrl: '/'
	});
}
