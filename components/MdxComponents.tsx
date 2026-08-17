import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export const mdxComponents: MDXComponents = {
  a: ({ href, children, ...rest }) => {
    if (href && /^\/(?!\/)/.test(href)) {
      return <Link href={href}>{children}</Link>;
    }
    return (
      <a href={href} rel="noopener noreferrer" target={href?.startsWith('http') ? '_blank' : undefined} {...rest}>
        {children}
      </a>
    );
  },
  h1: (props) => <h1 {...props} />,
  h2: (props) => <h2 style={{ marginTop: 48 }} {...props} />,
  h3: (props) => <h3 style={{ marginTop: 32 }} {...props} />,
  p: (props) => <p style={{ marginTop: 18, color: 'var(--slate-700)' }} {...props} />,
  ul: (props) => <ul style={{ marginTop: 18, color: 'var(--slate-700)', paddingLeft: 22 }} {...props} />,
  ol: (props) => <ol style={{ marginTop: 18, color: 'var(--slate-700)', paddingLeft: 22 }} {...props} />,
  li: (props) => <li style={{ marginTop: 6 }} {...props} />,
  blockquote: (props) => (
    <blockquote
      style={{
        borderLeft: '4px solid var(--emerald-500)',
        background: 'var(--slate-50)',
        padding: '16px 20px',
        borderRadius: 14,
        margin: '24px 0',
      }}
      {...props}
    />
  ),
  code: (props) => (
    <code style={{ background: 'var(--slate-100)', padding: '2px 6px', borderRadius: 6, fontSize: 14 }} {...props} />
  ),
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ alt, ...rest }) => (
    <img
      alt={alt || ''}
      loading="lazy"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: 16,
        margin: '32px 0',
        border: '1px solid var(--slate-200)',
      }}
      {...rest}
    />
  ),
};
