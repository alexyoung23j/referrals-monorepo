'use client';
import { useState, useRef, useEffect } from 'react';
import { pdfjs, Document, Page, Thumbnail } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { RButton } from '~/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from './separator';
import RSpinner from './spinner';

type PDFFile = string | File | null;

const options = {
	cMapUrl: '/cmaps/',
	standardFontDataUrl: '/standard_fonts/',
};

export const PDFRenderer = () => {
	const [file] = useState<PDFFile>('/sample.pdf');
	const [numPages, setNumPages] = useState<number>(0);
	const [scale, setScale] = useState<number>(1);
	const inputRef = useRef<HTMLInputElement>(null);

	function onDocumentLoadSuccess({numPages: nextNumPages}: PDFDocumentProxy): void {
		setNumPages(nextNumPages);
	}

	const handleDownload = () => {
		const pdfUrl = file; 
	
		// Use anchor tag to download the file
		const anchor = document.createElement('a');
		anchor.href = pdfUrl as string;
		anchor.target = '_blank';
		anchor.download = `${pdfUrl}.pdf`;
		anchor.click();
	};

	// TODO: use this to scale the PDF with the react-responsive
	// useEffect(() => {
	// 	const container = document.getElementById('pdf-container');
	// 	const containerWidth = container && container.clientWidth;
	// 	console.log('BRO', container, containerWidth);
	// 	if (!containerWidth) {return;}
	// 	const DEFAULT_PDF_WIDTH = 595;
	// 	const pdfWidth = 300; // Default PDF width in points (8.27 inches)
	// 	const calculatedScale = containerWidth / pdfWidth;
	// 	console.log('CALCULATED SCALE', calculatedScale, containerWidth);
	// 	setScale(calculatedScale);
	//   }, [numPages]);
	
	const renderLoader = () => (
		<div className='flex justify-center mx-auto'><RSpinner size='medium' /></div>);

	return (
		<div className='flex flex-col gap-3 p-5'>
			<div className='max-w-fit border-textSecondary border-2 rounded border-opacity-100'>
				<Document file={file} options={options} loading={renderLoader}>
					<Thumbnail width={250} pageNumber={1} pageIndex={1} onClick={() => inputRef.current && inputRef.current.click()} />
				</Document>
			</div> 
			<Dialog>
				<DialogTrigger asChild>
					<input ref={inputRef} hidden />
				</DialogTrigger>
				<DialogContent className="min-w-[40%] w-fit max-w-fit h-[95%] border-textSecondary border-4 rounded border-opacity-100">
					<DialogHeader />
					<div id='pdf-container' className='flex flex-col items-center max-w-full h-full overflow-hidden'>
						<ScrollArea className='flex flex-col w-full overflow-hidden'>
							<Document file={file} options={options} className='flex flex-col gap-3 justify-center items-center overflow-hidden max-h-full' onLoadSuccess={onDocumentLoadSuccess} loading={renderLoader}>
								{Array.from(new Array(numPages), (el, index) => (
									<div key={`page_container_${index}`}>
										<Page className='flex justify-center' key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} />
										{index < numPages - 1 && <Separator />}
									</div>
								))}
								{/* {renderLoader()} */}
							</Document>
						</ScrollArea>
					</div>
					<DialogFooter className='mt-auto'>
						<div className='flex gap-1 mx-auto'>
							<RButton iconName='download' variant='secondary' onClick={() => handleDownload()}>Download</RButton>						
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};