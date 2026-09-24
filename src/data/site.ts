/**
 * SINGLE SOURCE OF TRUTH for NAP (Name, Address, Phone).
 *
 * NAP consistency is a local-ranking factor. This object must match your
 * Google Business Profile character-for-character. If you change the phone
 * number or address here, also change it on:
 *   - Google Business Profile
 *   - Apple Business Connect, Bing Places, Yelp, Facebook, BBB
 *   - Every citation directory
 * Nothing else in this codebase should hardcode a phone number or address.
 */

export const site = {
  brand: 'Basement Waterproofing Nashville',
  legalName: 'Basement Waterproofing Nashville',
  domain: 'https://basementwaterproofingnashville.com',
  tagline: 'Water out. Foundation dry. Guaranteed.',

  phone: {
    e164: '+16157590553',
    display: '(615) 759-0553',
  },

  email: 'info@basementwaterproofingnashville.com',

  // Service-area business: Google still needs a real, verifiable street
  // address on the profile (never a virtual office or PO box — those get
  // suspended), but it stays hidden there and is omitted here, so nothing on
  // the site advertises a walk-in location that does not exist.
  address: {
    streetAddress: '', // e.g. '1200 Gallatin Ave, Suite 4'
    locality: 'Nashville',
    region: 'TN',
    regionName: 'Tennessee',
    postalCode: '', // e.g. '37206'
    country: 'US',
    hideAddress: true,
  },

  geo: { latitude: 36.1627, longitude: -86.7816 },

  hours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '18:00',
    },
    { days: ['Saturday'], opens: '08:00', closes: '14:00' },
  ],
  emergencyNote: '24/7 emergency water intrusion response',

  // Only claims that can be evidenced on request. Blank fields stay blank
  // rather than being filled with something plausible — "Licensed & Insured"
  // is regulated advertising language in Tennessee, and each badge below only
  // renders while the value behind it is set.
  credentials: {
    tnLicense: '',
    insured: true,
    bbbAccredited: false,
    yearsInBusiness: null as number | null,
    warrantyYears: null as number | null,
  },

  // Only list profiles that actually exist — blanks are filtered out of schema.
  profiles: {
    googleBusinessProfile: '',
    googlePlaceId: '',
    facebook: '',
    yelp: '',
    bbb: '',
    angi: '',
  },

  serviceAreaLabel: 'Nashville and Middle Tennessee',
  serviceRadiusMiles: 40,
};

export const telHref = `tel:${site.phone.e164}`;

/** Review request link to text/email happy customers. */
export function reviewLink(): string | null {
  const id = site.profiles.googlePlaceId;
  return id ? `https://search.google.com/local/writereview?placeid=${id}` : null;
}

/** Formatted address, or null for a service-area business. */
export function formattedAddress(): string | null {
  const a = site.address;
  if (!a.streetAddress) return null;
  return `${a.streetAddress}, ${a.locality}, ${a.region} ${a.postalCode}`;
}
