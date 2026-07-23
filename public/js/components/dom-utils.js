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
    var parser = new DOMParser();
    var doc = parser.parseFromString('<div>' + html + '</div>', 'text/html');
    function clean(node) {
      if (node.nodeType === 3) return node;
      if (node.nodeType !== 1) return null;
      var tag = node.tagName.toLowerCase();
      if (!allowed.test(tag)) return null;
      var clone = document.createElement(tag);
      for (var i = 0; i < node.attributes.length; i++) {
        var attr = node.attributes[i];
        if (/^on/i.test(attr.name)) continue;
        if (attr.name === 'href' || attr.name === 'src') {
          var v = attr.value.trim().toLowerCase();
          if (v.startsWith('javascript:') || v.startsWith('data:') || v.startsWith('vbscript:')) continue;
        }
        clone.setAttribute(attr.name, attr.value);
      }
      for (var j = 0; j < node.childNodes.length; j++) {
        var cleaned = clean(node.childNodes[j]);
        if (cleaned) clone.appendChild(cleaned);
      }
      return clone;
    }
    var root = doc.body.firstChild;
    var result = root ? clean(root) : null;
    return result ? result.innerHTML : '';
  };
})();

if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
  window.sanitizeHtml = sanitizeHtml;
}
