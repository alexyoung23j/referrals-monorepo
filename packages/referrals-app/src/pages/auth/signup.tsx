import { RButton } from '~/components/ui/button';
import { RText } from '~/components/ui/text';
import { signIn, signOut, useSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';
import { redirectIfAuthed } from '~/utils/routing';
import { ReferLinkLogo } from '~/components/ui/icons';
import { useRouter } from 'next/router';

export const googleLogo = () => {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M1.53857 9.99992C1.53857 5.75839 5.16188 2.30762 9.6155 2.30762C11.4142 2.30762 13.1167 2.85876 14.5389 3.90146L12.662 6.22352C11.7826 5.57882 10.7291 5.23802 9.6155 5.23802C6.8585 5.23802 4.6155 7.37421 4.6155 9.99992C4.6155 12.6256 6.8585 14.7618 9.6155 14.7618C11.836 14.7618 13.723 13.3762 14.3733 11.4652H9.6155V8.53469H17.6924V9.99992C17.6924 14.2415 14.0691 17.6922 9.6155 17.6922C5.16188 17.6922 1.53857 14.2415 1.53857 9.99992Z"
				fill="#F8F8F8"
			/>
		</svg>
	);
};

export const githubLogo = () => {
	return (
		<svg
			width="28"
			height="28"
			viewBox="0 0 28 28"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M14 2.75C7.64625 2.75 2.5 7.89625 2.5 14.25C2.5 19.3387 5.79187 23.6369 10.3631 25.1606C10.9381 25.2612 11.1538 24.9162 11.1538 24.6144C11.1538 24.3412 11.1394 23.4356 11.1394 22.4725C8.25 23.0044 7.5025 21.7681 7.2725 21.1212C7.14313 20.7906 6.5825 19.77 6.09375 19.4969C5.69125 19.2812 5.11625 18.7494 6.07938 18.735C6.985 18.7206 7.63188 19.5687 7.8475 19.9137C8.8825 21.6531 10.5356 21.1644 11.1969 20.8625C11.2975 20.115 11.5994 19.6119 11.93 19.3244C9.37125 19.0369 6.6975 18.045 6.6975 13.6462C6.6975 12.3956 7.14312 11.3606 7.87625 10.5556C7.76125 10.2681 7.35875 9.08937 7.99125 7.50812C7.99125 7.50812 8.95438 7.20625 11.1538 8.68687C12.0738 8.42812 13.0513 8.29875 14.0288 8.29875C15.0063 8.29875 15.9838 8.42812 16.9038 8.68687C19.1031 7.19187 20.0662 7.50812 20.0662 7.50812C20.6987 9.08937 20.2962 10.2681 20.1812 10.5556C20.9144 11.3606 21.36 12.3812 21.36 13.6462C21.36 18.0594 18.6719 19.0369 16.1131 19.3244C16.53 19.6837 16.8894 20.3737 16.8894 21.4519C16.8894 22.99 16.875 24.2262 16.875 24.6144C16.875 24.9162 17.0906 25.2756 17.6656 25.1606C22.2081 23.6369 25.5 19.3244 25.5 14.25C25.5 7.89625 20.3538 2.75 14 2.75Z"
				fill="#F8F8F8"
			/>
		</svg>
	);
};

export default function SignInPage() {
	const router = useRouter();
	return (
		<div
			className="flex h-[100vh] w-full flex-col items-center justify-center"
			style={{
				background: 'linear-gradient(to bottom, #ffffff 25%, #E2F1FF)',
			}}
		>
			<div
				className="absolute left-6 top-6 cursor-pointer"
				onClick={() => {
					router.push('/');
				}}
			>
				<ReferLinkLogo size={24} />
			</div>
			<div className="flex flex-col items-center justify-center gap-[24px]">
				<RText fontSize="h1" fontWeight="medium">
					Create{' '}
					<RText fontSize="h1" fontWeight="bold">
						ReferLink
					</RText>{' '}
					Account
				</RText>
				<RButton
					className="w-full"
					onClick={() => {
						void signIn('google', {
							callbackUrl: '/profile',
						});
					}}
				>
					{googleLogo()}Sign up with Google
				</RButton>
				<RText fontSize="b1" color="secondary" className="mt-[8px]">
					By signing up you agree to our{' '}
					<RText
						fontSize="b1"
						fontWeight="medium"
						color="secondary"
						className="mt-[8px] underline"
					>
						Terms of Service.
					</RText>
				</RText>
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
