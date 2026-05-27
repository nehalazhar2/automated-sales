import Image from 'next/image';

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
};

type Props = {
  testimonials: Testimonial[];
  /** Marquee speed in seconds for one full loop. Lower = faster. */
  speed?: number;
};

export default function TestimonialsMarquee({ testimonials, speed = 80 }: Props) {
  const track = [...testimonials, ...testimonials];

  return (
    <div
      className="as-testimonials-marquee"
      style={{ ['--as-marquee-speed' as string]: `${speed}s` }}
      aria-label="Client testimonials"
    >
      <div className="as-testimonials-track">
        {track.map((t, i) => (
          <article key={`${t.name}-${i}`} className="as-card as-testimonials-item">
            <div className="as-stars">★★★★★</div>
            <p style={{ marginTop: 12 }}>{t.quote}</p>
            <div className="as-attribution" style={{ marginTop: 20 }}>
              {t.avatar && (
                <div className="as-avatar">
                  <Image src={t.avatar} alt={t.name} width={88} height={88} />
                </div>
              )}
              <div>
                <div className="as-attribution-name">{t.name}</div>
                <div className="as-attribution-role">{t.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
