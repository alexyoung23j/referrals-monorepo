import { type GetServerSidePropsContext } from 'next';
import { MobileNotAllowed, PageLayout } from '~/components/layouts';
import { RButton } from '~/components/ui/button';
import { prisma } from '~/server/db';
import { redirectIfNotAdmin } from '~/utils/routing';
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
import { RTextarea } from '~/components/ui/textarea';
import { RInput } from '~/components/ui/input';
import { RText } from '~/components/ui/text';
import { 
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
} from '~/components/ui/select';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/ui/tabs';
import Icon from '~/components/ui/icons';


const emailFormSchema = z.object({
	sendToEveryone: z.boolean().default(false),
	sendTo: z.array(z.custom()).optional(),
	emailBody: z.string(),
	scheduledAt: z.date().default(new Date()),
	emailSubject: z.string(),
	addRule: z.string().optional(),
	lastCreateOrUpdate: z.date().optional().default(new Date()),
	sendWhen: z.string().optional()
});

const emailRuleFormSchema = z.object({
	emailBody: z.string(),
	emailSubject: z.string(),
	addRule: z.string().optional(),
	lastCreateOrUpdate: z.date().optional().default(new Date()),
	sendWhen: z.string().optional(),
	ruleName: z.string()
});

function EmailForm() {
	const form = useForm<z.infer<typeof emailFormSchema>>({
		resolver: zodResolver(emailFormSchema),
	});
	const [sendToEveryone, setSendToEveryone] = useState<boolean | 'indeterminate'>(false);

	const { mutate: queueAdminEmail } =
		api.email.queueAdminEmail.useMutation();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSubmit = (data: any) => {
		queueAdminEmail({...data});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="emailSubject"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email Subject</FormLabel>
							<FormControl>
								<div>
									<RText><em>{'Use {{name}} to replace with the user\'s name'}</em></RText>
									<RInput onChange={field.onChange} />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="emailBody"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email Body</FormLabel>
							<FormControl>
								<div>
									<RText><em>{'Use {{name}} to replace with the user\'s name'}</em></RText>
									<RTextarea onChange={field.onChange} />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
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
								<UsersCombobox onSelectUser={field.onChange} />
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
				<RButton type="submit" className='top-1'>Queue Email Job</RButton>
			</form>
		</Form>
	);
}

