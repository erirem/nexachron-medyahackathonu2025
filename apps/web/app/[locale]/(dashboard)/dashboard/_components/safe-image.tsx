'use client';

import Image from 'next/image';
import { useState } from 'react';

type SafeImageProps = {
  readonly src?: string | null;
  readonly alt: string;
  readonly className?: string;
  readonly sizes?: string;
  readonly priority?: boolean;
  readonly fill?: boolean;
};

export function SafeImage({ src, alt, className, sizes, priority = false, fill = true }: SafeImageProps) {
  const [hasError, setHasError] = useState<boolean>(false);

  const isEmpty = !src || src.trim() === '';
  const shouldShowPlaceholder = hasError || isEmpty;

  if (shouldShowPlaceholder) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center text-slate-300">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src as string}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
}


