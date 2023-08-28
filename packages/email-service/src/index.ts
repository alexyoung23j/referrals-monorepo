import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import express from 'express';

export const prisma = new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

function main() {
	dotenv.config();

	if (
		!process.env.GITHUB_APP_ID ||
		!process.env.GITHUB_PRIVATE_KEY ||
		!process.env.GITHUB_CLIENT_ID ||
		!process.env.GITHUB_CLIENT_SECRET ||
		!process.env.GITHUB_WEBHOOK_SECRET
	) {
		console.log('No Credentials, bot failed to start');
		return;
	}

	if (!process.env.DATABASE_URL) {
		console.log('No Database URL, bot failed to start');
		return;
	}

	const expressApp = express();
	expressApp.use(express.json({ limit: '5mb' }));

	expressApp.listen(process.env.PORT || 3001);
	console.log(
		`----------------Referalls Bot Listening on port ${process.env.PORT ?? 3001
		}----------------`
	);
}

main();