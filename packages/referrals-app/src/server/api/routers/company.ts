import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '~/server/api/trpc';

const fetchCompanies = async (keyword: string) =>
	fetch(
		`https://autocomplete.clearbit.com/v1/companies/suggest?query=${keyword}`
	).then((res) => res.json());

export const company = createTRPCRouter({
	getCompanyList: publicProcedure
		.input(
			z.object({
				keyword: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { keyword } = input;

			if (!keyword) {
				return [];
			}

			return fetchCompanies(keyword);
		}),
	createCompanyObject: protectedProcedure
		.input(
			z.object({
				company: z.object({
					name: z.string(),
					logo: z.string().optional(),
					domain: z.string().optional(),
				}),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { company } = input;

			if (!company) {
				return [];
			}

			return company;
		}),
});
