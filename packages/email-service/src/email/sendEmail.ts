import { type EmailAttachment, type EmailJob } from '@prisma/client';
import { type CreateEmailResponse } from 'resend/build/src/emails/interfaces';
import { type EmailError } from '.';
import { resend } from '..';

type EmailWithAttachment = EmailJob & {
	attachments: EmailAttachment[]
}

export default async function sendEmail({attachments, toAddress, body, emailType, toCC, subject}: EmailWithAttachment): Promise<CreateEmailResponse | EmailError> {
	return resend.emails.send({
		// TODO: we need to change this when we have a valid domain
		from: 'Referrals App <admin@referlink.xyz>',
		to: toAddress,
		subject,
		html: body,
		// TODO: change this after EmailAttachment schema is created
		attachments: attachments.map(({filename, url}: EmailAttachment) => ({filename, path: url})),
		cc: toCC
	});
};
