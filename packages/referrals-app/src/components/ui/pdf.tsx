'use client';
import { useState, useRef } from 'react';
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

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.js',
	import.meta.url,
).toString();

type PDFFile = string | File | null;

const options = {
	cMapUrl: '/cmaps/',
	standardFontDataUrl: '/standard_fonts/',
};

export const PDFRenderer = () => {
	const [file] = useState<PDFFile>('/sample.pdf');
	const [numPages, setNumPages] = useState<number>(-1);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const inputRef = useRef<HTMLInputElement>(null);

	function onDocumentLoadSuccess(loadedPdf: PDFDocumentProxy): void {
		const {numPages: nextNumPages} = loadedPdf;
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
	

	return (
		<div className='flex flex-col gap-3 p-5'>
			<div className='max-w-fit border-textSecondary border-4 rounded border-opacity-100'>
				<Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
					<Thumbnail width={250} pageNumber={1} pageIndex={1} onClick={() => inputRef.current && inputRef.current.click()} />
				</Document>
			</div> 
			<Dialog>
				<DialogTrigger asChild>
					<input ref={inputRef} hidden />
				</DialogTrigger>
				<DialogContent className="max-w-fit h-full">
					<DialogHeader className='sm:text-center'>
						<DialogTitle>Alex Young Resume</DialogTitle>
					</DialogHeader>
					<div className='max-w-fit border-textSecondary border-4 rounded border-opacity-100'>
						<Document file={file} options={options}>
							<Thumbnail key={`page_${currentPage}`} pageNumber={currentPage}/>
						</Document>
					</div>
					<DialogFooter>
						<div className='flex gap-1'>
							<RButton onClick={() => handleDownload()}>Download</RButton>

							{numPages > 1 && (
								<div className='flex gap-1'>
									<RButton disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage-1)}>Prev Page</RButton>
									<RButton disabled={currentPage === numPages} onClick={() => setCurrentPage(currentPage+1)}>Next Page</RButton>
								</div>
							)}
						
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};