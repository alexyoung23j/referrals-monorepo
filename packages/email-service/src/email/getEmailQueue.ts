import { type EmailJob } from '@prisma/client';
import {prisma} from '..';

export default async function getEmailQueue(): Promise<EmailJob[]> {
	console.log('Getting email queue...');
	const emailQueue = await prisma.emailJob.findMany({
		where: {
			status: 'QUEUED',
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