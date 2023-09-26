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
			include: {
				JobExperience: {
					include: {
						company: true,
					},
					orderBy: {
						endDate: 'desc',
					},
				},
			},
		});
	}),
	updateProfile: protectedProcedure
		.input(
			z.object({
				firstName: z.string().optional(),
				lastName: z.string().optional(),
				publicEmail: z.string().optional(),
				currentRoleTitle: z.string().optional(),
				linkedInUrl: z.string().optional(),
				twitterUrl: z.string().optional(),
				githubUrl: z.string().optional(),
				personalSiteUrl: z.string().optional(),
				currentLocation: z.string().optional(),
				education: z.string().optional(),
				defaultMessage: z.string().optional(),
				experienceBlurb: z.string().optional(),
				avatarUrl: z.string().optional(),
				resumeUrl: z.string().optional(),
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
	createJobExperience: protectedProcedure
		.input(
			z.object({
				companyName: z.string(),
				companyLogo: z.string(),
				title: z.string(),
				startDate: z.date(),
				endDate: z.date().optional(),
				currentlyWorkHere: z.boolean(),
				isCreatedByUser: z.boolean(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { user } = ctx.session;

			const userProfile = await ctx.prisma.userProfile.findFirst({
				where: {
					userId: user.id,
				},
			});

			if (!user || !userProfile) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Something went wrong',
				});
			}

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

			try {
				return ctx.prisma.jobExperience.create({
					data: {
						title: input.title,
						startDate: input.startDate,
						endDate: input.endDate ?? null,
						currentlyWorkHere: input.currentlyWorkHere,
						userProfileId: userProfile.id,
						companyId: company.id,
					},
				});
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message:
						'Something went wrong. Make sure all fields are filled out.',
				});
			}
		}),
	updateJobExperience: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				companyName: z.string(),
				companyLogo: z.string(),
				title: z.string(),
				startDate: z.date(),
				endDate: z.date().optional(),
				currentlyWorkHere: z.boolean(),
				isCreatedByUser: z.boolean(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { user } = ctx.session;

			const userProfile = await ctx.prisma.userProfile.findFirst({
				where: {
					userId: user.id,
				},
			});

			if (!user || !userProfile) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Something went wrong',
				});
			}

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

			try {
				return ctx.prisma.jobExperience.update({
					where: {
						id: input.id,
					},
					data: {
						title: input.title,
						startDate: input.startDate,
						endDate: input.endDate ?? null,
						currentlyWorkHere: input.currentlyWorkHere,
						userProfileId: userProfile.id,
						companyId: company.id,
					},
				});
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message:
						'Something went wrong. Make sure all fields are filled out.',
				});
			}
		}),
	deleteJobExperience: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { user } = ctx.session;

			const userProfile = await ctx.prisma.userProfile.findFirst({
				where: {
					userId: user.id,
				},
			});

			if (!user || !userProfile) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Something went wrong',
				});
			}

			try {
				return ctx.prisma.jobExperience.delete({
					where: {
						id: input.id,
					},
				});
			} catch (error) {
				console.error(error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message:
						'Something went wrong. Make sure all fields are filled out.',
				});
			}
		}),
});
