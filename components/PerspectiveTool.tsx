import React, { useState, useCallback } from 'react';
import { generateImageVariations } from '../services/geminiService';
import { downloadImage, fileToBase64 } from '../utils/fileUtils';
import ImageUploader from './ImageUploader';
import ResultImage from './ResultImage';
import Button from './Button';

type Option = string | null;

interface OptionSelectorProps {
  title: string;
  options: string[];
  selected: Option;
  setSelected: (value: Option) => void;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ title, options, selected, setSelected }) => (
  <div>
    <h3 className="text-md font-semibold text-brand-light/90 mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button 
          key={option} 
          onClick={() => setSelected(selected === option ? null : option)} 
          className={`px-3 py-1 text-sm rounded-full transition-all duration-200 border-2
            ${selected === option 
              ? 'bg-brand-primary text-brand-dark border-brand-primary font-semibold' 
              : 'bg-brand-dark border-gray-600 hover:border-gray-500 text-brand-light/80'
            }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);


const PerspectiveTool: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('A photorealistic image of this building, maintain all architectural details, materials, and lighting from the original image.');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  const [cameraHeight, setCameraHeight] = useState<Option>('Medium');
  const [cameraAngle, setCameraAngle] = useState<Option>('Wide');
  const [cameraEffect, setCameraEffect] = useState<Option>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setSourceFile(file);
    setGeneratedImages([]);
    setError(null);
  }, []);

  const handleGenerateClick = async () => {
    if (!sourceFile) {
      setError('Please upload a source image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
        const base64Data = await fileToBase64(sourceFile);
        
        const optionsPrompt = [
          cameraHeight ? `Camera Height: ${cameraHeight}` : '',
          cameraAngle ? `Lens: ${cameraAngle}` : '',
          cameraEffect ? `Effect: ${cameraEffect}` : '',
        ].filter(Boolean).join('. ');

        const finalBasePrompt = `${prompt} ${optionsPrompt}`;

        const perspectivePrompts = [
            `Front view. ${finalBasePrompt}`,
            `Dynamic low-angle view from the corner. ${finalBasePrompt}`,
            `High-angle view showing the building in its context. ${finalBasePrompt}`,
            `A detailed close-up shot of a key architectural feature. ${finalBasePrompt}`,
        ];
        
        const results = await generateImageVariations(base64Data, sourceFile.type, perspectivePrompts);
        
        setGeneratedImages(results.map(data => `data:${sourceFile.type};base64,${data}`));

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleDownload = (dataUrl: string, index: number, format: 'png' | 'jpg') => {
    if (sourceFile) {
      const fileName = `${sourceFile.name.split('.').slice(0, -1).join('.')}-perspective-${index + 1}`;
      downloadImage(dataUrl, fileName, format);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-4 bg-brand-secondary rounded-xl shadow-lg p-6 flex flex-col space-y-6 h-fit">
        <div>
          <label className="text-lg font-semibold text-brand-light mb-2 block">1. Upload Source Image</label>
          <ImageUploader onImageSelect={handleImageSelect} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-light">2. Set Camera Controls</h2>
          <OptionSelector title="Camera Height" options={['Low', 'Medium', 'High', 'Aerial']} selected={cameraHeight} setSelected={setCameraHeight} />
          <OptionSelector title="Camera Angle" options={['Super Wide', 'Wide', 'Close-up', 'Macro']} selected={cameraAngle} setSelected={setCameraAngle} />
          <OptionSelector title="Effect" options={['Depth of Field', 'Bokeh']} selected={cameraEffect} setSelected={setCameraEffect} />
        </div>

        <div>
            <label htmlFor="prompt" className="text-lg font-semibold text-brand-light mb-2 block">3. Add Custom Instructions</label>
            <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 p-3 bg-brand-dark border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 resize-none text-brand-light"
                placeholder="e.g., change the season to winter..."
                disabled={isLoading}
            />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-brand-light mb-2">4. Generate</h2>
          <Button 
            onClick={handleGenerateClick} 
            isLoading={isLoading} 
            disabled={!sourceFile || isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate 4 Perspectives'}
          </Button>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
      </aside>

      <section className="lg:col-span-8 bg-brand-secondary rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
                <ResultImage
                    key={index}
                    src={generatedImages[index] || null}
                    title={`Perspective ${index + 1}`}
                    onDownload={(format) => handleDownload(generatedImages[index], index, format)}
                    isLoading={isLoading && generatedImages.length === 0}
                />
            ))}
        </div>
      </section>
    </div>
  );
};

export default PerspectiveTool;