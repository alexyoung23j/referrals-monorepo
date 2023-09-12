import { z } from 'zod';
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '~/server/api/trpc';
import { EmailJobStatus, EmailJobType } from '@prisma/client';
import { constructEmailMessage } from '~/utils/emailTemplates';
import { TRPCError } from '@trpc/server';

// TODO: change publicProcedure to authed procedure
export const emailRouter = createTRPCRouter({
	queueEmailJob: protectedProcedure
		.input(
			z.object({
				toAddress: z.string().optional(),
				message: z.string().optional(),
				referralRequestId: z.string().optional(),
				scheduledAt: z.string().optional(),
				emailType: z.enum([
					'REFERRAL_REMINDER',
					'REFERRAL_REMINDER_NOTIFICATION',
					'REFERRAL_CONFIRMATION',
					'REFERRAL_CONFIRMATION_NOTIFICATION',
					'MESSAGE_FROM_REFERRER'
				]),
				seekerUserId: z.string(),
				referrerName: z.string(),
				referrerEmail: z.string(),
				companyName: z.string()
			})
		)
		.mutation(async ({input, ctx}) => {
			const {
				message,
				referralRequestId,
				scheduledAt = new Date(),
				emailType,
				seekerUserId,
				referrerName,
				referrerEmail,
				companyName
			} = input;
			
			const seeker = await ctx.prisma.user.findUnique(
				{
					where: {
						id: seekerUserId
					}
				});

			let emailBody = '';

			try {
				emailBody = message || constructEmailMessage(emailType, {
					seekerName: seeker?.name ?? '',
					seekerEmail: seeker?.email ?? '',
					referrerName,
					referrerEmail,
					companyName,
					// TODO: link to a proper page when implemented
					referralsLink: 'http://localhost:3000/email'
				});
			} catch(e) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Something went wrong when constructing email body: ${e}`,
				});
			}

			const seekerUserProfile = await ctx.prisma.userProfile.findFirst(
				{
					where: {
						userId: seekerUserId
					}
				}
			);
			const seekerResumeUrl = seekerUserProfile?.resumeUrl;

			let toAddress;
			const toCC = [];

			// TODO: create a new EmailAttachment schema that consists of email URL and filename, and set relation
			const attachmentUrls = [];
			switch(emailType) {
				case EmailJobType.MESSAGE_FROM_REFERRER:
				case EmailJobType.REFERRAL_CONFIRMATION_NOTIFICATION:
				case EmailJobType.REFERRAL_REMINDER_NOTIFICATION:
					toAddress = seeker?.email ?? '';
					break;
				case EmailJobType.REFERRAL_REMINDER:
					toAddress = referrerEmail;
					seeker?.email && toCC.push(seeker.email);
					seekerResumeUrl && attachmentUrls.push(seekerResumeUrl);
					break;
				default:
					toAddress = referrerEmail;
			}

			await ctx.prisma.emailJob.create({
				data:
					{
						toAddress,
						body: emailBody,
						referralRequestId,
						attachmentUrls,
						toCC,
						emailType,
						status: EmailJobStatus.QUEUED,
						scheduledAt
					}
			});
		}),
	cancelEmailJob: publicProcedure
		.input(
			z.object({
				emailId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const {emailId} = input;
			await ctx.prisma.emailJob.update({
				where: {
					id: emailId
				},
				data:
					{
						status: EmailJobStatus.QUEUED,
					}
			});
		}),
	editEmailJob: publicProcedure
		.input(
			z.object({
				emailId: z.string(),
				fields: z.object({}).optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const {emailId} = input;
			await ctx.prisma.emailJob.update({
				where: {
					id: emailId
				},
				data:
					{
						status: EmailJobStatus.QUEUED,
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
		}),
	getUsersToRefer: publicProcedure
		.query(async ({ ctx }) => {
			const users = await ctx.prisma.user.findMany();
			return users.map(user => ({value: user.id, content: user.name}));
		}),
});