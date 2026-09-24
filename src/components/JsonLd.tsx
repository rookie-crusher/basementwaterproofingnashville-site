/** Renders JSON-LD. Skips rendering entirely when data is null/empty. */
export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  const arr = Array.isArray(data) ? data.filter(Boolean) : [data];
  if (!arr.length) return null;
  return (
    <>
      {arr.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify output is safe here; < is escaped to prevent
          // breaking out of the script tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(d).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