function FieldType({setFieldType}: {setFieldType: (input: string) => void}) {
	return (
		<Select onValueChange={(value) => setFieldType(value)}>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select field type" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Select field type</SelectLabel>
					<SelectItem value='int'>Int</SelectItem>
					<SelectItem value='string'>String</SelectItem>
					<SelectItem value='boolean'>Boolean</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

function Field(props: {fieldType: string; setFieldValue: (input: string | number | boolean) => void}) {
	const {fieldType, setFieldValue} = props;

	switch(fieldType) {
		case 'int':
			return (
				<RInput type='number' defaultValue={1} onChange={(e) => setFieldValue(Number(e.target.value))}/>
			);
		case 'string':
			return (
				<RInput onChange={(e) => setFieldValue(e.target.value)}/>
			);
		case 'boolean':
			return (
				<Select onValueChange={(value) => setFieldValue(Boolean(value))}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select TRUE / FALSE" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Select field type</SelectLabel>
							<SelectItem value='true'>TRUE</SelectItem>
							<SelectItem value='false'>FALSE</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			);
		default: 
			return (<></>);
	}
}

function EmailRuleForm(props: {refetchEmailRules: () => void}) {
	const form = useForm<z.infer<typeof emailRuleFormSchema>>({
		resolver: zodResolver(emailRuleFormSchema),
	});
	const [modelName, setModelName] = useState<string>('');
	const [condition, setCondition] = useState<string>('');
	const [operation, setOperation] = useState<string>('');
	const [sendWhen, setSendWhen] = useState<number>(1);
	const [timePeriod, setTimePeriod] = useState<string>('minutes');
	const [fieldName, setFieldName] = useState<string>('');
	const [fieldValue, setFieldValue] = useState<number | string | boolean>(1);
	const [fieldType, setFieldType] = useState<string>('int');

	const { mutate: createEmailRule } =
		api.email.createEmailRule.useMutation();
	const { data: dbModelNames = [] } =
		api.admin.getDBModels.useQuery();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSubmit = async (data: any) => {
		await createEmailRule({...data, modelName, condition, operation, timePeriod, sendWhen, fieldName, fieldValue, fieldType});
		await props.refetchEmailRules();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="ruleName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Rule Name</FormLabel>
							<FormControl>
								<div>
									<RInput onChange={field.onChange} />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="emailSubject"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email Subject</FormLabel>
							<FormControl>
								<div>
									<RText><em>{'Use {{name}} to replace with the user\'s name'}</em></RText>
									<RInput onChange={field.onChange} />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="emailBody"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email Body</FormLabel>
							<FormControl>
								<div>
									<RText><em>{'Use {{name}} to replace with the user\'s name'}</em></RText>
									<RTextarea onChange={field.onChange} />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="addRule"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Create an email rule</FormLabel>
							<FormControl>
								<div>
									<Select onValueChange={(value) => setModelName(value)}>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder="Select a DB model" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Select DB Model</SelectLabel>
												{dbModelNames.map((model: string) => (
													<SelectItem key={model} value={model}>{model}</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<Select onValueChange={(value) => setCondition(value)}>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder="Select a rule" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Select rule</SelectLabel>
												<SelectItem value="is">is</SelectItem>
												<SelectItem value="lastCreated">last created</SelectItem>
												<SelectItem value="lastUpdated">last updated</SelectItem>
												<SelectItem value="has">has</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									{
										condition === 'is' ? 
											(
												<Select onValueChange={(value) => setOperation(value)}>
													<SelectTrigger className="w-[180px]">
														<SelectValue placeholder="Select a DB operation" />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>Select Operation</SelectLabel>
															<SelectItem value="created">CREATED</SelectItem>
															<SelectItem value="updated">UPDATED</SelectItem>
															{/* <SelectItem value="delete">DELETED</SelectItem> */ /* TODO: i dont actually know how to handle this */}
														</SelectGroup>
													</SelectContent>
												</Select>
											) : condition && condition !== 'has' ? (
												<FormField
													control={form.control}
													name="lastCreateOrUpdate"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Select date</FormLabel>
															<FormControl>
																<RCalendar date={new Date()} onSelect={field.onChange} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											) : null
									}
									{
										condition === 'has' ? (
											<>
												<RInput placeholder='i.e. requestsCreated' onChange={(e) => setFieldName(e.target.value)} />
												<FieldType setFieldType={setFieldType} />
												<Field setFieldValue={setFieldValue} fieldType={fieldType} />
											</>
										) : null
									}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField 
					control={form.control}
					name="sendWhen"
					render={({ field }) => (
						<FormItem>
							<FormLabel>When should this email send?</FormLabel>
							<FormControl>
								<div>
									<RText>Send after: </RText>
									<RInput type='number' onChange={(e) => setSendWhen(Number(e.target.value))} defaultValue={sendWhen} />
									<Select defaultValue={timePeriod} onValueChange={(value) => setTimePeriod(value)}>
										<SelectTrigger className="w-[180px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Time period</SelectLabel>
												<SelectItem value="minutes">minutes</SelectItem>
												<SelectItem value="days">days</SelectItem>
												<SelectItem value="weeks">weeks</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
							</FormControl>
						</FormItem>
					)}
				/>
				<RButton type="submit" className='top-1'>Create Email Rule</RButton>
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
	const {data: emailRules, refetch: refetchEmailRules} = api.email.getEmailRules.useQuery();
	const { mutate: deleteEmailRule } = api.email.deleteEmailRule.useMutation();

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
			<div className="flex h-fit w-full">
				<Tabs defaultValue="rule" className="w-[400px]">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="rule">Add Rule</TabsTrigger>
						<TabsTrigger value="scheduled">Schedule Email</TabsTrigger>
					</TabsList>
					<TabsContent value="rule">
						<EmailRuleForm refetchEmailRules={refetchEmailRules} />
					</TabsContent>
					<TabsContent value="scheduled">
						<EmailForm />
					</TabsContent>
				</Tabs>
			</div>
			<div className="flex flex-col h-[200vh] w-full mt-10">
				<RText fontSize='h1'>Email Rules</RText>
				{emailRules?.map(rule => (
					<div key={rule.id} className='flex' >
						<RText fontSize='h3'>{rule.ruleName}: {rule.modelName} {rule.condition} {rule.condition === 'is' ? rule.operation : rule.fieldValue + ' ' + rule.fieldName}</RText>
						<Icon 
							name='delete'
							onClick={async () => {
								await deleteEmailRule({ruleId: rule.id});
								await refetchEmailRules();
							}}
						/>
					</div>
				))}
			</div>
		</PageLayout>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	return redirectIfNotAdmin({
		ctx,
		redirectUrl: '/'
	});
}
