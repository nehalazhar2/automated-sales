export type Testimonial = {
  quote: string;
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
          <article key={i} className="as-card as-testimonials-item">
            <div className="as-stars">★★★★★</div>
            <p style={{ marginTop: 12 }}>{t.quote}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
