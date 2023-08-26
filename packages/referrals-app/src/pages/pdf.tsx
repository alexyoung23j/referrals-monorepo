'use client';
import { type NextPage } from 'next';
import { useState } from 'react';
import { pdfjs, Document, Page, Thumbnail } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { RButton } from '~/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.js',
	import.meta.url,
).toString();

type PDFFile = string | File | null;

const options = {
	cMapUrl: '/cmaps/',
	standardFontDataUrl: '/standard_fonts/',
};
  

const PDFPage: NextPage = () => {
	const [file, setFile] = useState<PDFFile>('./sample.pdf');
	const [fullScreen, setFullScreen] = useState<boolean>(false);
	const [pdf, setPdf] = useState<PDFDocumentProxy>();
	const [numPages, setNumPages] = useState<number>(-1);
	const [currentPage, setCurrentPage] = useState<number>(1);

	function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
		const { files } = event.target;
	
		if (files && files[0]) {
		  setFile(files[0] || null);
		}
	  }

	function onDocumentLoadSuccess(loadedPdf: PDFDocumentProxy): void {
		const {numPages: nextNumPages} = loadedPdf;
		setPdf(loadedPdf);
		setNumPages(nextNumPages);
	  }

	return (
		<div className='flex flex-col gap-3 p-5'>
			<div className="Example__container__load">
				<label htmlFor="file">Load from file:</label>{' '}
				<input onChange={onFileChange} type="file" />
			</div>

			{!fullScreen ? 
				(
					<div className='max-w-fit border-yellow-800 border-8'>
						<Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
							<Thumbnail pageNumber={1} pageIndex={1} onClick={() => setFullScreen(true)} />
						</Document>
					</div> 
				) : 
				(
					<div>
						<div className='max-w-fit border-yellow-800 border-8'>
							<Document file={file} options={options}>
								<Page key={`page_${currentPage}`} pageNumber={currentPage} renderTextLayer={false} renderAnnotationLayer={false}/>
							</Document>
						</div>
						<div>
							<RButton disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage-1)}>Prev</RButton>
							<RButton disabled={currentPage === numPages} onClick={() => setCurrentPage(currentPage+1)}>Next</RButton>
						</div>
					</div> 
				)
			}
		</div>
	);
};

export default PDFPage;
