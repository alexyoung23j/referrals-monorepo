import Icon, { IconName } from './icons';
import { RText } from './text';
import { useMediaQuery } from 'react-responsive';

type RCardProps = {
	elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
	children: React.ReactNode;
	className?: string;
};

export const RCard = ({
	elevation = 'none',
	children,
	...props
}: RCardProps) => {
	return (
		<div
			className={`border-border rounded-[6px] border p-4 shadow-${elevation}`}
			{...props}
		>
			{children}
		</div>
	);
};

type RowTableProps = {
	columns: Array<{
		label: string | React.ReactNode;
		onClick?: () => void;
		minWidth?: number;
		iconName?: string;
		hideOnMobile: boolean;
	}>;
	rows: Array<{
		cells: Array<{ content: React.ReactNode; label: string }>;
		label: string;
	}>;
	mobileWidth?: number;
	cardElevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
};

/**
 * The final column is pinned to the right side of the container
 * @param param0
 * @returns
 */
export const RowTable = ({
	columns,
	rows,
	mobileWidth = 640,
	cardElevation = 'none',
}: RowTableProps) => {
	const finalColumn = columns[columns.length - 1];
	const finalColumnWidth = finalColumn?.minWidth;

	const isMobile = useMediaQuery({
		query: `(max-width: ${mobileWidth}px)`,
	});

	return (
		<div className="flex w-full flex-col gap-[8px]">
			<div className="max-sm: flex justify-between pl-[32px] pr-[32px] max-sm:pl-[16px] max-sm:pr-[16px]">
				<div className="flex items-center">
					{columns
						.slice(0, columns.length - 1)
						.map((column, index) => {
							if (isMobile && column.hideOnMobile) {
								return null;
							}

							return (
								<div
									style={{ minWidth: column.minWidth }}
									key={column.label?.toString()}
									className={`flex cursor-pointer flex-row items-center gap-[4px]`}
									onClick={column?.onClick}
								>
									{typeof column.label === 'string' ? (
										<RText fontSize="b2" color="tertiary">
											{column.label}
										</RText>
									) : (
										column.label
									)}
									{column.iconName && (
										<Icon
											name={column.iconName as IconName}
											size={12}
											color="#94a3b8"
										/>
									)}
								</div>
							);
						})}
				</div>
				<div
					className={`flex flex-row items-center gap-[4px] ${finalColumnWidth} cursor-pointer`}
					onClick={finalColumn?.onClick}
				>
					<RText fontSize="b2" color="tertiary">
						{finalColumn?.label}
					</RText>
					{finalColumn?.iconName && (
						<Icon
							name={finalColumn.iconName as IconName}
							size={12}
							color="#94a3b8"
						/>
					)}
				</div>
			</div>
			<div className="flex w-full flex-col gap-[16px]">
				{rows.map((row, index) => {
					const finalCell = row.cells[row.cells.length - 1];
					const finalCellWidth =
						columns[columns.length - 1]?.minWidth;

					return (
						<RCard
							key={row.label}
							className={`border-border shadow-${cardElevation} flex w-full flex-row items-center justify-between rounded-[6px] border py-[12px] pl-[32px] pr-[32px] max-sm:pb-[6px]  max-sm:pl-[16px] max-sm:pr-[16px] max-sm:pt-[6px]`}
						>
							<div className="flex items-center">
								{row.cells
									.slice(0, row.cells.length - 1)
									.map((cell, cellIdx) => {
										if (
											isMobile &&
											columns[cellIdx]?.hideOnMobile
										) {
											return null;
										}
										return (
											<div
												style={{
													minWidth:
														columns[cellIdx]
															?.minWidth,
												}}
												key={cell.label}
											>
												{cell.content}
											</div>
										);
									})}
							</div>
							<div>
								<div
									key={finalCell?.label}
									className={`${finalCellWidth}`}
								>
									{finalCell?.content}
								</div>
							</div>
						</RCard>
					);
				})}
			</div>
		</div>
	);
};
