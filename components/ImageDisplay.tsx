import React from 'react';
import { ImageIcon } from './Icons';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import ResultImage from './ResultImage';

interface ImageDisplayProps {
  originalSrc: string | null;
  enhancedSrcs: string[] | null;
  onDownload: (dataUrl: string, index: number, format: 'png' | 'jpg') => void;
  isLoading: boolean;
  crop: Crop | undefined;
  setCrop: (crop: Crop) => void;
  setCompletedCrop: (crop: PixelCrop) => void;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
    originalSrc, 
    enhancedSrcs, 
    onDownload, 
    isLoading,
    crop,
    setCrop,
    setCompletedCrop,
    onImageLoad
}) => {
  
  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        
        <div className="w-full">
            <h3 className="text-lg font-semibold text-center mb-2 text-brand-light">Original (Select region to enhance)</h3>
            <div className="w-full bg-brand-dark rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600 relative text-brand-light">
                {originalSrc ? (
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={c => setCompletedCrop(c)}
                        minWidth={50}
                        minHeight={50}
                    >
                        <img 
                            src={originalSrc} 
                            alt="Original to crop"
                            onLoad={onImageLoad}
                            className="max-h-[calc(100vh-20rem)] max-w-full object-contain"
                        />
                    </ReactCrop>
                ) : (
                    <div className="flex flex-col items-center text-brand-light/50 p-4 text-center">
                        <ImageIcon className="w-16 h-16" />
                        <p className="mt-2 text-sm">Upload an image to begin</p>
                    </div>
                )}
            </div>
        </div>
        
        <div className="grid grid-rows-1 sm:grid-rows-2 gap-4">
            <ResultImage 
                src={enhancedSrcs?.[0] || null} 
                title="Result 1" 
                onDownload={(format) => enhancedSrcs && onDownload(enhancedSrcs[0], 0, format)}
                isLoading={isLoading && !enhancedSrcs}
            />
            <ResultImage 
                src={enhancedSrcs?.[1] || null} 
                title="Result 2" 
                onDownload={(format) => enhancedSrcs && onDownload(enhancedSrcs[1], 1, format)}
                isLoading={isLoading && !enhancedSrcs}
            />
        </div>

      </div>
    </div>
  );
};

export default ImageDisplay;