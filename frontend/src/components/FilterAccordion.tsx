import React, { useRef, useState } from "react";

import { Accordion } from "./accordian/accordian";
import { FilterAccordionPropTypes } from "./types/types";

export const FilterAccordion: React.FC<FilterAccordionPropTypes> = (props) => {
  const { title, options, field, type = "", selectedValues = [], setFromDate, setToDate, onFilterApply, onHandleDateApply } = props;
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  return (
    <>
      <Accordion
        title={title}
        iconSize='12'
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        ref={triggerRef}
      >
      <div
        className='flex flex-col pl-4 pr-4'
      >
      {
        type.toLowerCase() === "date" ? (
        <div className="flex flex-col gap-2 pl-4">
          <div className="flex items-center gap-2">
            <label htmlFor="from-date" className="text-sm font-medium w-10">From:</label>
              <input
                id="from-date"
                type="date"
                className="text-sm border rounded px-2 py-0.5 h-8"
                onChange={(e: any) => setFromDate(e.target.value)}
              />
            </div>
        
            <div className="flex items-center gap-2">
              <label htmlFor="to-date" className="text-sm font-medium w-10">To:</label>
              <input
                id="to-date"
                type="date"
                className="text-sm border rounded px-2 py-0.5 h-8"
                onChange={(e: any) => setToDate(e.target.value)}
              />
            </div>
            <button
              className="mt-2 self-end bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded"
              onClick={() => {
                onHandleDateApply(field, true);
                setIsOpen(!isOpen)}
              }
            >
              Apply
            </button>
        </div>
        ) : (
          <>
            {options?.map((opt) => (
              <div className='flex flex-row'>
                <input
                  type='checkbox'
                  value={opt.value}
                  checked={selectedValues?.includes(opt?.value)}
                  onChange={(e) =>
                    onFilterApply({
                      selectedValue: (e.target as HTMLInputElement).value,
                      checked: (e.target as HTMLInputElement).checked,
                      field,
                    })
                  }                                  
                />
                <label
                  className='pl-4 options'
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </>
        )
      }
      </div>
    </Accordion>
  </>
)};