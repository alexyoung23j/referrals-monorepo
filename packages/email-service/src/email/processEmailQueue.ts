import { EmailJobStatus, type EmailJob } from '@prisma/client';
import {prisma} from '..';
import sendEmail from './sendEmail';
import retrieveEmailStatus from './retrieveEmailStatus';
import { EMAIL } from '../constants';

// TODO: should implement something where in case the email-service goes down completely,
// TODO: we can query all the last PROCESSING emails, and re-process if needed.
// TODO: which means, we probably want to store emailId in the schema as well
export default async function processEmailQueue(emailQueue: Array<EmailJob>) {
	if (!emailQueue.length) {
		console.log('No emails to process.');
		return;
	}

	await prisma.emailJob.updateMany({
		where: {
			id: {
				in: emailQueue.map((item) => item.id)
			}
		},
		data: {
			status: EmailJobStatus.PROCESSING
		}
	});

	emailQueue.forEach(async email => {
		console.log('Sending email with id: ', email.id);
		console.log('Sending email with body: ', email.body);
		const {id: emailId} = await sendEmail(email);

		const emailStatus = await retrieveEmailStatus(emailId);
		console.log('EMAIL STATUS', emailStatus);
		await prisma.emailJob.update({
			where: {
				id: email.id
			},
			data: {
				status: emailStatus === EMAIL.SENT ? EmailJobStatus.SENT : EmailJobStatus.FAILED,
				resendEmailId: emailId,
				sentAt: new Date()
			}
		});
	});
}