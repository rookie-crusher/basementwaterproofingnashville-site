import type { Metadata } from 'next';
import { site, telHref, formattedAddress } from '@/data/site';
import { publishedCities } from '@/data/cities';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CallButton } from '@/components/CallButton';
import { LeadFormSlot } from '@/components/LeadFormSlot';
import { TrustBadges } from '@/components/TrustBadges';

export const metadata: Metadata = buildMetadata({
  path: '/contact/',
  title: `Contact | Basement Waterproofing Nashville`,
  description: `Call ${site.phone.display} for a free basement or crawl space diagnosis in Nashville and Middle Tennessee. ${site.emergencyNote}.`,
});

const trail = [
  { name: 'Home', path: '/' },
  { name: 'Contact', path: '/contact/' },
];

export default function ContactPage() {
  const addr = formattedAddress();

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail)} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumbs trail={trail} />
        <h1 className="mt-6 text-4xl sm:text-5xl">Contact</h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed text-grade-800">
          Water coming in right now? Call — that is faster than any form.
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="border border-limestone-300 bg-limestone-50 p-6">
              <p className="eyebrow">Call</p>
              <a
                href={telHref}
                className="mt-2 block font-display text-4xl font-bold tracking-tight text-grade-950 hover:text-water-700"
              >
                {site.phone.display}
              </a>
              <p className="mt-3 spec text-xs text-grade-600">{site.emergencyNote}</p>
              <div className="mt-5">
                <CallButton />
              </div>
            </div>

            <dl className="mt-8 space-y-5">
              <div>
                <dt className="eyebrow">Email</dt>
                <dd className="mt-1.5">
                  <a href={`mailto:${site.email}`} className="break-all underline">
                    {site.email}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="eyebrow">Hours</dt>
                <dd className="mt-1.5 spec">
                  {site.hours.map((h) => (
                    <div key={h.days.join()} className="flex gap-3">
                      <span className="w-28 text-grade-600">
                        {h.days.length > 1
                          ? `${h.days[0]}–${h.days[h.days.length - 1]}`
                          : h.days[0]}
                      </span>
                      <span>
                        {h.opens} – {h.closes}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>

              <div>
                <dt className="eyebrow">Where we work</dt>
                <dd className="mt-1.5 not-italic">
                  <address className="not-italic text-[0.9375rem] leading-relaxed text-grade-800">
                    {addr ? (
                      addr
                    ) : (
                      <>
                        {site.serviceAreaLabel} — mobile service, no walk-in location.
                        <br />
                        <span className="spec text-xs text-grade-600">
                          {publishedCities.map((c) => c.name).join(' · ')}
                        </span>
                      </>
                    )}
                  </address>
                </dd>
              </div>
            </dl>

            <div className="mt-10">
              <TrustBadges />
            </div>
          </div>

          <div>
            <LeadFormSlot heading="Request a free inspection" />
          </div>
        </div>
      </div>
    </>
  );
}
