import { EmailJobType } from '@prisma/client';

const jobToMessageMapping: Record<string, string> = {
	[EmailJobType.MESSAGE_FROM_REFERRER]: 'Hey ${seekerName}, you\'ve got a message from ${referrerName}. They said: ${message}. They also included a link to schedule a meeting: ${meetingLink}. You can get in touch with them at ${referrerEmail}.',
	[EmailJobType.REFERRAL_CONFIRMATION]: 'Thanks for referring ${seekerName} to ${companyName}! If you need anything else from them, reach out at ${seekerEmail}.',
	[EmailJobType.REFERRAL_CONFIRMATION_NOTIFICATION]: 'Hey ${seekerName}, ${referrerName} has referred you to ${companyName}!',
	[EmailJobType.REFERRAL_REMINDER]: 'Hi ${referrerName}, Here\'s your reminder to refer ${seekerName} to ${companyName}. Use this link to get quickly refer them: ${referralsLink}. If you need to get in touch, reach ${seekerName} at ${seekerEmail}. Their resume is attached.',
	[EmailJobType.REFERRAL_REMINDER_NOTIFICATION]: 'Hey ${seekerName}, ${referrerName} has set a reminder to refer you to ${companyName}.'
};


const formatMessage = (template: string, values: Record<string, string>) => {
	// Use a regular expression to find and replace placeholders with values.
	return template.replace(/\${(.*?)}/g, (match, key) => values[key.trim()] || match);
};

const getTemplate = (templateKey: string): string | undefined => {
	return jobToMessageMapping[templateKey];
};

export const constructEmailMessage = (emailType: string, values: Record<string, string>): string => {
	const emailTemplate = getTemplate(emailType);
	if (!emailTemplate) {throw new Error('Could not find email template with given key');};

	// Check if all placeholders in the template have corresponding values
	const missingPlaceholders = emailTemplate.match(/\${(.*?)}/g)?.map((match) => match.slice(2, -1)) || [];
	const missingValues = missingPlaceholders.filter((placeholder) => !values[placeholder]);
	
	if (missingValues.length > 0) {
		throw new Error(`Missing values for placeholders: ${missingValues.join(', ')}`);
	}

	return formatMessage(emailTemplate, values);
};