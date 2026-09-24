export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Alt text builder — high-context, never keyword-stuffed. */
export function projectAlt(service: string, city: string, state: string, detail?: string): string {
  const base = `${service} project completed in ${city}, ${state.toUpperCase()}`;
  return detail ? `${base} — ${detail}` : base;
}
