import { createTRPCRouter } from '~/server/api/trpc';
import { profileRouter } from './routers/profile';
import { supabase } from './routers/supabase_bucket';
import { company } from './routers/company';
import { referralRequestRouter } from './routers/referral_requests';
import { linkRouter } from './routers/link';
import { emailRouter } from './routers/email-router';
import { stripeRouter } from './routers/stripe';
import { organizationsRouter } from './routers/organizations';
import { admin } from './routers/admin';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	profiles: profileRouter,
	supabase,
	company,
	referralRequest: referralRequestRouter,
	links: linkRouter,
	email: emailRouter,
	stripe: stripeRouter,
	organizations: organizationsRouter,
	admin,
});

// export type definition of API
export type AppRouter = typeof appRouter;
