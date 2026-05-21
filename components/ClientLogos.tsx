import Image from 'next/image';

export type Logo = { src: string; alt: string; w: number; h: number };

export const CLIENT_LOGOS: Logo[] = [
  { src: '/images/clients/insperanto.png', alt: 'Insperanto', w: 990, h: 189 },
  { src: '/images/clients/ibm.png',        alt: 'IBM',        w: 240, h: 96 },
  { src: '/images/clients/bannatynes.png', alt: 'Bannatynes', w: 200, h: 200 },
  { src: '/images/clients/gov.png',        alt: 'GOV.UK',     w: 640, h: 109 },
  { src: '/images/clients/denplan.png',    alt: 'Denplan',    w: 350, h: 200 },
  { src: '/images/clients/archant.jpg',    alt: 'Archant',    w: 460, h: 228 },
  { src: '/images/clients/fai.jpg',        alt: 'FAI',        w: 335, h: 200 },
  { src: '/images/clients/imbalie.jpg',    alt: 'Imbalie',    w: 250, h: 180 },
  { src: '/images/clients/essensuals.png', alt: 'Essensuals', w: 484, h: 135 },
  { src: '/images/clients/nhf.gif',        alt: 'NHF',        w: 200, h: 200 },
  { src: '/images/clients/skn.jpg',        alt: 'SK:N',       w: 512, h: 256 },
  { src: '/images/clients/viceroy.jpeg',   alt: 'Viceroy',    w: 472, h: 247 },
];

export const TECH_LOGOS: Logo[] = [
  { src: '/images/tech/zapier.png',          alt: 'Zapier',          w: 500, h: 500 },
  { src: '/images/tech/zoom.png',            alt: 'Zoom',            w: 150, h: 150 },
  { src: '/images/tech/outfunnel.png',       alt: 'Outfunnel',       w: 500, h: 500 },
  { src: '/images/tech/kixie.png',           alt: 'Kixie',           w: 194, h: 194 },
  { src: '/images/tech/microsoft-teams.png', alt: 'Microsoft Teams', w: 150, h: 150 },
  { src: '/images/tech/calendly.png',        alt: 'Calendly',        w: 150, h: 150 },
];

type Props = {
  heading?: string;
  /** Marquee speed in seconds for one full loop. Lower = faster. */
  speed?: number;
  /** Logos to display. Defaults to CLIENT_LOGOS. */
  logos?: Logo[];
};

export default function ClientLogos({
  heading = 'Some of our amazing clients',
  speed = 40,
  logos = CLIENT_LOGOS,
}: Props) {
  // Duplicate the list so the keyframe loop is seamless.
  const track = [...logos, ...logos];

  return (
    <section className="as-clients-strip">
      <div className="as-container">
        <div className="as-kicker">{heading}</div>
        <div
          className="as-clients-marquee"
          style={{ ['--as-marquee-speed' as string]: `${speed}s` }}
          aria-label={heading}
        >
          <div className="as-clients-track">
            {track.map((logo, i) => (
              <div className="as-clients-item" key={`${logo.alt}-${i}`}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.w}
                  height={logo.h}
                  sizes="160px"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
