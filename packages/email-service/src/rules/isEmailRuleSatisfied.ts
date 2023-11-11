import { prisma } from '..';
import { type EmailRule } from '@prisma/client';

const lastCreatedTimestampsMap: { [key: string]: Date } = {};
const lastUpdatedTimestampsMap: { [key: string]: Date } = {};

export default async function isEmailRuleSatisfied(emailRule: EmailRule): Promise<false | Array<string>> {
	const {modelName, condition, operation, fieldValue, fieldName, sentToUsers, fieldType} = emailRule;
	
	let queryResult;
	let dbQueryCondition, lastCheckedTimestamp;

	switch(condition) {
		case 'is':
			if (operation === 'created') {
				lastCheckedTimestamp = lastCreatedTimestampsMap[modelName] ?? new Date();
				dbQueryCondition = { createdAt: { gt: lastCheckedTimestamp } };
				lastCreatedTimestampsMap[modelName] = new Date();
			} else if (operation === 'updated') {
				lastCheckedTimestamp = lastUpdatedTimestampsMap[modelName] ?? new Date();
				dbQueryCondition = { updatedAt: { gt: lastCheckedTimestamp } };
				lastUpdatedTimestampsMap[modelName] = new Date();
			}
			break;
		case 'has':
			const transformedFieldValue = fieldType === 'int' ? Number(fieldValue) : fieldType === 'boolean' ? Boolean(fieldValue) : fieldValue;
			lastCheckedTimestamp = lastUpdatedTimestampsMap[modelName] ?? new Date();
			dbQueryCondition = { [`${fieldName}`]: transformedFieldValue, updatedAt: { gt: lastCheckedTimestamp } };
			lastUpdatedTimestampsMap[modelName] = new Date();
			break;
		case 'lastCreated':
			console.error('lastCreated is currently not supported.');
			break;
		case 'lastUpdated':
			console.error('lastUpdated is currently not supported.');
			break;
	}

	switch(modelName) {
		case 'StripeCustomer':
			queryResult = await prisma.stripeCustomer.findMany({
				where: { 
					...dbQueryCondition,
					userId: {
						not: {
							in: sentToUsers
						}
					}
				}
			});
			if (queryResult.length) {return queryResult.map(result => result.userId || '').filter(result => result !== '');};
			break;
		case 'ReferralRequest':
			queryResult = await prisma.referralRequest.findMany({
				where: { 
					...dbQueryCondition,
					referrerUserId: {
						not: {
							in: sentToUsers
						}
					}
				}			});
			if (queryResult.length) {return queryResult.map(result => result.referrerUserId || '').filter(result => result !== '');};
			break;
		case 'UserProfile':
			queryResult = await prisma.userProfile.findMany({
				where: { 
					...dbQueryCondition,
					userId: {
						not: {
							in: sentToUsers
						}
					}
				}
			});
			if (queryResult.length) {return queryResult.map(result => result.userId || '').filter(result => result !== '');};
			break;
		case 'Link':
			queryResult = await prisma.link.findMany({
				where: { 
					...dbQueryCondition,
					userId: {
						not: {
							in: sentToUsers
						}
					}
				}
			});
			if (queryResult.length) {return queryResult.map(result => result.userId || '').filter(result => result !== '');};
			break;
		case 'Account':
			queryResult = await prisma.account.findMany({
				where: { 
					...dbQueryCondition,
					userId: {
						not: {
							in: sentToUsers
						}
					}
				}
			});
			if (queryResult.length) {return queryResult.map(result => result.userId || '').filter(result => result !== '');};
			break;
		case 'User':
			queryResult = await prisma.user.findMany({
				where: { 
					...dbQueryCondition,
					id: {
						not: {
							in: sentToUsers
						}
					}
				}
			});
			if (queryResult.length) {return queryResult.map(result => result.id || '');};
			break;
		default:
			console.error('This model is not currently satisfied for email rules');
	}

	return false;
}