import { EmailJobStatus, type EmailJob } from '@prisma/client';
import {prisma} from '..';
import getEmail from './getEmail';
import sendEmail from './sendEmail';
import { EMAIL } from '../constants';
import { type CreateEmailResponse, type GetEmailResponse } from 'resend/build/src/emails/interfaces';
import { type EmailError } from '.';

type ResendResponse = CreateEmailResponse | GetEmailResponse | EmailError
const responseIsEmailError = (response: ResendResponse): response is EmailError => !('id' in response);


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
		try {
			console.log('Sending email with id: ', email.id);
			console.log('Sending email with body: ', email.body);

			const sendEmailResponse = await sendEmail(email);

			if(responseIsEmailError(sendEmailResponse)) {
				const {statusCode, message} = sendEmailResponse;
				throw new Error(`Sending email failed with status code ${statusCode}: ${message}`);
			}
		
			const {id: emailId} = sendEmailResponse;
			const getEmailResponse = await getEmail(emailId);
			if(responseIsEmailError(getEmailResponse)) {
				const {statusCode, message} = getEmailResponse;
				throw new Error(`Sending email failed with status code ${statusCode}: ${message}`);
			}
		
			// const {id: emailId} = sendEmailResponse;
			 const {last_event: emailStatus, created_at: sentAt} = getEmailResponse;
			 console.log(`Status for email with id ${email.id}: `, emailStatus);
			await prisma.emailJob.update({
				where: {
					id: email.id
				},
				data: {
					status: (emailStatus === EMAIL.SENT || emailStatus === EMAIL.DELIVERED) ? EmailJobStatus.SENT : EmailJobStatus.FAILED,
					resendEmailId: emailId,
					sentAt
				}
			});
		} catch(e) {
			console.error(`Error while processing email with id ${email.id}: ${e}`);
			// TODO: try 3 times total, save the failedTotal in DB. after 3 fail completely, until 3, continue queueing
			await prisma.emailJob.update({
				where: {
					id: email.id
				},
				data: {
					status: EmailJobStatus.FAILED
				}
			});
		}
	});
}