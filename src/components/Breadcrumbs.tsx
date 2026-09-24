import Link from 'next/link';

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="spec">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-grade-600">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-grade-900">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className="underline decoration-limestone-300 hover:text-water-700">
                    {c.name}
                  </Link>
                  <span aria-hidden="true" className="text-limestone-300">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
