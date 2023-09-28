import { RButton } from '~/components/ui/button';
import { RText } from '~/components/ui/text';
import { signIn, signOut, useSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';
import { redirectIfAuthed } from '~/utils/routing';
import { googleLogo } from './signup';

export default function SignInPage() {
	return (
		<div
			className="flex h-[100vh] w-full flex-col items-center justify-center"
			style={{
				background: 'linear-gradient(to bottom, #ffffff 25%, #E2F1FF)',
			}}
		>
			<div className="flex flex-col items-center justify-center gap-[24px]">
				<RText fontSize="h1" fontWeight="medium">
					Sign in to{' '}
					<RText fontSize="h1" fontWeight="bold">
						ReferLink
					</RText>{' '}
				</RText>
				<RButton
					className="w-full"
					onClick={() => {
						void signIn('google', {
							callbackUrl: '/dashboard',
						});
					}}
				>
					{googleLogo()}Sign in with Google
				</RButton>
			</div>
		</div>
	);
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
	// Redirect to Landing Page if Not Logged in

	return redirectIfAuthed({
		ctx,
		buildRedirectUrl: (session) => {
			return '/dashboard';
		},
	});
}
