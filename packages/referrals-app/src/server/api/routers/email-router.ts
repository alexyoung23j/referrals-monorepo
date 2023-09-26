import { z } from 'zod';
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '~/server/api/trpc';
import { EmailJobStatus, EmailJobType } from '@prisma/client';
import {
	constructEmailMessage,
	constructEmailSubject,
} from '~/utils/emailTemplates';
import { TRPCError } from '@trpc/server';

// TODO: change publicProcedure to authed procedure
export const emailRouter = createTRPCRouter({
	queueEmailJob: publicProcedure
		.input(
			z.object({
				toAddress: z.string().optional(),
				message: z.string().optional(),
				referralRequestId: z.string().optional(),
				scheduledAt: z.date().optional(),
				emailType: z.enum([
					'REFERRAL_REMINDER',
					'REFERRAL_REMINDER_NOTIFICATION',
					'REFERRAL_CONFIRMATION',
					'REFERRAL_CONFIRMATION_NOTIFICATION',
					'MESSAGE_FROM_REFERRER',
					'JOB_LINK',
				]),
				seekerUserId: z.string(),
				referrerName: z.string(),
				referrerEmail: z.string(),
				referralsLink: z.string(),
				meetingScheduleLink: z.string().optional(),
				jobTitle: z.string().optional(),
				specialJobPostingLink: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const {
				message = '',
				referralRequestId = '0',
				scheduledAt,
				emailType,
				seekerUserId,
				referrerName,
				referrerEmail,
				referralsLink,
				meetingScheduleLink = '',
				jobTitle = '',
				specialJobPostingLink = '',
			} = input;

			if (!referrerEmail || !referrerName) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Cannot send email without email and name.',
				});
			}

			const referralRequest = await ctx.prisma.referralRequest.findFirst({
				where: {
					id: referralRequestId,
				},
				include: {
					company: true,
				},
			});

			if (!referralRequest) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Cannot find ReferralRequest with id: ${referralRequestId}`,
				});
			}

			const { company } = referralRequest;

			const seeker = await ctx.prisma.userProfile.findUnique({
				where: {
					id: seekerUserId,
				},
			});

			if (!seeker) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Cannot find requester with id: ${seekerUserId}`,
				});
			}

			let emailBody = '';
			let subject = '';
			try {
				emailBody = constructEmailMessage(emailType, {
					seekerName: seeker.firstName ?? '',
					seekerEmail: seeker.publicEmail ?? '',
					referrerName,
					referrerEmail,
					companyName: company.name,
					// TODO: link to a proper page when implemented
					referralsLink,
					message,
					role: jobTitle,
					meetingScheduleLink,
					specialJobPostingLink,
				});
				subject = constructEmailSubject(emailType, {
					seekerName: seeker.firstName ?? '',
					referrerName,
					companyName: company.name,
				});
			} catch (e) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Something went wrong when constructing email subject or body: ${e}`,
				});
			}

			// may or may not need nonLoggedInUser later
			const nonLoggedInUser = await ctx.prisma.nonLoggedInUser.upsert({
				where: {
					email: referrerEmail,
				},
				update: {},
				create: {
					email: referrerEmail,
					name: referrerName,
					ReferralRequest: {
						connect: [{ id: referralRequest.id }],
					},
				},
				include: {
					ReferralRequest: true,
				},
			});

			// If new reminder or referred before reminder email is sent, cancel email job
			if (
				emailType === EmailJobType.REFERRAL_REMINDER ||
				emailType === EmailJobType.REFERRAL_CONFIRMATION
			) {
				const existingEmailjob = await ctx.prisma.emailJob.findFirst({
					where: {
						referralRequestId,
						emailType: EmailJobType.REFERRAL_REMINDER,
						toAddress: referrerEmail,
						status: EmailJobStatus.QUEUED,
					},
				});
				if (existingEmailjob) {
					await ctx.prisma.emailJob.update({
						where: {
							id: existingEmailjob.id,
						},
						data: {
							status: EmailJobStatus.CANCELLED,
						},
					});
				}
			}

			const seekerResumeUrl = seeker?.resumeUrl;

			let toAddress;
			const toCC = [];

			let resumeAttachment;
			switch (emailType) {
				case EmailJobType.MESSAGE_FROM_REFERRER:
				case EmailJobType.JOB_LINK:
				case EmailJobType.REFERRAL_CONFIRMATION_NOTIFICATION:
				case EmailJobType.REFERRAL_REMINDER_NOTIFICATION:
					toAddress = seeker?.publicEmail ?? '';
					break;
				case EmailJobType.REFERRAL_REMINDER:
					seeker?.publicEmail && toCC.push(seeker.publicEmail);
					if (seekerResumeUrl) {
						resumeAttachment = {
							filename: `${seeker.firstName} ${seeker.lastName}\'s Resume.pdf`,
							url: seekerResumeUrl,
						};
					}
				case EmailJobType.REFERRAL_CONFIRMATION:
					toAddress = referrerEmail;
					break;
			}

			const emailAttachments = resumeAttachment ? [resumeAttachment] : [];
			// TODO: create subject in the EmailJob model
			await ctx.prisma.emailJob.create({
				data: {
					toAddress,
					body: emailBody,
					referralRequestId,
					toCC,
					emailType,
					status: EmailJobStatus.QUEUED,
					scheduledAt,
					attachments: {
						create: emailAttachments,
					},
					subject,
				},
			});

			if (emailType === EmailJobType.REFERRAL_CONFIRMATION) {
				try {
					emailBody = constructEmailMessage(
						EmailJobType.REFERRAL_CONFIRMATION_NOTIFICATION,
						{
							seekerName: seeker.firstName ?? '',
							referrerName,
							referrerEmail,
							companyName: company.name,
							message,
							role: jobTitle,
						}
					);
					subject = constructEmailSubject(
						EmailJobType.REFERRAL_CONFIRMATION_NOTIFICATION,
						{
							seekerName: seeker.firstName ?? '',
							referrerName,
							companyName: company.name,
						}
					);
				} catch (e) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: `Something went wrong when constructing email subject or body: ${e}`,
					});
				}
				await ctx.prisma.emailJob.create({
					data: {
						toAddress: seeker?.publicEmail ?? '',
						body: emailBody,
						referralRequestId,
						toCC,
						emailType:
							EmailJobType.REFERRAL_CONFIRMATION_NOTIFICATION,
						status: EmailJobStatus.QUEUED,
						scheduledAt,
						subject,
					},
				});
			}
		}),
});
