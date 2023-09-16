import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';
import { generateValidLink } from '~/utils/links';

export const linkRouter = createTRPCRouter({
	createLink: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				referralRequestId: z.string().optional(),
				createdByLoggedInUser: z.boolean(),
				blurb: z.string().optional(),
				blurbAuthorName: z.string().optional(),
				createdById: z.string().optional(),
				isDefaultLinkForRequest: z.boolean().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const newLink = await generateValidLink(input);
			return newLink;
		}),

	updateLink: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				blurb: z.string().optional(),
				blurbAuthorName: z.string().optional(),
				createdById: z.string().optional(),
				createdByLoggedInUser: z.boolean().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const updatedLink = await ctx.prisma.link.update({
				where: { id: input.id },
				data: {
					blurb: input.blurb,
					blurbAuthorName: input.blurbAuthorName,
					createdById: input.createdById,
				},
			});

			return updatedLink;
		}),
	getLinkMutation: publicProcedure
		.input(
			z.object({
				referralRequestId: z.string(),
				linkId: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			let link;
			if (input.linkId) {
				link = await ctx.prisma.link.findUnique({
					where: { id: input.linkId },
				});
			} else {
				link = await ctx.prisma.link.findFirst({
					where: {
						referralRequestId: input.referralRequestId,
						isDefaultLinkForRequest: true,
					},
				});
			}

			if (!link) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Link not found',
				});
			}

			return link;
		}),
});
