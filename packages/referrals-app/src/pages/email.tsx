import { type NextPage } from 'next';
import { RButton } from '~/components/ui/button';
import { trpc } from '~/utils/api';

const ComponentsPage: NextPage = () => {
	const { mutate: createMockEmailJobEntries } =
		trpc.email.createMockEmailJobEntries.useMutation();
	const { mutate: deleteMockEmails } =
		trpc.email.deleteMockEmails.useMutation();

	const handleGenerateMockEmailJobs = async () => {
		await createMockEmailJobEntries();
	};

	const handleDeleteMockEmailJobs = async () => {
		await deleteMockEmails();
	};

	return (
		<div className="flex flex-col gap-3 p-5">
			<RButton onClick={handleGenerateMockEmailJobs}>Generate Mock EmailJob Entries</RButton>
			<RButton onClick={handleDeleteMockEmailJobs}>Delete Test Entries</RButton>
		</div>
	);
};

export default ComponentsPage;