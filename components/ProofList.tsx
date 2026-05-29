const DEFAULT_ITEMS = [
  'Pipedrive Advisory Council member',
  'Global Pipedrive Partner',
  '200+ Pipedrive projects delivered',
  'CRM, automation, AI and reporting expertise',
];

type Props = {
  items?: string[];
};

export default function ProofList({ items = DEFAULT_ITEMS }: Props) {
  return (
    <section className="as-section">
      <div className="as-container">
        <div className="as-proof-list" style={{ marginTop: 0 }}>
          {items.map((item) => (
            <div key={item} className="as-proof-item">{item}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
