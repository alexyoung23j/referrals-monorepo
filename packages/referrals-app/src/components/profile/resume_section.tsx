import { RButton } from '~/components/ui/button';
import { api } from '~/utils/api';
import { RText } from '~/components/ui/text';
import { RLabeledSection } from '~/components/ui/labeled_section';
import { RInput } from '~/components/ui/input';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { RTextarea } from '~/components/ui/textarea';
import { useToast } from '~/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import { useMediaQuery } from 'react-responsive';
const PDFRenderer = dynamic(() => import('../ui/pdf'), { ssr: false });

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
	process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? ''
);

export default function ResumeSection() {
	const { toast } = useToast();
	const { data: profileData } = api.profiles.getProfile.useQuery(undefined, {
		refetchOnWindowFocus: false,
	});
	const updateProfile = api.profiles.updateProfile.useMutation();
	const [localResumeUrl, setLocalResumeUrl] = useState('');

	const onFileSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const { files } = event.target;

		let file;
		if (files && files[0]) {
			file = files[0] || null;
		}
		if (!file) {
			return;
		}

		try {
			const id = uuidv4();

			const { data, error } = await supabase.storage
				.from('resumes')
				.upload(`${id}/${file.name}`, file);

			if (error) {
				console.error(error);
				toast({
					title: 'Error uploading image.',
					duration: 1500,
				});
				return;
			}

			const path = data?.path;
			const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${path}`;

			setLocalResumeUrl(url);
			await updateProfile.mutateAsync({
				resumeUrl: url,
			});
		} catch (e) {
			console.error('Error while generating presigned URL: ', e);
		}
	};

	const isMobileScreenQuery = useMediaQuery({
		query: '(max-width: 840px)',
	});

	useEffect(() => {
		if (profileData?.resumeUrl) {
			setLocalResumeUrl(profileData.resumeUrl);
		}
	}, [profileData]);

	if (!profileData) {
		return null; // TODO: Loading state here
	}

	return (
		<div className="my-[24px] flex w-full flex-col gap-[36px]">
			<div className="flex w-full justify-between">
				<RText fontSize="h2" fontWeight="medium">
					Resume
				</RText>
			</div>
			<div
				className={`flex flex-col gap-4 ${
					isMobileScreenQuery && 'items-center'
				}`}
			>
				<RText color="tertiary">
					{localResumeUrl?.split('/').pop()?.replace(/%20/g, ' ')}
				</RText>
				<div
					className={`flex max-w-fit ${
						isMobileScreenQuery && 'flex-col'
					} items-center gap-3`}
				>
					<PDFRenderer
						fileName={localResumeUrl ?? null}
						preUploadedResumeUrl={localResumeUrl ?? null}
						size="md"
					/>
					<RButton
						iconName="upload"
						variant="secondary"
						onFileChange={onFileSubmit}
					>
						Upload pdf
					</RButton>
				</div>
			</div>
		</div>
	);
}
