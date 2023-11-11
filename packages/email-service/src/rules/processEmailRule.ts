import { EmailJobStatus, EmailJobType, type EmailRule } from '@prisma/client';
import isEmailRuleSatisfied from './isEmailRuleSatisfied';
import {prisma} from '..';
import createEmailJobs from '../email/createEmailJobs';

export default async function processEmailRule(
	emailRule: EmailRule
) {
	try {
		const userIds = await isEmailRuleSatisfied(emailRule);
		if (!userIds) {return false;}

		const users = await prisma.user.findMany({
			where: {
				id: {
					in: userIds
				}
			}
		});

		const {emailSubject, emailBody, timePeriod, sendWhen, id: emailRuleId} = emailRule;
		const scheduleDate = new Date();

		if (sendWhen) {
			switch (timePeriod) {
				case 'days':
					scheduleDate.setDate(scheduleDate.getDate() + sendWhen);
					break;
				case 'weeks':
					scheduleDate.setDate(scheduleDate.getDate() + (sendWhen * 7));
					break;
				case 'months':
					scheduleDate.setMonth(scheduleDate.getMonth() + sendWhen);
					break;
			}
		}
		const emails = users.map(user => {
			const {name, email} = user;

			const firstName = name?.split(' ')[0] ?? '';
			return {
				toAddress: email ?? '',
				subject: emailSubject.replaceAll('{{name}}', firstName),
				body: emailBody.replaceAll('{{name}}', firstName),
				scheduledAt: scheduleDate,
				emailRuleId,
				emailType: EmailJobType.EMAIL_FROM_ADMIN,
				status: EmailJobStatus.QUEUED
			};
		});

		console.log('EMAILS', emails);
		createEmailJobs(emails)
			.then(() => prisma.emailRule.update({
				where: {
					id: emailRule.id
				},
				data: {
					sentToUsers: {
						push: userIds
					}
				}
			}))
			.catch(e => console.error('Error while creating email jobs: ', e));
	} catch(e) {
		console.error('Error while checking if rule is satisfied: e');
	}
}