import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
	createTRPCRouter,
	adminProcedure,
} from '~/server/api/trpc';
import { Prisma } from '@prisma/client';

export const admin = createTRPCRouter({
	getDBModels: adminProcedure
		.query(async () => {
			return Object.values(Prisma.ModelName);
		})
});
