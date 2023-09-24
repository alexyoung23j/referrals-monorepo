import { EmailJobType } from '@prisma/client';

type EmailTemplateGenerator = (values: Record<string, string>) => string;

const referralReminder = ({referrerName, seekerName, companyName, referralsLink, role}: Record<string, string>) => 
	`<html>
	<body>
	<span>Hi ${referrerName},</span>
	<br>
	<br>
	<span>This is a friendly reminder to refer ${seekerName} to ${companyName}${role ? ` for the ${role} role` : ''}. I've CC'd ${seekerName} in case you need to get in contact and attached their resume. To easily facilitate this request and access additional information about ${seekerName}, click here: ${referralsLink}.</span>
	<br>
	<br>
	${seekerName} really appreciates the help!</body></html>`;

// TODO: this needs to handle a special case for special job posting link. Maybe another special flag idk
const messageFromReferrer = ({referrerName, seekerName, companyName, referrerEmail, message, meetingScheduleLink, specialJobPostingLink}: Record<string, string>) => 
	`<html>
	<body>
	<span>Hi ${seekerName},</span>
	<br>
	<br>
	<span>You've got a message from ${referrerName} regarding your referral request at ${companyName}. Here's what ${referrerName} said:</span>
	<br>
	<br>
	<span>"${message}"</span>
	${meetingScheduleLink ? 
		`
		<br>
		<span>They've also included a link to schedule a meeting: ${meetingScheduleLink}</span>
		` : ''}
	${!meetingScheduleLink && specialJobPostingLink ? 
		`
		<br>
		<span>They've also included a special job posting link: ${specialJobPostingLink}</span>
		` : ''}
	<br>
	<br>
	<span>You can get in touch with them at ${referrerEmail}</span>
	</body></html>`;

const referralConfirmation = ({referrerName, seekerName, seekerEmail, companyName}: Record<string, string>) => 
	`<html>
	<body>
	<span>Hi ${referrerName},</span>
	<br>
	<br>
	<span>Thank you so much for referring ${seekerName} to ${companyName}! If you ever need to get in touch with ${seekerName}, you can reach them at ${seekerEmail}.</span>
	</body></html>`;

const referralConfirmationNotification = ({referrerName, seekerName, referrerEmail, companyName, role, message}: Record<string, string>) => 
	`<html>
	<body>
	<span>Hi ${seekerName},</span>
	<br>
	<br>
	<span>You've just been referred to ${role ? `${role} position at` : ''} ${companyName} by ${referrerName}.</span>
	<span>You can reach them at ${referrerEmail} if you need more information, but they've confirmed your referral was submitted!</span>
	${message ? 
		`They've included this message as well:
		<br>
		<br>
		${message}
		`
		: ''}
	<br>
	<br>
	</body></html>`;

const jobToMessageMapping: Record<string, EmailTemplateGenerator> = {
	[EmailJobType.MESSAGE_FROM_REFERRER]: messageFromReferrer,
	[EmailJobType.REFERRAL_CONFIRMATION]: referralConfirmation,
	[EmailJobType.REFERRAL_CONFIRMATION_NOTIFICATION]: referralConfirmationNotification,
	[EmailJobType.REFERRAL_REMINDER]: referralReminder,
};

const messageFromReferrerSubject = ({referrerName, companyName}: Record<string, string>) => `Message from ${referrerName} re: Referral to ${companyName}`;
const referralConfirmationSubject = ({seekerName, companyName}: Record<string, string>) => `Thank you for referring ${seekerName} to ${companyName}!`;
const referralConfirmationNotificationSubject = ({companyName}: Record<string, string>) => `You've been referred to ${companyName}!`;
const referralReminderSubject = ({seekerName, companyName}: Record<string, string>) => `Your reminder to refer ${seekerName} to ${companyName}!`;


const emailTypeToSubject: Record<string, EmailTemplateGenerator> = {
	[EmailJobType.MESSAGE_FROM_REFERRER]: messageFromReferrerSubject,
	[EmailJobType.REFERRAL_CONFIRMATION]: referralConfirmationSubject,
	[EmailJobType.REFERRAL_CONFIRMATION_NOTIFICATION]: referralConfirmationNotificationSubject,
	[EmailJobType.REFERRAL_REMINDER]: referralReminderSubject,
};

const getTemplate = (templateKey: string, isBody: boolean = false): EmailTemplateGenerator | undefined => {
	return isBody ? jobToMessageMapping[templateKey] : emailTypeToSubject[templateKey];
};

export const constructEmailMessage = (emailType: string, values: Record<string, string>): string => {
	const emailTemplateGenerator = getTemplate(emailType, true);
	if (!emailTemplateGenerator) {throw new Error('Could not find email template with given key');};

	const emailTemplate = emailTemplateGenerator(values);

	if (emailTemplate.includes('undefined')) {
		throw new Error('Missing values for placeholders.');
	}

	return emailTemplate;
};

export const constructEmailSubject = (emailType: string, values: Record<string, string>): string => {
	const emailSubjectGenerator = getTemplate(emailType);
	if (!emailSubjectGenerator) {throw new Error('Could not find email subject template with given key');};

	const subjectTemplate = emailSubjectGenerator(values);

	if (subjectTemplate.includes('undefined')) {
		throw new Error('Missing values for placeholders.');
	}

	return subjectTemplate;
};