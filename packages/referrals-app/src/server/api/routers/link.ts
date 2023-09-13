import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';
import { generateValidLink } from '~/utils/links';

export const linkRouter = createTRPCRouter({
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
});
