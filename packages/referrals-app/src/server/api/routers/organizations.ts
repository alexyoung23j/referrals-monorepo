import { ReferralRequestStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
	subscriptionProcedure,
} from '~/server/api/trpc';
import { generateValidLink } from '~/utils/links';

export const organizationsRouter = createTRPCRouter({
	getOrganizations: protectedProcedure.query(async ({ ctx, input }) => {
		const organizations = await ctx.prisma.organization.findMany({
			include: {
				users: true,
			},
		});

		return organizations;
	}),
	joinOrganization: protectedProcedure
		.input(z.object({ organizationId: z.string(), password: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const organization = await ctx.prisma.organization.findUnique({
				where: {
					id: input.organizationId,
				},
			});

			if (!organization) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Organization not found',
				});
			}

			if (organization.password !== input.password) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Invalid password',
				});
			}

			try {
				await ctx.prisma.userOrganization.create({
					data: {
						userId: ctx.session.user.id,
						organizationId: input.organizationId,
					},
				});
			} catch (e) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Unable to add user to organization',
				});
			}
		}),
	leaveOrganization: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const organization = await ctx.prisma.userOrganization.findFirst({
				where: {
					userId: ctx.session.user.id,
					organizationId: input.organizationId,
				},
			});

			if (!organization) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found in organization',
				});
			}

			try {
				await ctx.prisma.userOrganization.delete({
					where: {
						userId_organizationId: {
							userId: ctx.session.user.id,
							organizationId: input.organizationId,
						},
					},
				});
			} catch (e) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Unable to remove user from organization',
				});
			}
		}),
});
