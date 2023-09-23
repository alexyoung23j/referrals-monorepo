import { resend } from '..';
import { type EmailError } from '.';
import { type GetEmailResponse } from 'resend/build/src/emails/interfaces';


export default async function getEmail(emailId: string): Promise<GetEmailResponse | EmailError> {
	return resend.emails.get(emailId);
};