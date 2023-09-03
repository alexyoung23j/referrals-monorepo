import { type EmailJob } from '@prisma/client';
import { resend } from '..';

export default async function sendEmail({toAddress, body, emailType, attachmentUrls}: EmailJob) {
	return resend.emails.send({
		// TODO: we need to change this when we have a valid domain
		from: 'Referrals App <onboarding@resend.dev>',
		to: toAddress,
		subject: emailType,
		html: body,
		attachments: attachmentUrls.map(url => ({filename: 'Bora Yuksel\'s Resume.pdf', path: url})),
	});
};
