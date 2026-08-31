import React, { useState } from 'react';
import { Sparkles, Scissors } from 'lucide-react';
import { FALLBACK_GROOMING_IMAGE } from '../../data/groomingData';

interface SafeGroomingImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export const SafeGroomingImage: React.FC<SafeGroomingImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-video',
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (imgSrc !== FALLBACK_GROOMING_IMAGE) {
      setImgSrc(FALLBACK_GROOMING_IMAGE);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${aspectRatio} ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <Scissors className="w-8 h-8 text-cyan-500/40 animate-spin" />
        </div>
      )}

      {/* Fallback Graphic if image fails completely */}
      {hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 p-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mb-2">
            <Scissors className="w-6 h-6 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-cyan-300 line-clamp-1">{alt}</p>
          <span className="text-[10px] text-slate-400 mt-0.5">PawSphere Grooming Studio</span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
};
