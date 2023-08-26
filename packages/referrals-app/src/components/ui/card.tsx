import Icon, { IconName } from './icons';
import { RText } from './text';

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
			className={`border-border max-w-fit rounded-[6px] border p-4 shadow-${elevation}`}
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
};

/**
 * The final column is pinned to the right side of the container
 * @param param0
 * @returns
 */
export const RowTable = ({ columns, rows }: RowTableProps) => {
	const finalColumn = columns[columns.length - 1];
	const finalColumnWidth = finalColumn?.minWidth;

	return (
		<div className="flex w-full flex-col gap-[8px]">
			<div className="flex justify-between pl-[32px] pr-[32px]">
				<div className="flex">
					{columns
						.slice(0, columns.length - 1)
						.map((column, index) => {
							const minWidth = column.minWidth
								? `min-w-[${column.minWidth}px]`
								: '';

							return (
								<div
									key={column.label?.toString()}
									className={`flex flex-row items-center gap-[4px] ${minWidth} cursor-pointer`}
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
							className="border-border flex w-full flex-row justify-between rounded-[6px] border pb-[16px] pl-[32px] pr-[32px] pt-[16px]"
						>
							<div className="flex">
								{row.cells
									.slice(0, row.cells.length - 1)
									.map((cell, cellIdx) => {
										const minWidth = columns[cellIdx]
											?.minWidth
											? `min-w-[${columns[cellIdx]?.minWidth}px]`
											: '';
										return (
											<div
												key={cell.label}
												className={`${minWidth}`}
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
