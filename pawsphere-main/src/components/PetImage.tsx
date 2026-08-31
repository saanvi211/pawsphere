import React, { useState } from 'react';
import { Animal } from '../types/animal';
import { getPetFallbackImageUrl, getPetImageUrl } from '../lib/petImages';

interface PetImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  pet: Pick<Animal, 'photoUrl' | 'species' | 'name'>;
  allowFallback?: boolean;
}

export const PetImage: React.FC<PetImageProps> = ({ pet, onError, src: _src, allowFallback = true, ...props }) => {
  const [showFallback, setShowFallback] = useState(false);
  
  // Only use fallback if:
  // 1. allowFallback prop is true
  // 2. The image fails to load (showFallback is true)
  const source = !allowFallback ? (pet.photoUrl?.trim() || '') : (showFallback ? getPetFallbackImageUrl(pet.species) : getPetImageUrl(pet));

  return (
    <img
      {...props}
      src={source}
      alt={props.alt || pet.name}
      onError={(event) => {
        if (allowFallback && !showFallback) {
          setShowFallback(true);
        }
        onError?.(event);
      }}
    />
  );
};
