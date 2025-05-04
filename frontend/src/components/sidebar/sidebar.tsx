import React, { useState, useMemo } from 'react';

import { extractMetaInfoData } from './transformers';

import { FilterAccordion } from '../FilterAccordion';
import { Search } from '../search/search';
import { SideBarPropsType, SideBarOptions } from '../types/types';

import './sidebar.css';
import { DATA } from './a';


export const SideBar: React.FC<SideBarPropsType> = (props) => {

  const {
    metaInfo = {},
    selectedValues = [],
    setFromDate,
    setToDate,
    isLoading,
    error,
    onFilterApply,
    onHandleDateApply,
    onSearchClick,
    onFilterClear,
    onSearchClear,
  } = props;
  
  const [searchInputMap, setSearchInputMap] = useState<Record<string, string>>({});

  const setInputValueForKey = (key: string, val: string) => {
    setSearchInputMap((prev) => ({ ...prev, [key]: val }));
  };

  const onHandleSearchClear = () => {
    setSearchInputMap({});
    onSearchClear();
  };
  

  const sideBarOpts = useMemo<SideBarOptions>(() => {
      return extractMetaInfoData(DATA ?? []);
  }, []);

  console.log("sidebarOpts", sideBarOpts);

  if (isLoading) {
      return (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      );
  }

  if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Failed to load search items. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      );
  }

  return (
      <div className='filter-container shadow flex flex-col pt-4 sm:rounded-lg'>
        <div
          className='filter-header flex justify-between items-center'
        >
          <h1>Search</h1>
          <button
            className='clear-all-btn'
            onClick={onHandleSearchClear}
          >
            CLEAR
          </button>
        </div>
        <div>
        <div>
          {sideBarOpts?.searchFields?.map((search) => (
            <Search
              key={search?.title}
              title={search?.title}
              setInputValue={(val) => setInputValueForKey(search?.title, val)}
              inputValue={searchInputMap[search?.title] || ""}
              size="16"
              onSearchClick={onSearchClick}
            />
            ))}
          </div>
        </div>
        <div className='filter-header flex justify-between items-center'>
          <h1>Filters</h1>
          <button
            className='clear-all-btn'
            onClick={onFilterClear}
          >
            CLEAR ALL
          </button>
        </div>
        <div>
          {sideBarOpts?.filterFields?.map((filter) => (
            <FilterAccordion
              key={filter?.title}
              title={filter?.title}
              options={filter?.values}
              field={filter?.field}
              type={filter?.type}
              onFilterApply={onFilterApply}
              selectedValues={selectedValues}
              setFromDate={setFromDate}
              setToDate={setToDate}
              onHandleDateApply={onHandleDateApply}
            />
          ))}
        </div>
      </div>
    )
};