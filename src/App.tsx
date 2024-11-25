import React, { useState, useRef, useCallback } from 'react';
import * as htmlToImage from 'html-to-image';
import ImageCropper from './components/ImageCropper';

function App() {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [textSize, setTextSize] = useState(30);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [isCropping, setIsCropping] = useState(false);
  const [topTextPosition, setTopTextPosition] = useState({ x: 50, y: 50 });
  const [bottomTextPosition, setBottomTextPosition] = useState({ x: 50, y: 50 });

  const memeRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);
  const isDraggingTopText = useRef(false);
  const isDraggingBottomText = useRef(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);

        // Reset text positions when a new image is selected
        // Calculate initial positions to place top text at the top and bottom text at the bottom
        const memeRect = memeRef.current?.getBoundingClientRect();
        const topTextRect = topTextRef.current?.getBoundingClientRect();
        const bottomTextRect = bottomTextRef.current?.getBoundingClientRect();

        if (memeRect && topTextRect && bottomTextRect) {
          setTopTextPosition({
            x: (memeRect.width - topTextRect.width) / 2, // Center horizontally
            y: topTextRect.height / 2, // Place just below the top edge
          });
          setBottomTextPosition({
            x: (memeRect.width - bottomTextRect.width) / 2, // Center horizontally
            y: memeRect.height - bottomTextRect.height - (bottomTextRect.height / 2), // Place just above the bottom edge
          });
        } else {
          // Fallback if refs are not yet available (e.g., on first image select before render)
          setTopTextPosition({ x: 50, y: 50 });
          setBottomTextPosition({ x: 50, y: 400 }); // Adjust y to place near the bottom (assuming a min image height)
        }

        setTopText(''); // Reset top text
        setBottomText(''); // Reset bottom text
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setSelectedImage(croppedImage);
    setIsCropping(false);
  }

  const saveMeme = async () => {
    if (memeRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(memeRef.current);
        const link = document.createElement('a');
        link.download = `meme-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Failed to save meme:', error);
        alert('Failed to save meme');
      }
    }
  };

  const handleMouseDownTopText = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingTopText.current = true;
  }, []);

  const handleMouseDownBottomText = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingBottomText.current = true;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const memeRect = memeRef.current?.getBoundingClientRect();
    const topTextRect = topTextRef.current?.getBoundingClientRect();
    const bottomTextRect = bottomTextRef.current?.getBoundingClientRect();

    if (memeRect && topTextRect && isDraggingTopText.current) {
      const x = e.clientX - memeRect.left - topTextRect.width / 2;
      const y = e.clientY - memeRect.top - topTextRect.height / 2;

      setTopTextPosition({
        x: Math.max(0, Math.min(x, memeRect.width - topTextRect.width)),
        y: Math.max(0, Math.min(y, memeRect.height - topTextRect.height)),
      });
    }

    if (memeRect && bottomTextRect && isDraggingBottomText.current) {
      const x = e.clientX - memeRect.left - bottomTextRect.width / 2;
      const y = e.clientY - memeRect.top - bottomTextRect.height / 2;

      setBottomTextPosition({
        x: Math.max(0, Math.min(x, memeRect.width - bottomTextRect.width)),
        y: Math.max(0, Math.min(y, memeRect.height - bottomTextRect.height)),
      });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingTopText.current = false;
    isDraggingBottomText.current = false;
  }, []);

  return (
    <div className="min-h-screen p-4 relative">
      {/* Background Blur Circle */}
      <div className="fixed -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] bg-[#4672b1] opacity-30 blur-[100px] rounded-full pointer-events-none" />

      <header className="text-center mb-8 z-20 w-full py-4">
        <h1 className="text-2xl md:text-4xl font-bold text-[#fafafa]">Meme Generator</h1>
      </header>

      <div className={`max-w-6xl mx-auto z-20 flex flex-col items-center justify-center ${selectedImage ? 'md:flex-row' : ''} gap-8`}>
        {/* Meme Preview */}
        <div className='w-full md:w-1/2'>
          <div 
            ref={memeRef}
            className="relative rounded-lg overflow-hidden mb-4 w-full"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {selectedImage && (
              <>
                <div className="relative">
                  {/* Image */}
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="w-full"
                  />

                  {/* Text divs */}
                  <div 
                    ref={topTextRef}
                    className="absolute cursor-move" 
                    style={{ 
                      fontSize: `${textSize}px`,
                      color: textColor,
                      textShadow: '2px 2px 2px #000',
                      left: `${topTextPosition.x}px`,
                      top: `${topTextPosition.y}px`,
                      userSelect: 'none',
                    }}
                    onMouseDown={handleMouseDownTopText}
                  >
                    {topText}
                  </div>
                  <div 
                    ref={bottomTextRef}
                    className="absolute cursor-move" 
                    style={{ 
                      fontSize: `${textSize}px`,
                      color: textColor,
                      textShadow: '2px 2px 2px #000',
                      left: `${bottomTextPosition.x}px`,
                      top: `${bottomTextPosition.y}px`,
                      userSelect: 'none',
                    }}
                    onMouseDown={handleMouseDownBottomText}
                  >
                    {bottomText}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        

        <div className='w-full md:w-1/2 space-y-4 p-4'>
          {/* ImageCropper */}
          {selectedImage && isCropping && (
            <ImageCropper
              image={selectedImage}
              onCropComplete={handleCropComplete}
            />
          )}

          {/* Controls */}
          <div className="space-y-4 w-full p-4">

            {/* Image Input */}
            <div className="w-full flex justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="btn block text-center cursor-pointer w-full">
                Select Image
              </label>
            </div>

            {selectedImage && !isCropping && (
              <>
                {/* Text Inputs */}
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    placeholder="Top Text"
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    className="input font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Bottom Text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    className="input font-medium"
                  />
                </div>

                {/* Text Size Slider */}
                <div className="w-full flex flex-col items-center">
                  <label className="block text-sm md:text-base font-medium mb-2">Text Size: {textSize}px</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="w-full max-w-md rangeSlider"
                  />
                </div>

                {/* Text Color Buttons */}
                <div className="w-full flex flex-col items-center">
                  <label className="block text-sm md:text-base font-medium mb-2">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full max-w-md h-10 p-0 border-0"
                  />
                </div>

                {/* Crop Image Button */}
                <div className="flex justify-center">
                  <button onClick={() => setIsCropping(true)} className="btn w-full max-w-md">
                    Crop Image
                  </button>
                </div>

                {/* Save Meme Button */}
                <div className="flex justify-center">
                  <button onClick={saveMeme} className="btn w-full max-w-md">
                    Save Meme
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;