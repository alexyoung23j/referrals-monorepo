import { createTRPCRouter } from '~/server/api/trpc';
import { profileRouter } from './routers/profile';
import { supabase } from './routers/supabase_bucket';
import {company} from './routers/company';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	profiles: profileRouter,
	supabase,
	company
});

// export type definition of API
export type AppRouter = typeof appRouter;
