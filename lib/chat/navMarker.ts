// Strip the [[nav:/path]] marker from streamed text, including a
// partial marker at the end (e.g. "[[na" while a token is mid-stream)
// so the marker never flashes in the UI.
export function stripNavMarker(s: string): string {
  let out = s.replace(/\[\[nav:\/[a-z0-9\-\/]*\]\]/gi, '');
  const tailMatch = out.match(/\[\[(?:n(?:a(?:v(?::(?:\/[a-z0-9\-\/]*)?)?)?)?)?$/i);
  if (tailMatch) out = out.slice(0, tailMatch.index);
  return out.trimEnd();
}
