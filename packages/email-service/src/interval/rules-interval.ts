import { getEmailRules, processEmailRule } from '../rules';
import { PROCESS_EMAIL_RULES_INTERVAL } from '../constants';
import { type EmailRule } from '@prisma/client';

export async function startEmailRulesInterval() {
	const currentActiveRules: EmailRule[] = [];
	const newRules = await getEmailRules(currentActiveRules).catch((e) =>
		console.log('Error while getting emailRules: ', e)
	);

	try {
		const intervalId = setInterval(async () => {
			try {
				const newRules = await getEmailRules(currentActiveRules).catch((e) =>
					console.log('Error while getting emailRules: ', e)
				);

				// if(newRules) {currentActiveRules.push(...newRules);}

				// currentActiveRules.forEach(rule => processEmailRule(rule));

				if (newRules) {newRules.forEach(rule => processEmailRule(rule));}
			} catch (error) {
				console.error(
					'An error occured inside email rules interval: ',
					error
				);
			}
		}, PROCESS_EMAIL_RULES_INTERVAL);
		console.log(`Task with id ${intervalId} executed at ${new Date()}`);
	} catch (error) {
		console.error(
			'An error occurred when instantiating email rules service: ',
			error,
			new Date()
		);
	}
}
