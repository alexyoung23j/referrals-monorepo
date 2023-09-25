/* eslint-disable indent */
import ClipLoader from 'react-spinners/ClipLoader';

type RSpinnerProps = {
	size: 'xs' | 'small' | 'medium' | 'large';
	color?: string;
	className?: string;
};

const RSpinner = ({ size }: RSpinnerProps) => {
	const spinnerSize =
		size === 'xs'
			? 15
			: size === 'small'
			? 30
			: size === 'medium'
			? 50
			: 80;
	return <ClipLoader color="#64748b" size={spinnerSize} />;
};

export default RSpinner;
