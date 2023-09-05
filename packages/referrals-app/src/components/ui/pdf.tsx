'use client';
import { useState, useRef, useEffect } from 'react';
import { Document, Page, Thumbnail } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { RButton } from '~/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from './separator';
import RSpinner from './spinner';
import { useMediaQuery } from 'react-responsive';
import { trpc } from '~/utils/api';

const options = {
	cMapUrl: '/cmaps/',
	standardFontDataUrl: '/standard_fonts/',
};

const sizeMapNumerical = {
	sm: 100,
	md: 200,
	lg: 300,
};

const sizeMapTailwind = {
	sm: 'min-w-[100px] max-w-[100px] max-h-[129px] min-h-[129px]',
	md: 'min-w-[200px] max-w-[200px] max-h-[258px] min-h-[258px]',
	lg: 'min-w-[300px] max-w-[300px] max-h-[388px] min-h-[388px]',
};

type PDFRendererTypes = {
	fileName: string;
	preUploadedResumeUrl?: string;
	size: 'sm' | 'md' | 'lg';
};

export const handleDownload = (pdfUrl: string) => {
	// Use anchor tag to download the file
	const anchor = document.createElement('a');
	anchor.href = pdfUrl as string;
	anchor.target = '_blank';
	anchor.download = `${pdfUrl}.pdf`;
	anchor.click();
};

export const PDFRenderer = ({
	fileName,
	preUploadedResumeUrl,
	size,
}: PDFRendererTypes) => {
	const isBigScreen = useMediaQuery({ query: '(min-width: 800px)' });
	const [numPages, setNumPages] = useState<number>(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const pdfContainerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState<number>(1);
	const { data: { publicUrl: resumeUrl } = {} } =
		trpc.supabase.getResume.useQuery({ fileName });

	const isMobile = useMediaQuery({
		query: '(max-width: 640px)',
	});

	const updateScale = () => {
		const containerWidth = pdfContainerRef?.current?.clientWidth;
		if (!containerWidth) {
			return;
		}
		const pdfWidth = isBigScreen ? 800 : 595; // Default PDF width in points (8.27 inches)
		const calculatedScale = containerWidth / pdfWidth;
		setScale(calculatedScale);
	};

	function onDocumentLoadSuccess(pdf: PDFDocumentProxy): void {
		const { numPages: nextNumPages } = pdf;
		setNumPages(nextNumPages);
		updateScale();
	}

	useEffect(() => {
		const rescalePdf = updateScale;
		window.addEventListener('resize', rescalePdf);

		return () => {
			window.removeEventListener('resize', rescalePdf);
		};
	});

	const renderLoader = () => (
		<div
			className={`mx-auto flex ${sizeMapTailwind[size]} items-center justify-center`}
		>
			<RSpinner size="medium" />
		</div>
	);

	const renderError = () => (
		<div
			className={`mx-auto flex ${sizeMapTailwind[size]} items-center justify-center`}
		>
			<span>Failed to load PDF.</span>
		</div>
	);

	return (
		<div className="flex flex-col">
			<div className="border-border max-w-fit cursor-zoom-in rounded border-2 border-opacity-100">
				<Document
					file={preUploadedResumeUrl ?? resumeUrl}
					options={options}
					loading={renderLoader}
					error={renderError}
				>
					<Thumbnail
						width={sizeMapNumerical[size]}
						pageNumber={1}
						pageIndex={1}
						onClick={() =>
							inputRef.current && inputRef.current.click()
						}
						className="cursor-zoom-in"
					/>
				</Document>
			</div>
			<Dialog>
				<DialogTrigger asChild>
					<input ref={inputRef} hidden />
				</DialogTrigger>
				<DialogContent
					className={
						'h-[90vh] min-w-[50%] rounded border-4 border-opacity-100 p-0 pb-5 max-sm:h-screen max-sm:w-screen'
					}
				>
					<DialogHeader />
					<div
						ref={pdfContainerRef}
						id="pdf-container"
						className="flex h-full max-w-full flex-col items-center overflow-hidden"
					>
						<ScrollArea className="flex w-full flex-col overflow-hidden">
							<Document
								file={preUploadedResumeUrl ?? resumeUrl}
								options={options}
								className="max-h-full w-full max-w-full items-center justify-center gap-3 overflow-hidden"
								onLoadSuccess={onDocumentLoadSuccess}
								loading={renderLoader}
								error={renderError}
							>
								{Array.from(
									new Array(numPages),
									(el, index) => (
										<div key={`page_container_${index}`}>
											<Page
												scale={scale}
												className="flex w-full justify-center"
												key={`page_${index + 1}`}
												pageNumber={index + 1}
												renderTextLayer={false}
												renderAnnotationLayer={false}
											/>
											{index < numPages - 1 && (
												<Separator />
											)}
										</div>
									)
								)}
							</Document>
						</ScrollArea>
					</div>
					<DialogFooter className="mt-auto">
						<div className="mx-auto flex gap-1">
							<RButton
								iconName="download"
								variant="secondary"
								onClick={() =>
									handleDownload(
										(preUploadedResumeUrl ??
											resumeUrl) as string
									)
								}
							>
								Download
							</RButton>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
