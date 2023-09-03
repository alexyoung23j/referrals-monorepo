import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
} from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

// TODO: change publicProcedure to authed procedure
export const emailRouter = createTRPCRouter({
	queueEmailJob: publicProcedure
		.input(
			z.object({
				toAddress: z.string(),
				message: z.string().optional(),
				referralRequestId: z.string().optional(),
				scheduledAt: z.string().optional(),
				emailType: z.enum([
					'REFERRAL_REMINDER',
					'REFERRAL_REMINDER_NOTIFICATION',
					'REFERRAL_CONFIRMATION',
					'REFERRAL_CONFIRMATION_NOTIFICATION',
					'MESSAGE_FROM_REFERRER'
				])
			})
		)
		.mutation(async ({input, ctx}) => {
			const {
				toAddress,
				message = '',
				referralRequestId,
				scheduledAt = new Date(),
				emailType
			} = input;
			await ctx.prisma.emailJob.create({
				data:
					{
						toAddress,
						body: message,
						referralRequestId,
						attachmentUrls: [],
						toCC: [],
						emailType,
						status: 'QUEUED',
						scheduledAt
					}
			});
		}),
	createMockEmailJobEntries: publicProcedure
		.mutation(async ({ ctx }) => {
			await ctx.prisma.emailJob.createMany({
				data: [
					{
						toAddress: 'borayuksel1903@gmail.com',
						body: 'Email from referrals scheduled for NOW',
						attachmentUrls: [],
						toCC: [],
						emailType: 'REFERRAL_REMINDER',
						status: 'QUEUED',
						scheduledAt: new Date()
					},
					{
						toAddress: 'borayuksel1903@gmail.com',
						body: 'Email from referrals one minute later',
						attachmentUrls: [],
						toCC: [],
						emailType: 'REFERRAL_REMINDER',
						status: 'QUEUED',
						scheduledAt: new Date(new Date().getTime() + 60000)
					},
					{
						toAddress: 'borayuksel1903@gmail.com',
						body: 'Email from referrals with Attachment',
						attachmentUrls: ['https://okljwshacdhibnfafwxw.supabase.co/storage/v1/object/public/resumes/Bora_Yuksel_Resume.pdf'],
						toCC: [],
						emailType: 'REFERRAL_REMINDER',
						status: 'QUEUED'
					}
				]
			});
		}),
	deleteMockEmails: publicProcedure
		.mutation(async ({ ctx }) => {
			await ctx.prisma.emailJob.deleteMany({
				where: {
					OR: [
						{
							status: 'SENT'
						},
						{
							status: 'FAILED'
						}
					]
				}
			});
		})
});