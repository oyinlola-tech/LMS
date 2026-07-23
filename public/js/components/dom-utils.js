var escapeHtml = (function () {
  var entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return function (str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (c) { return entityMap[c] || c; });
  };
})();

var sanitizeHtml = (function () {
  var allowed = new RegExp('^(br|hr|img|input|b|i|u|em|strong|p|div|span|ul|ol|li|h[1-6]|pre|code|blockquote|a|table|tr|td|th|thead|tbody|section|article|header|footer|main|aside|nav|figure|figcaption|mark|small|sub|sup|ins|del|s|q|cite|abbr|time|dl|dt|dd)$', 'i');
  return function (html) {
    if (!html) return '';
    return String(html).replace(/<[^>]*>/g, function (match) {
      var m = match.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b/);
      if (m && allowed.test(m[1])) return match;
      return '';
    });
  };
})();

if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
  window.sanitizeHtml = sanitizeHtml;
}
