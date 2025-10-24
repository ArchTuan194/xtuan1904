import React, { useState } from 'react';
import { DownloadIcon, ImageIcon, LoadingSpinnerIcon } from './Icons';

interface ResultImageProps {
  src: string | null;
  title: string;
  onDownload: (format: 'png' | 'jpg') => void;
  isLoading?: boolean;
}

const ResultImage: React.FC<ResultImageProps> = ({ src, title, onDownload, isLoading = false }) => {
  const [format, setFormat] = useState<'png' | 'jpg'>('png');

  return (
    <div className="w-full flex flex-col">
      <h3 className="text-lg font-semibold text-center mb-2 text-brand-light">{title}</h3>
      <div className="aspect-square w-full bg-brand-dark rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600 relative">
        {isLoading ? (
          <div className="flex flex-col items-center text-brand-light/70 text-center p-2">
            <LoadingSpinnerIcon className="w-10 h-10 animate-spin mb-4" />
            <p>Generating...</p>
          </div>
        ) : src ? (
          <img src={src} alt={title} className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center text-brand-light/50 p-4 text-center">
            <ImageIcon className="w-12 h-12" />
            <p className="mt-2 text-sm">Result will appear here</p>
          </div>
        )}
      </div>
      {src && !isLoading && (
        <div className="mt-4 flex items-center justify-center gap-3">
           <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'png' | 'jpg')}
                className="bg-brand-dark border-2 border-gray-600 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
            >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
            </select>
          <button
            onClick={() => onDownload(format)}
            className="flex items-center justify-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-green-500 transition-all duration-200 text-sm"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultImage;
