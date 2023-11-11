import { type EmailAttachment, type EmailJob } from '@prisma/client';
import { type CreateEmailResponse } from 'resend/build/src/emails/interfaces';
import { type EmailError, type REmailJob } from '.';
import { resend } from '..';

export default async function sendEmail({
	attachments,
	toAddress,
	body,
	toCC,
	subject,
}: REmailJob): Promise<CreateEmailResponse | EmailError> {
	return resend.emails.send({
		// TODO: we need to change this when we have a valid domain
		from: 'ReferLink <no-reply@referlink.xyz>',
		to: toAddress,
		subject,
		html: body,
		attachments: attachments.map(({ filename, url }: EmailAttachment) => ({
			filename,
			path: url,
		})),
		cc: toCC,
	});
}