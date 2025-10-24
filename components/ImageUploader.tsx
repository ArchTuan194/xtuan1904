
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        id="image-upload"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => handleFileChange(e.target.files)}
      />
      <label
        htmlFor="image-upload"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center w-full aspect-video p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 
          ${isDragging ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-600 hover:border-gray-500'}`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center text-brand-light/70">
            <UploadIcon className="w-10 h-10 mb-3" />
            <p className="mb-2 text-sm font-semibold">
              Click to upload or drag and drop
            </p>
            <p className="text-xs">PNG, JPG or WEBP</p>
          </div>
        )}
      </label>
      <button 
        type="button" 
        onClick={onButtonClick} 
        className="mt-4 w-full text-center py-2 px-4 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-primary hover:text-brand-dark transition-colors duration-200"
      >
        {preview ? 'Change Image' : 'Select Image'}
      </button>
    </div>
  );
};

export default ImageUploader;
