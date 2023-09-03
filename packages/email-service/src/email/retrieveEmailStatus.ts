import { resend } from '..';

export default async function retrieveEmailStatus(emailId: string) {
	const {last_event} = await resend.emails.get(emailId);
	return last_event;
};