import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';

// TODO: change publicProcedure to authed procedure
export const supabase = createTRPCRouter({
	uploadResume: publicProcedure
		.input(
			z.object({
				fileName: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { fileName } = input;
			// TODO: get userId from context after a user logs in and start file path with the userId
			const supabase = createClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
				process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? ''
			);

			const { data, error } = await supabase.storage
				.from('resumes')
				.createSignedUploadUrl(fileName);
			if (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Failed to upload resume: ${error}`,
				});
			}
			return data;
		}),
	getResume: publicProcedure
		.input(
			z.object({
				fileName: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { fileName } = input;
			const supabase = createClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
				process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? ''
			);
			const { data } = await supabase.storage
				.from('resumes')
				.getPublicUrl(fileName);
			return data;
		}),
});
