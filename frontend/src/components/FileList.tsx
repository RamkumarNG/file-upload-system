import React, { useRef } from 'react';
import { DocumentIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

import { FileType, PageMetaInfoType, StorageInfo } from './types/types';
import ProgressBar from './progress-bar/ProgressBar';
import { Icon } from './icon/icon';
import PopOver from './popover/Popover';

import './style.scss';

export const FileList: React.FC<{
  files?: FileType[];
  pageMetaInfo?: PageMetaInfoType;
  progressBarInfo?: StorageInfo;
  isLoading: boolean;
  error: any;
  onNextPage: () => void;
  onPrevPage: () => void;
  handleDelete: (id: string) => void;
  handleDownload: (file: string, original_filename: string) => void;
  downloadMutation: any;
  deleteMutation: any;
}> = ({
  files = [],
  pageMetaInfo = {},
  progressBarInfo={},
  onNextPage,
  onPrevPage,
  isLoading,
  error,
  handleDelete,
  handleDownload,
  downloadMutation,
  deleteMutation,
}) => {

  const toolTipRef = useRef<HTMLDivElement>(null);
  const [popOverOpen, setPopoverOpen] = React.useState(false);

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
              <p className="text-sm text-red-700">Failed to load files. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div
        className='flex mb-4'
      >
        <h2 className="text-xl font-semibold text-gray-900 w-full">Uploaded Files</h2>
        <ProgressBar
          title="Smart Space Saver in Action"
          progressnfo={progressBarInfo}
          tooltip={
            <>
              <Icon
                ref={toolTipRef}
                icon='info'
                size='16'
                onMouseEnter={() => setPopoverOpen(true)}
                onMouseLeave={() => setPopoverOpen(false)}
              />
              <PopOver
                triggerRef={toolTipRef}
                isPopoverOpen={popOverOpen}
                placement='top'
                offsetX={110}
                offsetY={7}
              >
                <span className='pop-over-text mt-10'>Tracks saved storage from duplicate files.</span>
              </PopOver>
            </>
          }
        />
      </div>
      {!files || files.length === 0 ? (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading a file
          </p>
        </div>
      ) : (
        <>
          <div
            className="mt-6 flow-root max-h-[10000vh] overflow-y-auto"
          >
            <ul className="-my-5 divide-y divide-gray-200">
              {files.map((file) => (
                <li key={file.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <DocumentIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.original_filename}
                      </p>
                      <p className="text-sm text-gray-500">
                        {file.file_type} • {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(file.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(file.file, file.original_filename)}
                        disabled={downloadMutation.isPending}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex justify-center items-center space-x-2">
            <button
              className="
                inline-flex items-center
                px-3 py-2
                border border-transparent
                shadow-sm
                text-sm leading-4 font-medium
                rounded-md
                text-white bg-primary-600
                hover:bg-primary-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none
              "
              disabled={!pageMetaInfo?.prev}
              onClick={onPrevPage}
            >
              Prev
            </button>
            <button
                className="
                  inline-flex items-center
                  px-3 py-2
                  border border-transparent
                  shadow-sm
                  text-sm leading-4 font-medium
                  rounded-md
                  text-white bg-primary-600
                  hover:bg-primary-700
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none
                "
                disabled={!pageMetaInfo?.next}
                onClick={onNextPage}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 