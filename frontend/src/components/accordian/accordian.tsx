import React, { forwardRef } from "react";
import { useState, useRef } from "react";
import { Icon } from "../icon/icon";

import './accordian.css';

interface AccordionProps {
    title: string,
    iconSize: string,
    expanded?: boolean
    disabled?: boolean,
    children: React.ReactNode,
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onCick?: () => void,
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>((props, ref) => {

  const { title, children, isOpen, setIsOpen } = props;
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={ref}
        className="flex justify-between items-center cursor-pointer pl-4 pr-8 pb-2 pt-2"
        role="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className='option-header bold text-[15px]'>{title}</span>
        <Icon
          icon={!isOpen ? 'caret-down' : 'caret-up'}
          size='12'
          disabled={false}
          className=''
        />
      </div>
      <div
        ref={contentRef}
        className="accordion-content-wrapper transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight : 0,
        }}
      >
        <div className='flex flex-row'>
          {children}
        </div>
      </div>
      </>
    )
});