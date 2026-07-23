function parseTagBlock(input: string, start: number): { raw: string; tagName: string; attrs: string; closing: boolean; end: number } | null {
  if (input[start] !== '<') return null;
  let i = start + 1;
  const closing = input[i] === '/';
  if (closing) i++;
  const tagStart = i;
  while (i < input.length && /[a-zA-Z0-9]/.test(input[i])) i++;
  if (i === tagStart) return null;
  const tagName = input.slice(tagStart, i).toLowerCase();
  let attrs = '';
  while (i < input.length && input[i] !== '>') {
    if (input[i] === '"' || input[i] === "'") {
      const quote = input[i];
      attrs += quote;
      i++;
      while (i < input.length && input[i] !== quote) {
        attrs += input[i];
        i++;
      }
      if (i < input.length) { attrs += quote; i++; }
    } else {
      attrs += input[i];
      i++;
    }
  }
  if (i >= input.length) return null;
  i++;
  return { raw: input.slice(start, i), tagName, attrs, closing, end: i };
}

export function stripHtmlTags(input: string): string {
  let result = '';
  let i = 0;
  while (i < input.length) {
    if (input[i] === '<') {
      const block = parseTagBlock(input, i);
      if (block) { i = block.end; continue; }
    }
    result += input[i];
    i++;
  }
  return result;
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeRichText(input: string): string {
  const allowedTags = new Set(['b', 'i', 'u', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'span']);
  const allowedAttributes = new Set(['href', 'target', 'rel', 'class', 'style']);
  let result = '';
  let i = 0;
  while (i < input.length) {
    if (input[i] === '<') {
      const block = parseTagBlock(input, i);
      if (block) {
        i = block.end;
        if (block.closing) {
          if (allowedTags.has(block.tagName)) result += `</${block.tagName}>`;
        } else {
          if (allowedTags.has(block.tagName)) {
            let safeAttrs = '';
            let j = 0;
            const a = block.attrs;
            while (j < a.length) {
              if (/\s/.test(a[j])) { j++; continue; }
              const nameStart = j;
              while (j < a.length && /[a-zA-Z-]/.test(a[j])) j++;
              if (j === nameStart) { j++; continue; }
              const attrName = a.slice(nameStart, j).toLowerCase();
              while (j < a.length && /\s/.test(a[j])) j++;
              let attrValue = '';
              if (a[j] === '=') {
                j++;
                while (j < a.length && /\s/.test(a[j])) j++;
                if (a[j] === '"' || a[j] === "'") {
                  const q = a[j]; j++;
                  const valStart = j;
                  while (j < a.length && a[j] !== q) j++;
                  attrValue = a.slice(valStart, j);
                  if (j < a.length) j++;
                } else {
                  const valStart = j;
                  while (j < a.length && !/\s/.test(a[j]) && a[j] !== '>') j++;
                  attrValue = a.slice(valStart, j);
                }
              }
              if (!allowedAttributes.has(attrName)) continue;
              if (attrName === 'href' || attrName === 'src') {
                const v = attrValue.toLowerCase();
                if (v.startsWith('javascript:') || v.startsWith('data:') || v.startsWith('vbscript:')) continue;
              }
              if (attrName === 'target' && attrValue !== '_blank') continue;
              if (attrName === 'rel' && attrValue !== 'noopener noreferrer') continue;
              const quote = attrValue.includes('"') ? "'" : '"';
              safeAttrs += ` ${attrName}=${quote}${attrValue}${quote}`;
            }
            result += `<${block.tagName}${safeAttrs}>`;
          }
        }
        continue;
      }
    }
    result += input[i];
    i++;
  }
  return result;
}
