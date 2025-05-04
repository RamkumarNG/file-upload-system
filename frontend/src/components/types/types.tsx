export interface FileType {
    file: string,
    id: string,
    original_filename: string,
    file_type: string,
    size: number,
    uploaded_at: string,
}

export interface PageMetaInfoType {
    count?: string;
    next?: string;
    prev?: string;
}

export interface MetaInfoType {
    filterable_fields?: any[];
}

export interface StorageInfo {
    total_uploaded?: number;
    actual_storage?: number;
    savings?: number;
    percentage?: number;
}

export interface SideBarPropsType {
    metaInfo?: MetaInfoType;
    onFilterApply: (data: {selectedValue: string, checked: boolean, field: string}) => void;
    onFilterClear: () => void;
    onSearchClick: (data: { value: string }) => void;
    onSearchClear: () => void;
    selectedValues: string[];
    setFromDate: (val: string) => void;
    setToDate: (val: string) => void;
    onHandleDateApply: (val: string, checked: boolean) => void;
    isLoading: boolean;
    error: any;
}

export interface FilterAccordionPropTypes {
    title: string;
    options?: OptionType[];
    field: string;
    type?: string;
    selectedValues: string[];
    onHandleDateApply: (val: string, checked: boolean) => void;
    setFromDate: (val: string) => void;
    setToDate: (val: string) => void;
    onFilterApply: (data: { selectedValue: string; checked: boolean, field: string }) => void;
}

export interface OptionType {
    label: string;
    value: string;
}

export interface FilterOptionType {
    label: string;
    value: string;
  }
 
export interface FilterType {
    title: string;
    values: FilterOptionType[];
    field: string,
    type: string,
}

export interface SearchType {
    title: string;
    field: string;
}

export interface SideBarOptions {
    filterFields: FilterType[];
    searchFields: SearchType[];
}