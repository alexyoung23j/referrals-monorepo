import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import express from 'express';
import { startEmailInterval } from './interval/email-interval';
import { Resend } from 'resend';

export const prisma = new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export const resend = new Resend(process.env.RESEND_API_KEY);

function main() {
	if (!process.env.RESEND_API_KEY) {
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

	startEmailInterval();
}

main();