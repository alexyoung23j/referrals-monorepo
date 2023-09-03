import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
} from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';

// TODO: change publicProcedure to authed procedure
export const emailRouter = createTRPCRouter({
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