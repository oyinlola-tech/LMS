var escapeHtml = (function () {
  var entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return function (str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (c) { return entityMap[c] || c; });
  };
})();

var sanitizeHtml = (function () {
  var tagBody = '(?:[^\"\\'\\s][^\"\\']*|\"[^\"]*\"|\\'[^\\']*\\')';
  var tagOrComment = new RegExp('<(/?)([a-zA-Z][a-zA-Z0-9]*)(\\s(?:[^>]|' + tagBody + ')*)\\s*(/?)>', 'g');
  return function (html) {
    if (!html) return '';
    return String(html).replace(tagOrComment, function (match, close, tag, rest, selfClosing) {
      if (/^(br|hr|img|input|b|i|u|em|strong|p|div|span|ul|ol|li|h[1-6]|pre|code|blockquote|a|table|tr|td|th|thead|tbody|section|article|header|footer|main|aside|nav|figure|figcaption|mark|small|sub|sup|ins|del|s|q|cite|abbr|time|dl|dt|dd)$/i.test(tag)) {
        return match;
      }
      return '';
    });
  };
})();

if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
  window.sanitizeHtml = sanitizeHtml;
}
