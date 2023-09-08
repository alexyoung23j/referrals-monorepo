import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';

const fetchCompanies = async (keyword: string) => fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${keyword}`).then(res => res.json());

export const company = createTRPCRouter({
	getCompanyList: publicProcedure
		.input(
			z.object({
				keyword: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { keyword } = input;

			if (!keyword) {return [];};

			return fetchCompanies(keyword);
		})
});