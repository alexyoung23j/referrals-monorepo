import { type EmailRule, type EmailJobStatus } from '@prisma/client';
import {prisma} from '..';

export default async function getEmailRules(currentRules: EmailRule[]): Promise<EmailRule[]> {
	const currentEmailRuleIds = currentRules.map(rule => rule.id);
	return prisma.emailRule.findMany({
		where: {
			id: {
				not: {
					in: currentEmailRuleIds
				}
			}
		}
	});
}