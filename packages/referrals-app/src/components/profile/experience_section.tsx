/* eslint-disable indent */
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
import { v4 as uuidv4 } from 'uuid';
import { RowTable } from '../ui/card';
import Image from 'next/image';
import Icon from '../ui/icons';
import ActivityModal from '../modals/activity_modal';
import { type Company, CompanyCombobox } from '../company/company_combobox';
import DatePicker from '../ui/date_picker';
import { Checkbox } from '../ui/checkbox';
import { useMediaQuery } from 'react-responsive';
import { type JobExperience } from '@prisma/client';

export default function ExperienceSection() {
	const { toast } = useToast();

	const { data: profileData, refetch } = api.profiles.getProfile.useQuery(
		undefined,
		{
			refetchOnWindowFocus: false,
		}
	);
	const createJobExperience = api.profiles.createJobExperience.useMutation();
	const updateJobExperience = api.profiles.updateJobExperience.useMutation();
	const deleteJobExperience = api.profiles.deleteJobExperience.useMutation();
	const jobExperiences = profileData?.JobExperience;
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [company, setCompany] = useState<Company | null>(null);
	const [companyIsCreatedByUser, setCompanyIsCreatedByUser] = useState(false);
	const [startDate, setStartDate] = useState<Date | undefined>(
		new Date(new Date().setFullYear(new Date().getFullYear() - 1))
	);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [currentlyWorkHere, setCurrentlyWorkHere] = useState(false);
	const [jobTitle, setJobTitle] = useState('');
	const [selectedExperience, setSelectedExperience] = useState<
		| (JobExperience & {
				company: {
					name: string;
					logo: string;
				};
		  })
		| null
	>(null);

	const isMobile = useMediaQuery({
		query: '(max-width: 840px)',
	});

	const createExperience = async () => {
		try {
			await createJobExperience.mutateAsync({
				title: jobTitle,
				startDate: startDate as Date,
				endDate,
				currentlyWorkHere,
				isCreatedByUser: companyIsCreatedByUser,
				companyLogo: company?.logo as string,
				companyName: company?.name as string,
			});
			toast({
				title: 'Added job experience!',
				duration: 2000,
			});
			refetch();

			setAddModalOpen(false);
			setCompany(null);
			setCompanyIsCreatedByUser(false);
			setStartDate(
				new Date(new Date().setFullYear(new Date().getFullYear() - 1))
			);
			setEndDate(undefined);
			setCurrentlyWorkHere(false);
			setJobTitle('');
		} catch (e) {
			console.log(e);
			toast({
				title: 'Failed to add experience. Make sure all fields are filled out.',
				duration: 2000,
			});
		}
	};

	const editExperience = async () => {
		try {
			await updateJobExperience.mutateAsync({
				id: selectedExperience?.id as string,
				title: jobTitle,
				startDate: startDate as Date,
				endDate,
				currentlyWorkHere,
				isCreatedByUser: companyIsCreatedByUser,
				companyLogo: company?.logo as string,
				companyName: company?.name as string,
			});
			toast({
				title: 'Updated job experience!',
				duration: 2000,
			});
			refetch();

			setEditModalOpen(false);
			setCompany(null);
			setCompanyIsCreatedByUser(false);
			setStartDate(
				new Date(new Date().setFullYear(new Date().getFullYear() - 1))
			);
			setEndDate(undefined);
			setCurrentlyWorkHere(false);
			setJobTitle('');
		} catch (e) {
			console.log(e);
			toast({
				title: 'Failed to edit experience.',
				duration: 2000,
			});
		}
	};

	const deleteExperience = async () => {
		try {
			await deleteJobExperience.mutateAsync({
				id: selectedExperience?.id as string,
			});
			toast({
				title: 'Deleted job experience.',
				duration: 2000,
			});
			refetch();

			setEditModalOpen(false);
			setCompany(null);
			setCompanyIsCreatedByUser(false);
			setStartDate(
				new Date(new Date().setFullYear(new Date().getFullYear() - 1))
			);
			setEndDate(undefined);
			setCurrentlyWorkHere(false);
			setJobTitle('');
		} catch (e) {
			console.log(e);
			toast({
				title: 'Failed to delete experience.',
				duration: 2000,
			});
		}
	};

	useEffect(() => {
		if (selectedExperience) {
			setCompany({
				name: selectedExperience?.company?.name,
				logo: selectedExperience?.company?.logo,
				domain: '',
			});
			setJobTitle(selectedExperience?.title as string);
			setStartDate(new Date(selectedExperience?.startDate || Date.now()));
			setEndDate(new Date(selectedExperience?.endDate || Date.now()));
			setCurrentlyWorkHere(
				selectedExperience?.currentlyWorkHere as boolean
			);
		}
	}, [selectedExperience]);

	return (
		<div className="my-[24px] flex w-full flex-col gap-[36px]">
			<ActivityModal
				headerText="Add experience"
				subtitleText="Add a previous work experience to your profile."
				bottomRowContent={
					<RButton iconName="check" onClick={createExperience}>
						Save experience
					</RButton>
				}
				open={addModalOpen}
				onOpenChange={setAddModalOpen}
				sections={[
					{
						type: 'two-column',
						content: [
							<RLabeledSection
								label="Company*"
								body={
									<CompanyCombobox
										onCreateCompany={(company) => {
											setCompany(company);
											setCompanyIsCreatedByUser(true);
										}}
										onSelectCompany={(company) => {
											setCompany(company);
										}}
									/>
								}
								key="2"
							/>,
							<RLabeledSection
								label="Job title*"
								body={
									<RInput
										placeholder="enter title"
										value={jobTitle}
										onChange={(e) => {
											setJobTitle(e.target.value);
										}}
										required
									/>
								}
								key="3"
							/>,
						],
					},
					{
						type: 'two-column',
						content: [
							<RLabeledSection
								label="Start Date*"
								body={
									<DatePicker
										date={startDate}
										setDate={setStartDate}
									/>
								}
								key="2"
							/>,
							<RLabeledSection
								label={
									currentlyWorkHere ? 'End Date' : 'End Date*'
								}
								body={
									<DatePicker
										date={endDate}
										setDate={setEndDate}
										disabled={currentlyWorkHere}
									/>
								}
								key="3"
							/>,
						],
					},
					{
						type: 'single-column',
						content: [
							<div
								className="flex items-center gap-3"
								key="current"
							>
								<Checkbox
									checked={currentlyWorkHere}
									onCheckedChange={(checked) => {
										if (typeof checked === 'boolean') {
											setCurrentlyWorkHere(checked);
											if (checked) {
												setEndDate(undefined);
											}
										}
									}}
								/>
								<RText>I currently work here</RText>
							</div>,
						],
					},
				]}
			/>
			<ActivityModal
				headerText="Edit experience"
				subtitleText="Edit a previous work experience saved on your profile."
				bottomRowContent={
					<div className="flex gap-2">
						<RButton iconName="check" onClick={editExperience}>
							Save changes
						</RButton>
						<RButton
							iconName="trash"
							variant="secondary"
							onClick={deleteExperience}
						>
							Delete
						</RButton>
					</div>
				}
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				sections={[
					{
						type: 'two-column',
						content: [
							<RLabeledSection
								label="Company*"
								body={
									<CompanyCombobox
										onCreateCompany={(company) => {
											setCompany(company);
											setCompanyIsCreatedByUser(true);
										}}
										onSelectCompany={(company) => {
											setCompany(company);
										}}
										initialCompany={
											selectedExperience?.company as Company
										}
									/>
								}
								key="2"
							/>,
							<RLabeledSection
								label="Job title*"
								body={
									<RInput
										placeholder="enter title"
										value={jobTitle}
										onChange={(e) => {
											setJobTitle(e.target.value);
										}}
										required
									/>
								}
								key="3"
							/>,
						],
					},
					{
						type: 'two-column',
						content: [
							<RLabeledSection
								label="Start Date*"
								body={
									<DatePicker
										date={startDate}
										setDate={setStartDate}
									/>
								}
								key="2"
							/>,
							<RLabeledSection
								label={
									currentlyWorkHere ? 'End Date' : 'End Date*'
								}
								body={
									<DatePicker
										date={endDate}
										setDate={setEndDate}
										disabled={currentlyWorkHere}
									/>
								}
								key="3"
							/>,
						],
					},
					{
						type: 'single-column',
						content: [
							<div
								className="flex items-center gap-3"
								key="current"
							>
								<Checkbox
									checked={currentlyWorkHere}
									onCheckedChange={(checked) => {
										if (typeof checked === 'boolean') {
											setCurrentlyWorkHere(checked);
											if (checked) {
												setEndDate(undefined);
											}
										}
									}}
								/>
								<RText>I currently work here</RText>
							</div>,
						],
					},
				]}
			/>
			<div className="flex w-full justify-between">
				<RText fontSize="h2" fontWeight="medium">
					Experience
				</RText>
				<RButton
					iconName="plus"
					onClick={() => {
						setAddModalOpen(true);
					}}
				>
					Add new
				</RButton>
			</div>
			{jobExperiences && jobExperiences?.length > 0 ? (
				<RowTable
					mobileWidth={840}
					columns={[
						{
							label: 'Company',
							hideOnMobile: false,
							minWidth: isMobile ? 300 : 300,
						},
						{
							label: 'Job title',
							hideOnMobile: true,
							minWidth: isMobile ? 100 : 300,
						},
						{
							label: 'Tenure',
							hideOnMobile: false,
							minWidth: isMobile ? 100 : 300,
						},
						{ label: '', hideOnMobile: false },
					]}
					rows={
						jobExperiences?.map((jobExperience) => {
							const row = {
								label: jobExperience.id,
								cells: [
									{
										label: 'company',
										content: (
											<div className="flex items-center gap-3">
												<Image
													src={
														jobExperience?.company
															?.logoUrl as string
													}
													alt="Logo"
													height={24}
													width={24}
												/>
												<RText fontWeight="medium">
													{
														jobExperience.company
															?.name
													}
												</RText>
											</div>
										),
									},
									{
										label: 'job title',
										content: (
											<RText color="secondary">
												{jobExperience.title}
											</RText>
										),
									},
									{
										label: 'tenue',
										content: (
											<RText fontWeight="light">
												{jobExperience.startDate
													? new Date(
															jobExperience.startDate
													  ).toLocaleDateString(
															'en-US',
															{
																month: 'short',
																year: 'numeric',
															}
													  )
													: ''}{' '}
												-{' '}
												{jobExperience.endDate
													? new Date(
															jobExperience.endDate
													  ).toLocaleDateString(
															'en-US',
															{
																month: 'short',
																year: 'numeric',
															}
													  )
													: 'Present'}
											</RText>
										),
									},
									{
										label: 'actions',
										content: (
											<Icon
												name="pencil"
												size="22"
												className="cursor-pointer"
												color="#64748b"
												onClick={() => {
													setSelectedExperience({
														...jobExperience,
														company:
															jobExperience.company
																? {
																		name: jobExperience
																			.company
																			.name,
																		logo:
																			jobExperience
																				.company
																				.logoUrl ||
																			'',
																  }
																: {
																		name: 'none',
																		logo: '',
																  },
													});
													setEditModalOpen(true);
												}}
											/>
										),
									},
								],
							};
							return row;
						}) ?? []
					}
				/>
			) : (
				<div className="mt-[20px] flex w-full">
					<RText color="tertiary">
						Add past work experience to your profile.
					</RText>
				</div>
			)}
		</div>
	);
}
