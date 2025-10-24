import React, { useState } from 'react';
import EnhancerTool from './components/EnhancerTool';
import SketchTool from './components/SketchTool';
import PerspectiveTool from './components/PerspectiveTool';
import { GithubIcon } from './components/Icons';

type Tool = 'enhancer' | 'sketch' | 'perspective';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('sketch');

  const renderTool = () => {
    switch (activeTool) {
      case 'enhancer':
        return <EnhancerTool />;
      case 'sketch':
        return <SketchTool />;
      case 'perspective':
        return <PerspectiveTool />;
      default:
        return <SketchTool />;
    }
  };

  const getButtonClass = (tool: Tool) => {
    return `px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
      activeTool === tool
        ? 'bg-brand-primary text-brand-dark shadow-md'
        : 'bg-brand-dark hover:bg-gray-700 text-brand-light'
    }`;
  };

  return (
    <div className="bg-brand-dark min-h-screen text-brand-light font-sans">
      <div className="container mx-auto px-4 py-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b-2 border-gray-700">
          <div>
            <h1 className="text-4xl font-bold text-center sm:text-left">
              AIA Design&Build <span className="text-brand-primary">App</span>
            </h1>
            <p className="text-md text-brand-light/70 mt-1 text-center sm:text-left">
              Phát triển phác thảo với công cụ phát triển bởi Architech1904
            </p>
          </div>
          <a
            href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/applications/image_studio_build"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 sm:mt-0 flex items-center text-brand-light/80 hover:text-brand-primary transition-colors"
          >
            <GithubIcon className="w-6 h-6 mr-2" />
            View on GitHub
          </a>
        </header>

        <main>
          <div className="flex justify-center mb-8">
            <div className="bg-brand-secondary p-2 rounded-xl shadow-lg flex flex-wrap justify-center space-x-2">
              <button onClick={() => setActiveTool('sketch')} className={getButtonClass('sketch')}>
                Sketch to Reality
              </button>
              <button onClick={() => setActiveTool('perspective')} className={getButtonClass('perspective')}>
                Perspective Changer
              </button>
              <button onClick={() => setActiveTool('enhancer')} className={getButtonClass('enhancer')}>
                Region Enhancer
              </button>
            </div>
          </div>
          
          {renderTool()}

        </main>
        
        <footer className="text-center mt-12 py-4 text-brand-light/50 text-sm border-t-2 border-gray-800">
          <p>Powered by Google Gemini API</p>
        </footer>

      </div>
    </div>
  );
};

export default App;