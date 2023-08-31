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
});
