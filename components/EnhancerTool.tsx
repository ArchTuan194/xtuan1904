import React, { useState, useCallback, useRef } from 'react';
import { enhanceImageWithGemini } from '../services/geminiService';
import { downloadImage } from '../utils/fileUtils';
import ImageUploader from './ImageUploader';
import ImageDisplay from './ImageDisplay';
import Button from './Button';
import { type Crop, type PixelCrop, centerCrop } from 'react-image-crop';

const EnhancerTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [enhancedImages, setEnhancedImages] = useState<string[] | null>(null);
  const [prompt, setPrompt] = useState<string>('Enhance this image, improving resolution, colors, and sharpness.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const handleImageSelect = useCallback((file: File) => {
    setOriginalImage(file);
    setEnhancedImages(null);
    setError(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);
  
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      { unit: '%', width: 90, height: 90 },
      width,
      height
    );
    setCrop(newCrop);
    setCompletedCrop({
      unit: 'px',
      x: (newCrop.x / 100) * width,
      y: (newCrop.y / 100) * height,
      width: (newCrop.width / 100) * width,
      height: (newCrop.height / 100) * height,
    });
  };

  const handleEnhanceClick = async () => {
    if (!originalImage || !imgRef.current) {
      setError('Please upload an image first.');
      return;
    }
    if (!completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      setError('Please select a region on the image to enhance.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEnhancedImages(null);
    
    try {
      setStatusMessage('Cropping selection...');
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      const croppedBase64Url = canvas.toDataURL(originalImage.type);
      const base64Data = croppedBase64Url.split(',')[1];
      const mimeType = originalImage.type;

      setStatusMessage('Calling AI for 2 variations...');
      const enhancedImageDatas = await enhanceImageWithGemini(base64Data, mimeType, prompt, 2);
      
      setStatusMessage('Enhancement complete!');
      setEnhancedImages(enhancedImageDatas.map(data => `data:${mimeType};base64,${data}`));

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during enhancement.');
      setStatusMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (dataUrl: string, index: number, format: 'png' | 'jpg') => {
    if (originalImage) {
      const fileName = `${originalImage.name.split('.').slice(0, -1).join('.')}-enhanced-${index + 1}`;
      downloadImage(dataUrl, fileName, format);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-4 bg-brand-secondary rounded-xl shadow-lg p-6 flex flex-col space-y-6 h-fit">
        <div>
          <label htmlFor="uploader" className="text-lg font-semibold text-brand-light mb-2 block">1. Upload Image</label>
          <ImageUploader onImageSelect={handleImageSelect} />
        </div>
        
        <div>
          <label htmlFor="prompt" className="text-lg font-semibold text-brand-light mb-2 block">2. Describe Enhancement</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-24 p-3 bg-brand-dark border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 resize-none text-brand-light"
            placeholder="e.g., Make the colors more vibrant"
            disabled={isLoading}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-brand-light mb-2">3. Generate</h2>
          <Button 
            onClick={handleEnhanceClick} 
            isLoading={isLoading} 
            disabled={!originalImage || isLoading || !completedCrop}
          >
            {isLoading ? statusMessage : 'Enhance Image'}
          </Button>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
      </aside>

      <section className="lg:col-span-8 bg-brand-secondary rounded-xl shadow-lg p-6">
        <ImageDisplay
          originalSrc={originalImagePreview}
          enhancedSrcs={enhancedImages}
          onDownload={handleDownload}
          isLoading={isLoading}
          crop={crop}
          setCrop={setCrop}
          setCompletedCrop={setCompletedCrop}
          onImageLoad={onImageLoad}
        />
      </section>
    </div>
  );
};

export default EnhancerTool;
