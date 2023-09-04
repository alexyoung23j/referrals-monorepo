import getEmailQueue from './getEmailQueue';
import processEmailQueue from './processEmailQueue';

export type EmailError = {
	name: string;
	message: string;
	statusCode: number;
}

export {getEmailQueue, processEmailQueue};