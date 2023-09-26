import { getEmailQueue, processEmailQueue } from '../email';
import { PROCESS_EMAILS_INTERVAL } from '../constants';

export async function startEmailInterval() {
	const emailQueue = await getEmailQueue('PROCESSING').catch((e) =>
		console.log('Error while getting email queue: ', e)
	);
	if (emailQueue) {
		await processEmailQueue(emailQueue).catch((e) =>
			console.log('Error while processing email queue: ', e)
		);
	}

	try {
		const intervalId = setInterval(async () => {
			try {
				const emailQueue = await getEmailQueue('QUEUED').catch((e) =>
					console.log('Error while getting email queue: ', e)
				);
				if (emailQueue) {
					await processEmailQueue(emailQueue).catch((e) =>
						console.log('Error while processing email queue: ', e)
					);
				}
			} catch (error) {
				console.error(
					'An error occured inside email interval: ',
					error
				);
			}
		}, PROCESS_EMAILS_INTERVAL);
		console.log(`Task with id ${intervalId} executed at ${new Date()}`);
	} catch (error) {
		console.error(
			'An error occurred when instantiating email service: ',
			error,
			new Date()
		);
	}
}
