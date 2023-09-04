import { type EmailJob, type EmailJobStatus } from '@prisma/client';
import {prisma} from '..';

export default async function getEmailQueue(status: EmailJobStatus): Promise<EmailJob[]> {
	console.log('Getting email queue with status: ', status);
	const emailQueue = await prisma.emailJob.findMany({
		where: {
			status,
			OR: [
				{
					scheduledAt: {
						lte: new Date().toISOString()
					}
				},
				{
					scheduledAt: null
				}
			]

		}
	});

	return emailQueue;
}