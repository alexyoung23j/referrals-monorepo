/* eslint-disable indent */
import { signIn, signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';

export default function Home() {
	return (
		<>
			<Head>
				<title>ReferLink - Job referrals faster than ever</title>
				<meta
					name="description"
					content="Find job referrals faster than ever"
				/>
				<meta
					property="og:image"
					content="https://referlink.xyz/image_preview.png"
				/>
				<link rel="icon" href="/favicon.ico" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
			</Head>
			<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
					<div>
						<Button className="rounded-md border-x-neutral-50">
							Click Me
						</Button>
						<Avatar>
							<AvatarImage src="https://github.com/shadcn.png" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
					</div>
					<div className="flex flex-col items-center gap-2">
						<p className="text-2xl text-white"></p>
						<AuthShowcase />
					</div>
				</div>
			</main>
		</>
	);
}

function AuthShowcase() {
	const { data: sessionData } = useSession();

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<p className="text-center text-2xl text-white">
				{sessionData && (
					<span>Logged in as {sessionData.user?.name}</span>
				)}
			</p>
			<button
				className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
				onClick={
					sessionData
						? () => void signOut()
						: () => {
								void signIn('google', {
									callbackUrl: '/profile',
								});
						  }
				}
			>
				{sessionData ? 'Sign out' : 'Sign in'}
			</button>
		</div>
	);
}
