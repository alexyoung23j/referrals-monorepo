import { RButton } from '~/components/ui/button';
import { api } from '~/utils/api';
import { RText } from '~/components/ui/text';
import { RLabeledSection } from '~/components/ui/labeled_section';
import { RInput } from '~/components/ui/input';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { RTextarea } from '~/components/ui/textarea';
import { useToast } from '~/components/ui/use-toast';
import { useRouter } from 'next/router';
import { RCard } from '../ui/card';
import { useMediaQuery } from 'react-responsive';

export default function BillingSection({ id }: { id: string }) {
	const router = useRouter();

	const isMobileScreen = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const { data: stripeCustomerData } =
		api.stripe.getUserSubscriptionStatus.useQuery();

	const createStripeCustomerAndPortal =
		api.stripe.createBillingPortal.useMutation();

	const onUpgradeClick = async () => {
		const res = await createStripeCustomerAndPortal.mutateAsync();
		void router.push(res.billingUrl as string);
	};

	const hasStripeSubscription =
		stripeCustomerData?.stripeCustomer?.StripeSubscriptions?.some(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(subscription: any) => subscription.status === 'active'
		) ?? false;

	return (
		<div
			className="my-[24px] flex w-full flex-col gap-[36px] pb-[280px]"
			id={id}
		>
			<div className="flex w-full justify-between">
				<RText fontSize="h2" fontWeight="medium">
					Account
				</RText>
			</div>
			<RCard>
				<div
					className={`flex  justify-between ${
						isMobileScreen
							? 'flex-col items-start gap-5'
							: 'items-center'
					}`}
				>
					<div className="flex flex-col gap-2">
						<RText fontSize="h3" fontWeight="bold">
							{hasStripeSubscription
								? 'Pro Subscription'
								: 'Free Subscription'}
						</RText>
						{hasStripeSubscription ? (
							<RText color="secondary">{`Subscribed on ${new Date(
								stripeCustomerData?.stripeCustomer
									?.StripeSubscriptions[0]?.createdAt as Date
							).toLocaleDateString('en-US', {
								month: '2-digit',
								day: '2-digit',
								year: '2-digit',
							})}`}</RText>
						) : (
							<RText color="secondary">
								Create and share unlimited referral requests
								with Pro for $9.99/month.
							</RText>
						)}
					</div>
					<RButton onClick={onUpgradeClick}>
						{hasStripeSubscription
							? 'Manage Subscription'
							: 'Subscribe to Pro'}
					</RButton>
				</div>
			</RCard>
		</div>
	);
}
