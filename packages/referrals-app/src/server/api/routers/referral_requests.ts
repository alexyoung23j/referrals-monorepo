import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';
import { generateValidLink } from '~/utils/links';

export const referralRequestRouter = createTRPCRouter({
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
});
