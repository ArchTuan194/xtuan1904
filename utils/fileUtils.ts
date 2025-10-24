
// Fix: Provide implementation for file utility functions like downloading images.

function triggerDownload(href: string, fileName: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers a browser download for a given data URL.
 * Converts to JPG if necessary.
 * @param dataUrl The data URL of the content to download (assumed to be PNG from the API).
 * @param fileName The base name for the downloaded file.
 * @param format The format ('png' or 'jpg') to use for the file extension.
 */
export const downloadImage = (dataUrl: string, fileName: string, format: 'png' | 'jpg') => {
  const finalFileName = `${fileName}.${format}`;

  if (format === 'png' || !dataUrl.startsWith('data:image/png')) {
    // If it's already PNG and we want PNG, or if it's not a PNG to begin with, download directly.
    triggerDownload(dataUrl, finalFileName);
    return;
  }
  
  // Convert PNG to JPG
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    
    // JPG doesn't support transparency, so we fill the background with white.
    if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    }
    
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9); // 90% quality
    triggerDownload(jpegDataUrl, finalFileName);
  };
  img.onerror = () => {
      // Fallback to direct download if image loading fails for some reason
      console.error("Could not load image for conversion, downloading original format.");
      triggerDownload(dataUrl, `${fileName}.png`);
  };
  img.src = dataUrl;
};

/**
 * Converts a File object to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves to the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};