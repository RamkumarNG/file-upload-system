import React, { useState, useEffect, forwardRef, useRef } from "react";
import ReactDOM from 'react-dom';

interface PopOverProps {
	children: React.ReactNode;
	placement?: string;
	isPopoverOpen?: boolean;
	offset?: number,
	popoverStyle?: object;
	triggerRef: React.RefObject<HTMLDivElement | null>;
	offsetY?: number;
	offsetX?: number;
};

const PopOver = forwardRef<HTMLDivElement, PopOverProps>((props, ref) => {
	const {
		children,
		triggerRef,
		isPopoverOpen = false,
		placement = 'bottom',
		offset = 5,
		popoverStyle = {},
		offsetX=0,
		offsetY=0,
	} = props;

	console.log('leo', {props}, {ref});

	const popoverRef = useRef<HTMLDivElement>(null);

	if (!isPopoverOpen || !triggerRef?.current) {
		return null;
	}

	const calcOffset = () => {
		// Add null check
		if (!triggerRef.current) {
			return popoverStyle;
	}

	const triggerPos = triggerRef.current.getBoundingClientRect();
        
	// Add fallback for when popoverRef isn't ready
	const height = popoverRef.current?.clientHeight || 0;

	switch (placement) {
		case 'top':
			return { ...popoverStyle,
				bottom: `calc(100% - ${triggerPos.top - offsetY + window.scrollY}px + ${offset}px)`,
				left: triggerPos.left + window.scrollX - offsetX,
				width: triggerPos.width };
		case 'bottom':
			return { 
					...popoverStyle,
					top: document.body.clientHeight <= triggerPos.bottom + height + offset
							? triggerPos.top - height - window.scrollY - offset
							: window.scrollY + triggerPos.bottom + offset,
					left: triggerPos.left + window.scrollX,
					width: triggerPos.width 
			};
			default:
				return popoverStyle;
		}
	};

	const portalContainer = document.getElementById('popover-portal-container');
	if (!portalContainer) return null;

	return ReactDOM.createPortal(
		<div
			ref={popoverRef}
			style={{
				position: 'absolute',
				...calcOffset(),
				width: '1px'
			}}
		>
			{children}
		</div>,
		portalContainer
	);
});

export default PopOver;