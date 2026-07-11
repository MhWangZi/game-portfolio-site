import { useEffect, useMemo, useState } from 'react'

type SafeImageProps = {
  sources: Array<string | undefined>
  alt: string
  fallbackLabel: string
  className?: string
  eager?: boolean
}

export function SafeImage({ sources, alt, fallbackLabel, className, eager = false }: SafeImageProps) {
  const candidates = useMemo(
    () => [...new Set(sources.filter((source): source is string => Boolean(source)))],
    [sources],
  )
  const signature = candidates.join('|')
  const [sourceIndex, setSourceIndex] = useState(0)

  useEffect(() => setSourceIndex(0), [signature])

  if (!candidates[sourceIndex]) {
    return (
      <div className={className ? `${className} dc-image-fallback` : 'dc-image-fallback'} role="img" aria-label={alt}>
        <span>MEDIA OFFLINE</span>
        <strong>{fallbackLabel}</strong>
      </div>
    )
  }

  return (
    <img
      className={className}
      src={candidates[sourceIndex]}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      onError={() => setSourceIndex((current) => current + 1)}
    />
  )
}
