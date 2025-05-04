import React, { useRef, useState } from 'react';
import './style.scss';
import PopOver from '../popover/Popover';
import { StorageInfo } from '../types/types';

interface ProgressBarProps {
  progressnfo: StorageInfo;
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  title?: string;
  striped?: boolean;
  animated?: boolean;
  tooltip?: React.ReactNode;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progressnfo = {},
  height = 12,
  showPercentage = true,
  color = '#4CAF50',
  backgroundColor = '#f5f5f5',
  borderRadius = 4,
  title='',
  tooltip = null,
}) => {
  
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [popOverOpen, setPopoverOpen] = useState(false);

  const normalizedProgress = Math.min(100, Math.max(0, progressnfo?.percentage || 0));

  return (
    <div className='progress-bar-container'>
      {title && (
        <span className='progress-bar-title'>{title}</span>
      )}
      <div
        className='progress-bar-background'
        style={{
          height: `${height}px`,
          backgroundColor,
          borderRadius: `${borderRadius}px`,
        }}
        ref={progressBarRef}
        onMouseEnter={() => setPopoverOpen(true)}
        onMouseLeave={() => setPopoverOpen(false)}
      >
        <PopOver
          isPopoverOpen={popOverOpen}
          triggerRef={progressBarRef}
          placement='top'
          offsetY={7}
        >
          <div className="card-wrapper w-64 p-3">
            <ul className="card-list flex flex-col divide-y divide-gray-200">
              <li className="card-row flex justify-between items-center py-2">
                <span className="w-32 text-gray-500">Actual Storage</span>
                <span className="font-medium text-gray-800">
                  {progressnfo?.actual_storage}&nbsp;<span className="text-xs text-gray-400">MB</span>
                </span>
              </li>
              <li className="card-row flex justify-between items-center py-2">
                <span className="w-32 text-gray-500">Savings</span>
                <span className="font-medium text-green-600">
                  {progressnfo?.savings}&nbsp;<span className="text-xs text-gray-400">MB</span>
                </span>
              </li>
              <li className="card-row flex justify-between items-center py-2">
                <span className="w-32 text-gray-500">Total Uploaded</span>
                <span className="font-medium text-blue-600">
                  {progressnfo?.total_uploaded}&nbsp;<span className="text-xs text-gray-400">MB</span>
                </span>
              </li>
            </ul>
          </div>
        </PopOver>
        <div
          className='progress-bar-fill animated striped'
          style={{
            width: `${normalizedProgress}%`,
            backgroundColor: color,
            borderRadius: `${borderRadius}px`,
          }}
        >
        </div>
      </div>
      {showPercentage && (
        <div className='progress-bar-label'>
          {normalizedProgress}%
        </div>
      )}
      {tooltip && <div className="tooltip">{tooltip}</div>}
    </div>
  )

};

export default ProgressBar;