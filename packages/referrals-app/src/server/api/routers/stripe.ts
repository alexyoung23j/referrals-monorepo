import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const stripeRouter = createTRPCRouter({
	createBillingPortal: protectedProcedure.mutation(async ({ input, ctx }) => {
		const { stripe, session, prisma } = ctx;

		let customer;

		customer = await prisma.stripeCustomer.findFirst({
			where: {
				userId: session.user.id,
			},
		});

		const stripeSubscriptions = await prisma.stripeSubscription.findMany({
			where: {
				stripeCustomerId: customer?.id,
			},
		});

		const hasActiveSubscription = stripeSubscriptions.some(
			(subscription) => subscription.status === 'active'
		);

		let checkoutSession;

		if (!customer) {
			// No customer or subscription created
			const stripeCustomer = await stripe.customers.create({
				email: ctx.session.user.email ?? undefined,
				name: ctx.session.user.name ?? undefined,
			});

			if (!stripeCustomer) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message:
						'An unexpected error occurred, please try again later.',
					// optional: pass the original error to retain stack trace
					cause: 'stripe customer not created',
				});
			}

			customer = await prisma.stripeCustomer.create({
				data: {
					userId: ctx.session.user.id,
					id: stripeCustomer.id,
					email: stripeCustomer.email,
					created: new Date(stripeCustomer.created * 1000),
				},
			});

			checkoutSession = await stripe.checkout.sessions.create({
				customer: stripeCustomer.id,
				client_reference_id: session.user?.id,
				payment_method_types: ['card'],
				mode: 'subscription',
				line_items: [
					{
						price: process.env.STRIPE_PRICE_ID,
						quantity: 1,
					},
				],
				success_url: `${
					process.env.NEXTAUTH_URL as string
				}/profile?account=true`,
				cancel_url: `${
					process.env.NEXTAUTH_URL as string
				}/profile?account=true`,
			});
		} else if (hasActiveSubscription) {
			// Customer and subscription already exists, simply return the billing portal
			checkoutSession = await stripe.billingPortal.sessions.create({
				customer: customer.id,
				return_url: `${
					process.env.NEXTAUTH_URL as string
				}/profile?account=true`,
			});
		} else {
			// Customer exists but not subscription, create subscription portal
			checkoutSession = await stripe.checkout.sessions.create({
				customer: customer.id,
				client_reference_id: session.user?.id,
				payment_method_types: ['card'],
				mode: 'subscription',
				line_items: [
					{
						price: process.env.STRIPE_PRICE_ID,
						quantity: 1,
					},
				],
				success_url: `${
					process.env.NEXTAUTH_URL as string
				}/profile?account=true`,
				cancel_url: `${
					process.env.NEXTAUTH_URL as string
				}/profile?account=true`,
			});
		}

		return { billingUrl: checkoutSession.url };
	}),
	getUserSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
		const { stripe, session, prisma } = ctx;

		const stripeCustomer = await prisma.stripeCustomer.findFirst({
			where: {
				userId: session.user.id,
			},
			include: {
				StripeSubscriptions: true,
			},
		});

		if (!stripeCustomer) {
			return {
				stripeCustomer: null,
			};
		} else {
			return {
				stripeCustomer,
			};
		}
	}),
});
