import Image from 'next/image';
import { useState } from 'react';
interface LogoProps {
	logoUrl?: string;
	size?: number;
}

export const RLogo = ({ logoUrl, size = 48 }: LogoProps) => {
	const [imgError, setImgError] = useState(false);

	const handleError = () => {
		setImgError(true);
	};

	return (
		<div>
			{imgError ? (
				<div
					style={{
						height: `${size}px`,
						width: `${size}px`,
					}}
					className="bg-grey rounded-[6px]"
				/>
			) : (
				<div
					style={{
						height: `${size}px`,
						width: `${size}px`,
					}}
					className="flex items-center justify-center"
				>
					<Image
						src={logoUrl || ''}
						alt="Logo"
						className="object-cover"
						onError={handleError}
						height={size}
						width={size}
					/>
				</div>
			)}
		</div>
	);
};
