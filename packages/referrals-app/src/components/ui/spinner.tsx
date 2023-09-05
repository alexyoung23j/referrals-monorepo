import ClipLoader from 'react-spinners/ClipLoader';

type RSpinnerProps = {
	size: 'small' | 'medium' | 'large';
	color?: string;
	className?: string;
};

const RSpinner = ({ size }: RSpinnerProps) => {
	const spinnerSize = size === 'small' ? 30 : size === 'medium' ? 50 : 80;
	return <ClipLoader color='#64748b' size={spinnerSize} />;
};

export default RSpinner;