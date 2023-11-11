export const STARTED_INTERVAL = 'started_interval';
export const INTERVAL_ERROR = 'interval_error';

const EMAIL_INTERVAL_SECONDS = 5;
const RULES_INTERVAL_SECONDS = 5;
export const PROCESS_EMAILS_INTERVAL = EMAIL_INTERVAL_SECONDS * 1000;
export const PROCESS_EMAIL_RULES_INTERVAL = RULES_INTERVAL_SECONDS * 1000;

export const EMAIL = {
	SENT: 'sent',
	DELIVERED: 'delivered'
};

export const EMAIL_FAILURE_ALLOW_COUNT = 3;