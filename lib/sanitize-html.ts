const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "br",
  "div",
  "p",
  "span",
]);

/**
 * Minimal allow-list HTML sanitizer for rich text produced by the
 * contentEditable editor. Strips script/style blocks entirely and removes
 * any tag (and all of its attributes) that isn't in the allow-list, while
 * keeping the tag's inner text content.
 */
export function sanitizeRichText(html: string): string {
  if (!html) {
    return "";
  }

  let sanitized = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  sanitized = sanitized.replace(
    /<\/?([a-zA-Z0-9]+)(?:\s+[^>]*)?>/g,
    (match, tagName: string) => {
      const tag = tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }
      const isClosing = match.startsWith("</");
      return isClosing ? `</${tag}>` : `<${tag}>`;
    },
  );

  return sanitized;
}
