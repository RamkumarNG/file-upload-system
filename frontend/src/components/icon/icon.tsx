import React, {forwardRef, HTMLAttributes} from "react";

interface IconProps extends HTMLAttributes<HTMLDivElement> {
	icon: string,
	size: string,
	className?: string,
	disabled?: boolean
	onClick?: () => void,
	divHeight?: string,
	divWidth?: string,
}

export const Icon = forwardRef<HTMLDivElement, IconProps>((props, ref) => {
	const {
		icon,
		size,
		onClick,
		className,
		disabled,
		divHeight='',
		divWidth='',
		...rest
	} = props;

	console.log('my', {ref}, {props});

	const getIconName = () => {
		let name = `/assets/icons/${icon}-${size}.svg`
		return name;
	}

	return (
		<div
			ref={ref}
			role='button'
			onClick={onClick}
			style={{
				width: divWidth,
				height: divHeight,
			}}
			{...rest}
		>
			<img
				src={getIconName()}
				alt="caret down icon"
				className="icon-svg"
				style={{
					width: size,
					height: size,
				}}
			/>
		</div>
	)
});
