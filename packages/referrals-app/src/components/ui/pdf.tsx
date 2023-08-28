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

type PDFRendererTypes = {
	fileName: string;
};

export const PDFRenderer = ({ fileName }: PDFRendererTypes) => {
	const isBigScreen = useMediaQuery({ query: '(min-width: 800)' });
	const [numPages, setNumPages] = useState<number>(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const [scale, setScale] = useState<number>(1);
	const { data: { publicUrl: resumeUrl } = {} } =
		trpc.supabase.getResume.useQuery({ fileName });

	function onDocumentLoadSuccess({
		numPages: nextNumPages,
	}: PDFDocumentProxy): void {
		setNumPages(nextNumPages);
	}

	const handleDownload = () => {
		const pdfUrl = resumeUrl;

		// Use anchor tag to download the file
		const anchor = document.createElement('a');
		anchor.href = pdfUrl as string;
		anchor.target = '_blank';
		anchor.download = `${pdfUrl}.pdf`;
		anchor.click();
	};

	useEffect(() => {
		const updateScale = () => {
			const container = document.getElementById('pdf-container');
			const containerWidth = container && container.clientWidth;
			if (!containerWidth) {
				return;
			}
			const pdfWidth = !isBigScreen ? 595 : 300; // Default PDF width in points (8.27 inches)
			const calculatedScale = containerWidth / pdfWidth;
			setScale(calculatedScale);
		};

		updateScale();
		// Update scale on window resize
		window.addEventListener('resize', updateScale);

		return () => {
			window.removeEventListener('resize', updateScale);
		};
	}, [numPages, isBigScreen]);

	const renderLoader = () => (
		<div className="mx-auto flex justify-center">
			<RSpinner size="medium" />
		</div>
	);

	return (
		<div className="flex flex-col gap-3 p-5">
			<div className="max-w-fit rounded border-2 border-opacity-100">
				<Document
					file={resumeUrl}
					options={options}
					loading={renderLoader}
				>
					<Thumbnail
						width={250}
						pageNumber={1}
						pageIndex={1}
						onClick={() =>
							inputRef.current && inputRef.current.click()
						}
					/>
				</Document>
			</div>
			<Dialog>
				<DialogTrigger asChild>
					<input ref={inputRef} hidden />
				</DialogTrigger>
				<DialogContent
					className={
						'h-[80vh] min-w-[50%] rounded border-4 border-opacity-100 p-0 pb-5 max-sm:h-screen max-sm:w-screen'
					}
				>
					<DialogHeader />
					<div
						id="pdf-container"
						className="flex h-full max-w-full flex-col items-center overflow-hidden"
					>
						<ScrollArea className="flex w-full flex-col overflow-hidden">
							<Document
								file={resumeUrl}
								options={options}
								className="max-h-full w-full max-w-full items-center justify-center gap-3 overflow-hidden"
								onLoadSuccess={onDocumentLoadSuccess}
								loading={renderLoader}
							>
								{Array.from(
									new Array(numPages),
									(el, index) => (
										<div key={`page_container_${index}`}>
											<Page
												scale={
													isBigScreen ? 1.25 : scale
												}
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
								onClick={() => handleDownload()}
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
