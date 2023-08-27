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
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
	process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? ''
);

type PDFFile = string | File | null;

const options = {
	cMapUrl: '/cmaps/',
	standardFontDataUrl: '/standard_fonts/',
};

type PDFRendererTypes = {
	fileName: string;
}

export const PDFRenderer = ({fileName}: PDFRendererTypes) => {
	const isBigScreen = useMediaQuery({ query: '(min-width: 800)' });
	const [file, setFile] = useState<PDFFile>(fileName);
	const [numPages, setNumPages] = useState<number>(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const [scale, setScale] = useState<number>(1);


	// useEffect(() => {
	// 	console.log('RESUME DATA', resumeData);
	// }, [resumeData]);

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

	useEffect(() => {
		const updateScale = () => {
			const container = document.getElementById('pdf-container');
			const containerWidth = container && container.clientWidth;
			if (!containerWidth) {return;}
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

	useEffect(() => {
		const downloadImage = async () => {
			return supabase.storage.from('resumes').getPublicUrl(fileName);
		};
		downloadImage().then(({data}) => {
			setFile(data.publicUrl);
		});
	}, [fileName]);
	
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
				<DialogContent className={'min-w-[40%] max-sm:w-screen max-sm:h-screen h-[95%] border-textSecondary border-4 rounded border-opacity-100 p-0 pb-5'}>
					<DialogHeader />
					<div id='pdf-container' className='flex flex-col items-center max-w-full h-full overflow-hidden'>
						<ScrollArea className='flex flex-col w-full overflow-hidden'>
							<Document file={file} options={options} className='w-full gap-3 justify-center items-center overflow-hidden max-h-full max-w-full' onLoadSuccess={onDocumentLoadSuccess} loading={renderLoader}>
								{Array.from(new Array(numPages), (el, index) => (
									<div key={`page_container_${index}`}>
										<Page scale={isBigScreen ? 1.25 : scale} className='flex justify-center w-full' key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} />
										{index < numPages - 1 && <Separator />}
									</div>
								))}
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