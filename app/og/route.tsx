import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const runtime = 'edge';

export const size = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get('title') || SITE_NAME).slice(0, 140);
  const subtitle =
    url.searchParams.get('subtitle') ||
    'CRM, automation and AI consultancy';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background:
            'radial-gradient(circle at top left, #064e3b 0%, #020617 60%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: 'white',
              color: '#020617',
              fontWeight: 900,
              fontSize: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            AS
          </div>
          <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: -0.5 }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#a7f3d0',
              fontWeight: 700,
              letterSpacing: -0.4,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
