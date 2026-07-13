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

/**
 * Rich text from the editor is never a truly empty string - an untouched
 * field is saved as an empty bullet placeholder (e.g. "<ul><li><br></li></ul>").
 * This checks whether the content has any real text, ignoring markup/whitespace.
 */
export function isRichTextEmpty(html: string): boolean {
  if (!html) {
    return true;
  }
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return text.length === 0;
}

/**
 * Ensures HTML content always renders as a bulleted list, even for legacy
 * plain-text values (e.g. CSV seed data) saved before the rich text editor
 * enforced bullet lists. Leaves already-bulleted content untouched.
 */
export function ensureBulletHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^<ul[^>]*>[\s\S]*<\/ul>$/i.test(trimmed)) {
    return trimmed;
  }

  const withoutWrappers = trimmed
    .replace(/<\/(div|p)>/gi, "\n")
    .replace(/<(div|p)[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n");

  const lines = withoutWrappers
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const items = (lines.length > 0 ? lines : [trimmed])
    .map((line) => `<li>${line}</li>`)
    .join("");

  return `<ul>${items}</ul>`;
}
