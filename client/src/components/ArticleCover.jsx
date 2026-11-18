import { useEffect, useState } from 'react';

export default function ArticleCover({
  src,
  title,
  className = '',
  eager = false,
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (src && !hasError) {
    return (
      <img
        className={`article-cover ${className}`.trim()}
        src={src}
        alt={`Sampul artikel ${title}`}
        loading={eager ? 'eager' : 'lazy'}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div
      className={`article-cover article-cover--placeholder ${className}`.trim()}
      aria-hidden="true"
    >
      <span className="article-cover__mark">M</span>
      <span className="article-cover__label">Mini CMS</span>
    </div>
  );
}
