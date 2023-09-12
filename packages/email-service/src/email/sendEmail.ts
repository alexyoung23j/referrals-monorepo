import { EmailJobType, type EmailJob } from '@prisma/client';
import { type CreateEmailResponse } from 'resend/build/src/emails/interfaces';
import { type EmailError } from '.';
import { resend } from '..';

const emailTypeToSubject = {
	[EmailJobType.MESSAGE_FROM_REFERRER]: 'A referrer just sent you a message!',
	[EmailJobType.REFERRAL_CONFIRMATION]: 'Thank you for your referral!',
	[EmailJobType.REFERRAL_CONFIRMATION_NOTIFICATION]: 'You have been referred!',
	[EmailJobType.REFERRAL_REMINDER]: 'Reminder to submit your referral!',
	[EmailJobType.REFERRAL_REMINDER_NOTIFICATION]: 'You will be referred soon!'
};

export default async function sendEmail({toAddress, body, emailType, attachmentUrls, toCC}: EmailJob): Promise<CreateEmailResponse | EmailError> {
	return resend.emails.send({
		// TODO: we need to change this when we have a valid domain
		from: 'Referrals App <onboarding@resend.dev>',
		to: toAddress,
		subject: emailTypeToSubject[emailType],
		html: body,
		// TODO: change this after EmailAttachment schema is created
		attachments: attachmentUrls.map(url => ({filename: 'Bora Yuksel\'s Resume.pdf', path: url})),
		cc: toCC
	});
};
