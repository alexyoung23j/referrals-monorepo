import getEmailQueue from './getEmailQueue';
import processEmailQueue from './processEmailQueue';
import { type EmailAttachment, type EmailJob } from '@prisma/client';

export type EmailError = {
	name: string;
	message: string;
	statusCode: number;
}

export type EmailWithAttachment = EmailJob & {
	attachments: EmailAttachment[]
}

export {getEmailQueue, processEmailQueue};