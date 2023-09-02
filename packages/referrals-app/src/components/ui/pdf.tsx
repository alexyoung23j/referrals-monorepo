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
	const pdfContainerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState<number>(1);
	const { data: { publicUrl: resumeUrl } = {} } =
		trpc.supabase.getResume.useQuery({ fileName });

	const updateScale = () => {
		const containerWidth = pdfContainerRef?.current?.clientWidth;
		if (!containerWidth) {return;}
		const pdfWidth = !isBigScreen ? 595 : 300; // Default PDF width in points (8.27 inches)
		const calculatedScale = containerWidth / pdfWidth;
		setScale(calculatedScale);
	};

	function onDocumentLoadSuccess(pdf: PDFDocumentProxy): void {
		const {numPages: nextNumPages} = pdf;
		setNumPages(nextNumPages);
		updateScale();
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
		const rescalePdf = updateScale;
		window.addEventListener('resize', rescalePdf);

		return () => {
				  window.removeEventListener('resize', rescalePdf);
		};
	  });
	
	const renderLoader = () => (
		<div className='flex justify-center mx-auto'><RSpinner size='medium' /></div>
	);

	const renderError = () => (
		<div className='flex justify-center mx-auto'><span>Failed to load PDF.</span></div>
	);

	return (
		<div className='flex flex-col gap-3 p-5'>
			<div className='max-w-fit border-textSecondary border-2 rounded border-opacity-100'>
				<Document file={resumeUrl} options={options} loading={renderLoader} error={renderError}>
					<Thumbnail width={250} pageNumber={1} pageIndex={1} onClick={() => inputRef.current && inputRef.current.click()} />
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
					<div ref={pdfContainerRef} id='pdf-container' className='flex flex-col items-center max-w-full h-full overflow-hidden'>
						<ScrollArea className='flex flex-col w-full overflow-hidden'>
							<Document 
								file={resumeUrl}
								options={options}
								className='w-full gap-3 justify-center items-center overflow-hidden max-h-full max-w-full'
								onLoadSuccess={onDocumentLoadSuccess}
								loading={renderLoader}
								error={renderError}
							>
								{Array.from(new Array(numPages), (el, index) => (
									<div key={`page_container_${index}`}>
										<Page
											scale={scale}
											className='flex justify-center w-full'
											key={`page_${index + 1}`}
											pageNumber={index + 1}
											renderTextLayer={false}
											renderAnnotationLayer={false}
										/>
										{index < numPages - 1 && <Separator />}
									</div>
								))}
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
