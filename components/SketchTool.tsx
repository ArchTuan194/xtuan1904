
import React, { useState, useCallback } from 'react';
import { enhanceImageWithGemini, generatePromptFromImage } from '../services/geminiService';
import { downloadImage, fileToBase64 } from '../utils/fileUtils';
import ImageUploader from './ImageUploader';
import ResultImage from './ResultImage';
import Button from './Button';
import { MagicWandIcon, LoadingSpinnerIcon } from './Icons';

type AspectRatio = '1:1' | '16:9' | '4:3' | '3:4' | '9:16';

const SketchTool: React.FC = () => {
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setSketchFile(file);
    setGeneratedImages([]);
    setError(null);
    setPrompt('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setSketchPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSuggestPrompt = async () => {
    if (!sketchFile) {
        setError('Please upload a sketch first.');
        return;
    }
    setIsSuggesting(true);
    setError(null);
    try {
        const base64Data = await fileToBase64(sketchFile);
        const suggestedPrompt = await generatePromptFromImage(base64Data, sketchFile.type);
        setPrompt(suggestedPrompt);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to suggest a prompt.');
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleGenerateClick = async () => {
    if (!sketchFile) {
      setError('Please upload a sketch image first.');
      return;
    }
    if (!prompt) {
      setError('Please enter a prompt or use the suggestion tool.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const img = new Image();
      img.src = sketchPreview!;
      await new Promise(resolve => { img.onload = resolve; });

      const [ratioWidth, ratioHeight] = aspectRatio.split(':').map(Number);
      const targetAspectRatio = ratioWidth / ratioHeight;
      
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
      const currentAspectRatio = img.width / img.height;

      if (currentAspectRatio > targetAspectRatio) {
        sWidth = img.height * targetAspectRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / targetAspectRatio;
        sy = (img.height - sHeight) / 2;
      }

      const canvas = document.createElement('canvas');
      canvas.width = sWidth;
      canvas.height = sHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      
      const croppedBase64Url = canvas.toDataURL(sketchFile.type);
      const base64Data = croppedBase64Url.split(',')[1];
      
      const finalPrompt = `Create a photorealistic architectural rendering based on the provided sketch. ${prompt}`;
      const results = await enhanceImageWithGemini(base64Data, sketchFile.type, finalPrompt, 4);
      
      setGeneratedImages(results.map(data => `data:${sketchFile.type};base64,${data}`));

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (dataUrl: string, index: number, format: 'png' | 'jpg') => {
    if (sketchFile) {
      const fileName = `${sketchFile.name.split('.').slice(0, -1).join('.')}-result-${index + 1}`;
      downloadImage(dataUrl, fileName, format);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-4 bg-brand-secondary rounded-xl shadow-lg p-6 flex flex-col space-y-6 h-fit">
        <div>
          <label className="text-lg font-semibold text-brand-light mb-2 block">1. Upload Sketch</label>
          <ImageUploader onImageSelect={handleImageSelect} />
        </div>
        
        <div>
            <label htmlFor="aspect-ratio" className="text-lg font-semibold text-brand-light mb-2 block">2. Select Aspect Ratio</label>
            <select
                id="aspect-ratio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full p-3 bg-brand-dark border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-brand-light"
                disabled={isLoading}
            >
                <option value="1:1">Square (1:1)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="4:3">Landscape (4:3)</option>
                <option value="3:4">Portrait (3:4)</option>
                <option value="9:16">Portrait (9:16)</option>
            </select>
        </div>

        <div>
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="prompt" className="text-lg font-semibold text-brand-light">3. Describe your Vision</label>
                <button 
                    onClick={handleSuggestPrompt} 
                    disabled={isSuggesting || !sketchFile}
                    className="flex items-center text-sm text-brand-primary hover:text-teal-400 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    {isSuggesting ? (
                        <LoadingSpinnerIcon className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                        <MagicWandIcon className="w-4 h-4 mr-1"/>
                    )}
                    Suggest a Prompt
                </button>
            </div>
            <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 p-3 bg-brand-dark border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 resize-none text-brand-light"
                placeholder="e.g., A minimalist concrete house during a foggy morning, surrounded by pine trees..."
                disabled={isLoading || isSuggesting}
            />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-brand-light mb-2">4. Generate</h2>
          <Button 
            onClick={handleGenerateClick} 
            isLoading={isLoading} 
            disabled={!sketchFile || !prompt || isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate 4 Images'}
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
                    title={`Result ${index + 1}`}
                    onDownload={(format) => handleDownload(generatedImages[index], index, format)}
                    isLoading={isLoading && generatedImages.length === 0}
                />
            ))}
        </div>
      </section>
    </div>
  );
};

export default SketchTool;