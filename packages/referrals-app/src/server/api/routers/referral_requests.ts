import { ReferralRequestStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';
import { generateValidLink } from '~/utils/links';

export const referralRequestRouter = createTRPCRouter({
	getRequests: protectedProcedure
		.input(
			z.object({
				userId: z.string().optional(),
				statuses: z.string().array().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const requests = await ctx.prisma.referralRequest.findMany({
				where: {
					requester: {
						id: input.userId ?? ctx.session.user.id,
					},
					status: {
						in: (input.statuses as ReferralRequestStatus[]) ?? [
							'COMMITTED',
							'COMPLETED',
							'REJECTED',
							'OPEN',
						],
					},
				},
				include: {
					company: true,
					referrer: true,
					Link: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			return requests;
		}),
	updateRequest: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				jobTitle: z.string().optional(),
				jobPostingLink: z.string().optional(),
				isAnyOpenRole: z.boolean().optional(),
				isCreatedByUser: z.boolean().optional(),
				referrerName: z.string().optional(),
				referrerEmail: z.string().optional(),
				status: z.nativeEnum(ReferralRequestStatus).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// if we have a referrer name and email create a NonLoggedInUser and link it to the request
			let referrer = null;
			if (input.referrerName && input.referrerEmail) {
				referrer = await ctx.prisma.nonLoggedInUser.findFirst({
					where: {
						email: input.referrerEmail,
					},
				});

				if (!referrer) {
					referrer = await ctx.prisma.nonLoggedInUser.create({
						data: {
							name: input.referrerName,
							email: input.referrerEmail,
						},
					});
				} else {
					await ctx.prisma.nonLoggedInUser.update({
						where: {
							id: referrer.id,
						},
						data: {
							name: input.referrerName,
						},
					});
				}
			} else if (input.referrerName) {
				referrer = await ctx.prisma.nonLoggedInUser.create({
					data: {
						name: input.referrerName as string,
					},
				});
			} else if (input.referrerEmail) {
				referrer = await ctx.prisma.nonLoggedInUser.create({
					data: {
						email: input.referrerEmail as string,
					},
				});
			}

			const updatedRequest = await ctx.prisma.referralRequest.update({
				where: { id: input.id },
				data: {
					jobTitle: input.jobTitle,
					jobPostingLink: input.jobPostingLink,
					isAnyOpenRole: input.isAnyOpenRole,
					status: input.status,
					notLoggedInReferrerId: referrer?.id,
				},
			});
			return updatedRequest;
		}),

	createRequest: protectedProcedure
		.input(
			z.object({
				companyName: z.string(),
				companyLogo: z.string().optional(),
				jobTitle: z.string().optional(),
				jobPostingLink: z.string().optional(),
				isAnyOpenRole: z.boolean(),
				isCreatedByUser: z.boolean(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Identify company
			let company = await ctx.prisma.company.findFirst({
				where: {
					name: input.companyName,
					logoUrl: input.companyLogo,
					isCreatedByUser: false,
				},
			});

			if (!company) {
				company = await ctx.prisma.company.create({
					data: {
						name: input.companyName,
						logoUrl: input.companyLogo,
						isCreatedByUser: input.isCreatedByUser,
					},
				});
			}

			// check if request already exists
			const existingRequest = await ctx.prisma.referralRequest.findFirst({
				where: {
					company: {
						id: company.id,
					},
					jobPostingLink: input.jobPostingLink,
					isAnyOpenRole: input.isAnyOpenRole,
					requester: {
						id: ctx.session.user.id,
					},
				},
			});

			if (existingRequest) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Referral request already exists!',
				});
			}

			try {
				// Create referral request
				const request = await ctx.prisma.referralRequest.create({
					data: {
						company: {
							connect: {
								id: company.id,
							},
						},
						jobTitle: input.jobTitle,
						jobPostingLink: input.jobPostingLink,
						isAnyOpenRole: input.isAnyOpenRole,
						requester: {
							connect: {
								id: ctx.session.user.id,
							},
						},
						status: 'OPEN',
					},
				});

				// Create a default link for the request
				await generateValidLink({
					userId: ctx.session.user.id,
					referralRequestId: request.id,
					createdByLoggedInUser: true,
					createdById: ctx.session.user.id,
					isDefaultLinkForRequest: true,
				});
				return request;
			} catch (e) {
				console.error(e);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Error creating request.',
				});
			}
		}),
	deleteRequest: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const request = await ctx.prisma.referralRequest.delete({
				where: {
					id: input.id,
				},
			});
			return request;
		}),
});
