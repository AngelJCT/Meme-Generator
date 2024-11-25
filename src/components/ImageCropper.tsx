import React, { useState, useRef, useEffect } from 'react';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete }) => {
    const [cropType, setCropType] = useState<'square' | 'circle' | 'rectangle'>('square');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;

        if (canvas && ctx && img) {
            // Clear and resize canvas
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
        }
    }, [image, cropType]);

    const cropImage = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;

        if (!canvas || !ctx || !img) return;

        let croppedImage: string;

        switch (cropType) {
            case 'square':
                const sideLength = Math.min(canvas.width, canvas.height);
                const squareCanvas = document.createElement('canvas');
                squareCanvas.width = sideLength;
                squareCanvas.height = sideLength;
                const squareCtx = squareCanvas.getContext('2d');
                squareCtx?.drawImage(
                    canvas, 
                    (canvas.width - sideLength) / 2, 
                    (canvas.height - sideLength) / 2, 
                    sideLength, sideLength,
                    0, 0, sideLength, sideLength
                );
                croppedImage = squareCanvas.toDataURL();
                break;

            case 'circle':
                const diameter = Math.min(canvas.width, canvas.height);
                const circleCanvas = document.createElement('canvas');
                circleCanvas.width = diameter;
                circleCanvas.height = diameter;
                const circleCtx = circleCanvas.getContext('2d');
                
                // Create circular clip path
                circleCtx?.beginPath();
                circleCtx?.arc(diameter/2, diameter/2, diameter/2, 0, Math.PI * 2);
                circleCtx?.clip();
                
                circleCtx?.drawImage(
                    canvas, 
                    (canvas.width - diameter) / 2, 
                    (canvas.height - diameter) / 2, 
                    diameter, diameter,
                    0, 0, diameter, diameter
                );
                croppedImage = circleCanvas.toDataURL();
                break;

            case 'rectangle':
                const canvasRatio = canvas.width / canvas.height;
                const rectWidth = canvasRatio > 1 ? canvas.height * 1.5 : canvas.width;
                const rectHeight = canvasRatio > 1 ? canvas.height : canvas.width / 1.5;
                
                const rectCanvas = document.createElement('canvas');
                rectCanvas.width = rectWidth;
                rectCanvas.height = rectHeight;
                const rectCtx = rectCanvas.getContext('2d');
                
                rectCtx?.drawImage(
                    canvas, 
                    (canvas.width - rectWidth) / 2, 
                    (canvas.height - rectHeight) / 2, 
                    rectWidth, rectHeight,
                    0, 0, rectWidth, rectHeight
                );
                croppedImage = rectCanvas.toDataURL();
                break;
        }

        onCropComplete(croppedImage);
    };

    return (
        <div className="image-cropper">
            <div className="crop-type-selector mb-4 flex justify-center space-x-2">
                {['square', 'rectangle', 'circle'].map(type => (
                    <button 
                        key={type}
                        onClick={() => {
                            setCropType(type as any);
                        }}
                        className={`btn ${cropType === type ? 'bg-blue-500' : ''}`}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)} Crop
                    </button>
                ))}
            </div>
            <div className="canvas-container relative">
                <img 
                    ref={imageRef} 
                    src={image} 
                    alt="Source" 
                    className="hidden" 
                />
                <canvas
                    ref={canvasRef}
                    className="w-full border-2 border-gray-300"
                />
            </div>
            <div className="mt-4 flex justify-center">
                <button 
                    onClick={cropImage} 
                    className="btn"
                >
                    Apply Crop
                </button>
            </div>
        </div>
    );
};

export default ImageCropper;