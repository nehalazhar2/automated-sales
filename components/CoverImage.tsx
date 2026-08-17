import Image from 'next/image';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
};

/**
 * next/image requires remotePatterns for external hosts, but ogImage can come
 * from anywhere once posts are published via POST /api/blog. Local paths get
 * the optimized Image component; external URLs fall back to a plain <img>.
 */
export default function CoverImage({ src, alt, width, height, sizes, priority }: Props) {
  if (src.startsWith('/')) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
}
