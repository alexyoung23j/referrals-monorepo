/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from 'nanoid';
import { prisma } from '~/server/db';
import type { Link } from '@prisma/client';

interface LinkInput extends Partial<Link> {
	userId: string;
	createdByLoggedInUser: boolean;
}

export const generateValidLink = async (linkInput: LinkInput) => {
	if (!linkInput.userId) {
		throw new Error('userId is required');
	}

	let attempts = 0;
	while (attempts < 3) {
		const id = nanoid(6);
		try {
			const newLink = await prisma.link.create({
				data: {
					...linkInput,
					id,
				},
			});
			return newLink;
		} catch (error: any) {
			if (error.code === 'P2002' && error.meta.target.includes('id')) {
				attempts++;
			} else {
				throw error;
			}
		}
	}
	throw new Error('Failed to generate a unique link ID after 3 attempts');
};
