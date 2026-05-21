import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="as-section">
      <div className="as-container" style={{ textAlign: 'center', maxWidth: 680 }}>
        <span className="as-eyebrow">404</span>
        <h1>That page has gone missing.</h1>
        <p className="as-lead">The page you were looking for has moved or no longer exists. Try the homepage or search.</p>
        <div className="as-actions" style={{ justifyContent: 'center' }}>
          <Link className="as-btn as-btn-primary" href="/">Back to home</Link>
        </div>
      </div>
    </section>
  );
}
