import { useState } from 'react';

// Renders `src`, and quietly switches to `fallbackSrc` if that file cannot be
// loaded (for example before the final Veyora banner images are added).
// Plain component with one useState — no custom hooks.
export default function FallbackImage({
  src,
  fallbackSrc,
  alt = '',
  className = '',
  ...props
}) {
  const [source, setSource] = useState(src);

  const handleError = () => {
    if (fallbackSrc && source !== fallbackSrc) {
      setSource(fallbackSrc);
    }
  };

  return (
    <img
      src={source}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
