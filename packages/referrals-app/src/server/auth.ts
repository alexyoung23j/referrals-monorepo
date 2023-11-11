import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { type GetServerSidePropsContext } from 'next';
import {
	getServerSession,
	type NextAuthOptions,
	type DefaultSession,
} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '~/env.mjs';
import { prisma } from '~/server/db';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
	interface Session extends DefaultSession {
		user: DefaultSession['user'] & {
			id: string;
			// ...other properties
			// role: UserRole;
			isAdmin: boolean;
		};
	}

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

const isUserAdmin = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: { admin: true },
	});
	return !!user?.admin;
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	callbacks: {
		session: async ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
				isAdmin: await isUserAdmin(user.id)
			},
		}),
	},
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		}),
	],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext['req'];
	res: GetServerSidePropsContext['res'];
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions);
};
