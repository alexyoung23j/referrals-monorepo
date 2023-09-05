import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';

export const profileRouter = createTRPCRouter({
	/**
	 * Gets a user's profile information
	 */
	getProfile: protectedProcedure.query(({ ctx }) => {
		const { user } = ctx.session;

		if (!user) {
			return null;
		}

		return ctx.prisma.userProfile.findFirst({
			where: {
				userId: user.id,
			},
		});
	}),
	updateProfile: protectedProcedure
		.input(
			z.object({
				firstName: z.string(),
				lastName: z.string(),
				publicEmail: z.string(),
				currentRoleTitle: z.string(),
				linkedInUrl: z.string(),
				twitterUrl: z.string(),
				personalSiteUrl: z.string(),
				currentLocation: z.string(),
				education: z.string(),
				defaultBlurb: z.string(),
				avatarUrl: z.string(),
			})
		)
		.mutation(({ ctx, input }) => {
			const { user } = ctx.session;

			if (!user) {
				return null;
			}

			try {
				return ctx.prisma.userProfile.updateMany({
					where: {
						userId: user.id,
					},
					data: {
						...input,
					},
				});
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Something went wrong',
				});
			}
		}),
});
