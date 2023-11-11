import { type EmailJobStatus } from '@prisma/client';
import { type REmailJob } from '.';
import {prisma} from '..';

export default async function getEmailQueue(status: EmailJobStatus): Promise<REmailJob[]> {
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
		},
		include: {
			attachments: true,
		}
	});

	return emailQueue;
}