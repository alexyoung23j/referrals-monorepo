import { type EmailJobType, type EmailJobStatus } from '@prisma/client';
import {prisma} from '..';

type PartialEmailJob = {
	toAddress: string;
	body: string;
	subject: string;
	emailRuleId: string;
	emailType: EmailJobType;
	status: EmailJobStatus;
	scheduledAt: Date;
}

export default async function createEmailJobs(emails: PartialEmailJob[]): Promise<void> {
	emails.forEach(async (email) => {
		await prisma.emailJob.create({
			data: {
				...email,
				toCC: [],
				attachments: {
					create: [],
				},
			}});
	});
}