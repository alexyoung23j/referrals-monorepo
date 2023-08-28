import { PageLayout } from '~/components/layouts';
import dynamic from 'next/dynamic';

import { RButton } from '~/components/ui/button';
import { RowTable } from '~/components/ui/card';
import Icon from '~/components/ui/icons';
import { RPopover } from '~/components/ui/popover';
import { RTag } from '~/components/ui/tag';
import { RText } from '~/components/ui/text';

const LinkPageLayout = dynamic(() => import('~/components/layouts/shareable'), {
	ssr: false,
});

export default function LinkPage() {
	return (
		<LinkPageLayout
			avatarUrl="https://github.com/shadcn.png"
			currentRoleTitle="Software Engineer"
			location="New York City"
			profileName="Alex Young"
			education="University of California, San Diego"
			linkedInUrl="https://www.linkedin.com/in/alexyoung23j/"
			twitterUrl="https://twitter.com/alex_j_young"
			personalSiteUrl="https://alexjyoung.me"
			resumeUrl="https://drive.google.com/file/u/4/d/19yzdrnjfqD2tc8vO4GabsJuhcEmqZCV0/view?usp=sharing"
			jobExperience={[
				{
					jobTitle: 'Founder',
					company: 'Giterate',
					companyLogoUrl:
						'https://assets.commonwealth.im/c36edf04-1463-4cb2-b106-f70e6dee9ffb.png',
					startDate: '2021',
				},
				{
					jobTitle: 'Software Engineer II',
					company: 'Google',
					companyLogoUrl:
						'https://assets.commonwealth.im/1681c68d-daee-45ef-9481-242325942611.png',
					startDate: '2019',
					endDate: '2021',
				},
				{
					jobTitle: 'Software Engineer II',
					company: 'Google',
					companyLogoUrl:
						'https://assets.commonwealth.im/1681c68d-daee-45ef-9481-242325942611.png',
					startDate: '2011',
					endDate: '2021',
				},
				{
					jobTitle: 'Software Engineer II',
					company: 'Google',
					companyLogoUrl:
						'https://assets.commonwealth.im/1681c68d-daee-45ef-9481-242325942611.png',
					startDate: '2012',
					endDate: '2021',
				},
				{
					jobTitle: 'Software Engineer II',
					company: 'Google',
					companyLogoUrl:
						'https://assets.commonwealth.im/1681c68d-daee-45ef-9481-242325942611.png',
					startDate: '2009',
					endDate: '2021',
				},
				{
					jobTitle: 'Software Engineer II',
					company: 'Google',
					companyLogoUrl:
						'https://assets.commonwealth.im/1681c68d-daee-45ef-9481-242325942611.png',
					startDate: '2007',
					endDate: '2021',
				},
				{
					jobTitle: 'Software Engineer II',
					company: 'Google',
					companyLogoUrl:
						'https://assets.commonwealth.im/1681c68d-daee-45ef-9481-242325942611.png',
					startDate: '2006',
					endDate: '2021',
				},
			]}
		>
			<div className="h-full w-full">
				<RowTable
					columns={[
						{
							label: (
								<RPopover
									trigger={
										<div className="flex gap-1">
											<RText
												fontSize="b2"
												color="tertiary"
											>
												Label
											</RText>
											<Icon
												name="info"
												size="12px"
												color="#94a3b8"
											/>
										</div>
									}
									content={<div>Popover content</div>}
								/>
							),
							minWidth: 200,
							hideOnMobile: false,
						},
						{
							label: 'label2',
							iconName: 'chevrons-up-down',
							hideOnMobile: true,
						},
						{
							label: 'label3',
							iconName: 'chevrons-up-down',
							hideOnMobile: false,
						},
					]}
					rows={[
						{
							label: 'row1',
							cells: [
								{ content: 'cell12', label: 'label1' },
								{ content: 'cell22', label: 'label2' },
								{
									content: <RTag label="tag" />,
									label: 'label22',
								},
							],
						},
						{
							label: 'row2',
							cells: [
								{ content: 'cell1', label: 'label1' },
								{ content: 'cell2', label: 'label2' },
								{
									content: <RTag label="tag" />,
									label: 'label2',
								},
							],
						},
					]}
				/>
			</div>
		</LinkPageLayout>
	);
}
