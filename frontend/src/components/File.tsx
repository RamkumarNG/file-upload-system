import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { fileService } from "../services/fileService";
import { SideBar } from "./sidebar/sidebar";
import { FileUpload } from "./FileUpload";
import { FileList } from "./FileList";
import { FileType, PageMetaInfoType, StorageInfo } from "./types/types";
import { getPageNumFromUrl } from "./sidebar/transformers";
import { DATA } from "./sidebar/a";

interface FilterItem {
  field: string;
  value: string[];
  type: string;
}

interface FiltersState {
  selectedFields: string[];
  filters: FilterItem[];
  search: string;
}

interface FileQueryResponse {
  results: FileType[];
  meta: any;
}


export const File: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filters, setFilters] = useState<FiltersState>({
    selectedFields: [],
    filters: [],
    search: '',
  });
  
  const {
    data: searchResults,
    isLoading: filesIsLoading,
    error: filesError,
    refetch: refecthFiles,
  } = useQuery<FileQueryResponse, Error, FileQueryResponse, [string, any, string, number]>({
    queryKey: ['files', filters?.filters, filters?.search, pageNum] as [string, any, string, number],
    queryFn: fileService.getFiles,
  });
  
  const {data: metaInfo, isLoading: metaInfoIsLoading, error: metaInfoError, refetch: refetchMetaInfo} = useQuery({
    queryKey: ['metaInfo'],
    queryFn: fileService.getMetaInfo,
  })

  const {data: storageInfo, isLoading: spaceInfoIsLoading, error: spaceInfoError, refetch: refecthStorageInfo} = useQuery({
    queryKey: ['spaceInfo'],
    queryFn: fileService.getStorage,
  });
  
  // Mutation for deleting files
  const deleteMutation = useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['spaceInfo'] });
    },
  });
  
  // Mutation for downloading files
  const downloadMutation = useMutation({
    mutationFn: ({ fileUrl, filename }: { fileUrl: string; filename: string }) =>
      fileService.downloadFile(fileUrl, filename),
  });
  
  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };
  
  const handleDownload = async (fileUrl: string, filename: string) => {
    try {
      await downloadMutation.mutateAsync({ fileUrl, filename });
    } catch (err) {
      console.error('Download error:', err);
    }
  };
  
  const onFilterApply = (data: { selectedValue: string; checked: boolean; field: string }) => {
    if (!metaInfo) return;

    if (data.checked) {
      handleCheck(data);
    } else {
      handleUncheck(data);
    }
  };

  const handleCheck = (data: { selectedValue: string; field: string }) => {
    if (data.field === 'uploaded_at') {
        handleDateFilterCheck(data);
      } else {
        handleRegularFilterCheck(data);
      }
  };

  const handleDateFilterCheck = (data: { selectedValue: string; field: string }) => {
    setFilters((prev: any) => {
      const nonDateFilters = prev.filters.filter((fil: any) => fil.field !== data.field);
      const newDateFilter = {
        field: data.field,
        type: "exact",
        value: [data.selectedValue]
      };
      return {
        ...prev,
        filters: [...nonDateFilters, newDateFilter]
      };
    });
  };

  const handleRegularFilterCheck = (data: { selectedValue: string; field: string }) => {
    const alreadySelected = filters?.selectedFields?.find((key) => key === data.field);

    if (alreadySelected) {
      setFilters((prev) => ({
        ...prev,
        filters: prev.filters.map((prevFilter) => 
          prevFilter.field === data.field 
          ? { ...prevFilter, value: [...prevFilter.value, data.selectedValue] }
          : prevFilter
        )
      }));
    } else {
      setFilters((prev) => {
        const prevSelectedValues = prev.filters.find((filter) => filter.field === data.field)?.value ?? [];
        const newFilter = {
          field: data.field,
          type: "exact",
          value: [...prevSelectedValues, data.selectedValue],
        };
        return {
          ...prev,
          selectedFields: [...prev.selectedFields, data.field],
          filters: [...prev.filters, newFilter],
        };
      });
    }
    setSelectedValues((prev) => [...prev, data.selectedValue]);
  };

  const handleUncheck = (data: { selectedValue: string; field: string }) => {
    setFilters((prev) => {
      const updatedFilters = prev.filters
        .map((prevFilter) => {
          if (prevFilter.field === data.field) {
            const updatedVals = prevFilter.value.filter((val) => val !== data.selectedValue);
              return updatedVals.length 
              ? { ...prevFilter, value: updatedVals } 
              : undefined;
            }
            return prevFilter;
          })
          .filter((filter): filter is FilterItem => filter !== undefined);

          const updatedSelectedFields = prev.selectedFields.filter(
            (field) => field !== data.field || 
            updatedFilters.some((f) => f.field === field && f.value.length > 0)
          );

          return {
            ...prev,
            selectedFields: updatedSelectedFields,
            filters: updatedFilters,
          };
    });

    setSelectedValues((prev) => prev?.filter((prevField) => prevField !== data.selectedValue));
  };
  
  const onSearchClick = (data: { value: string }) => {
    setFilters((prev) => ({
      ...prev,
      search: data?.value
    }))   
  };
  
  const onSearchClear = () => {
    setFilters((prev) => ({
      ...prev,
      search: ""
    }))
  };
  
  const onFilterClear = () => {
    setFilters((prev) => ({
      ...prev,
      selectedFields: [],
      filters: [],
    }))
    setSelectedValues([]);
  };
  
  const handleNextPage = () => {
    setPageNum(getPageNumFromUrl(pageMetaInfo?.next));
  };
  
  const handlePrevPage = () => {
    setPageNum(getPageNumFromUrl(pageMetaInfo?.prev));
  };

  const onHandleDateApply = (field: string, checked: boolean) => {
    onFilterApply({
      selectedValue: `${fromDate}&${toDate}`,
      checked: checked,
      field
    })
  };
  
  const pageMetaInfo = useMemo<PageMetaInfoType>(() => {
    return {
      count: searchResults?.meta?.count,
      next: searchResults?.meta?.next,
      prev: searchResults?.meta?.previous
    }
  }, [searchResults]);

  const progressBarInfo = useMemo<StorageInfo>(() => {
    if (storageInfo?.total_uploaded && storageInfo?.savings !== undefined) {
        const percentage = storageInfo.total_uploaded > 0
            ? Math.round((storageInfo.savings / storageInfo.total_uploaded) * 100)
            : 0;
        return {
          ...storageInfo,
          percentage
        };
    }
    return {
      ...storageInfo,
      percentage: 0
    };
}, [storageInfo]);
  
  useEffect(() => {
    refecthFiles();
  }, [filters, refecthFiles, pageNum]);

  useEffect(() => {
    refecthStorageInfo();
    refetchMetaInfo();
  }, [refreshKey]);
  
  return (
    <div className='flex'>
      <div className='w-[25%] py-6'>
        <SideBar
          metaInfo={metaInfo ?? {}}
          onFilterApply={onFilterApply}
          onHandleDateApply={onHandleDateApply}
          onSearchClick={onSearchClick}
          onFilterClear={onFilterClear}
          onSearchClear={onSearchClear}
          selectedValues={selectedValues}
          setFromDate={setFromDate}
          setToDate={setToDate}
          isLoading={metaInfoIsLoading}
          error={metaInfoError}
        />
      </div>
      <div className="px-4 py-6 sm:px-4 flex-1">
        <div className="space-y-6">
          <div className="bg-white shadow sm:rounded-lg">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        <div className="bg-white shadow sm:rounded-lg">
          <FileList
            key={refreshKey}
            files={searchResults?.results as FileType[]}
            pageMetaInfo={pageMetaInfo}
            isLoading={filesIsLoading}
            error={filesError}
            handleDelete={handleDelete}
            handleDownload={handleDownload}
            downloadMutation={downloadMutation}
            deleteMutation={deleteMutation}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            progressBarInfo={progressBarInfo}
          />
        </div>
      </div>
    </div>
  </div>
)};
