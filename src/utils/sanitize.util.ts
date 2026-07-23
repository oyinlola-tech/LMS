export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
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

  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*on\w+\s*=[^>]*>/gi, '')
    .replace(/<([a-zA-Z0-9]+)([^>]*)>/gi, (_match: string, tag: string, attrs: string) => {
      if (!allowedTags.has(tag.toLowerCase())) return '';
      const safeAttrs = attrs.replace(/(\s+[a-zA-Z-]+)\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, (_am: string, name: string, value: string) => {
        const attr = name.trim().toLowerCase();
        if (!allowedAttributes.has(attr)) return '';
        if (attr === 'href' || attr === 'src') {
          const v = value.replace(/['"]/g, '').toLowerCase();
          if (v.startsWith('javascript:') || v.startsWith('data:') || v.startsWith('vbscript:')) return '';
        }
        if (attr === 'target' && value.replace(/['"]/g, '') !== '_blank') return '';
        if (attr === 'rel' && value.replace(/['"]/g, '') !== 'noopener noreferrer') return '';
        return `${name}=${value}`;
      });
      return `<${tag}${safeAttrs}>`;
    })
    .replace(/<\/[^>]+>/g, (_match: string) => {
      const tag = _match.replace(/<\/|>/g, '').trim().toLowerCase();
      if (allowedTags.has(tag)) return _match;
      return '';
    });
}
