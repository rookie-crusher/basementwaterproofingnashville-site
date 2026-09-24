/**
 * LEAD FORM (LeadSmart embed)
 *
 * ── WHY THE PROVIDER'S <head> SNIPPET IS NOT USED VERBATIM ──────────────
 * The snippet supplied wraps the real script tag in document.write():
 *
 *   document.write(unescape("%3Cscript src='"+po_host+"leads.leadsmartinc.com/..."))
 *
 * document.write() only works while the browser is still parsing the initial
 * HTML. Called at any point after the document has finished loading — which is
 * what happens in a React app, and what would happen with any of Next's script
 * strategies — it wipes the entire document and replaces it with the script
 * tag. That is a blank white page, not a degraded one.
 *
 * It is also a parser-blocking third-party request in <head>, which Lighthouse
 * flags twice ("Avoid document.write()" and "Eliminate render-blocking
 * resources") and which works directly against the 95+ mobile target.
 *
 * All that snippet actually does is inject one external script. So we load that
 * script directly, after hydration, via next/script. Identical end result, no
 * page-blanking risk, off the critical path. The URL below is exactly what the
 * unescape() call produces.
 *
 * If LeadSmart support ever insists the wrapper is required, ask them what the
 * wrapper does beyond injecting embed.js — the answer should be "nothing".
 */

export const LEADSMART = {
  apiKey: 'eccf565586cda416df8b89f66df641fee9a1bcb8',
  affiliateSource: 'radehkhdi1',
  buttons: 'btn-success',
};

/**
 * The embed script. Loaded with strategy="afterInteractive" in app/layout.tsx.
 * Protocol is pinned to https rather than the original protocol-relative
 * "//" — the site is HTTPS-only (enforced in out/.htaccess), so there is no
 * http case to support and pinning avoids any mixed-content ambiguity.
 */
export const leadFormScript = {
  enabled: true,
  id: 'leadsmart-embed',
  src:
    'https://leads.leadsmartinc.com/js/embed/embed.js' +
    `?apikey=${LEADSMART.apiKey}` +
    `&affiliate_source=${LEADSMART.affiliateSource}` +
    `&buttons=${LEADSMART.buttons}`,
};

export type LeadFormConfig =
  /** No embed: the slot renders a call-first block instead. */
  | { mode: 'phone-only' }
  | {
      mode: 'iframe';
      src: string;
      /** Desktop height in px, from the provider's own embed code. */
      height: number;
      /**
       * Height on screens under 640px. The provider ships 545px for a 600px
       * wide form; once the fields stack on a phone it needs more room, and a
       * short iframe scrolls internally, which users do not notice and which
       * silently costs you leads. Tune this after checking on a real phone.
       */
      mobileHeight: number;
      title: string;
    }
  | { mode: 'raw'; html: string };

export const leadForm: LeadFormConfig = {
  mode: 'iframe',
  src:
    'https://leads.leadsmartinc.com/' +
    `?api_key=${LEADSMART.apiKey}` +
    `&affiliate_source=${LEADSMART.affiliateSource}` +
    '&funnel=4&category=&step=1' +
    `&buttons=${LEADSMART.buttons}`,
  height: 545,
  mobileHeight: 700,
  title: 'Request a free basement waterproofing inspection',
};

/** Fields worth asking LeadSmart to include on funnel 4. */
export const requestedFields = [
  'Full name',
  'Phone (required)',
  'Email',
  'Street address or ZIP',
  'Problem type (standing water / wall seepage / crack / musty smell / crawl space)',
  'How long has it been happening?',
];
