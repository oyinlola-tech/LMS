var Shared = window.Shared || {};

Shared.escapeHtml = function (str) {
  var d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
};

Shared.sanitizeHtml = function (html) {
  if (!html) return '';
  var allowed = /^(br|hr|img|input|b|i|u|em|strong|p|div|span|ul|ol|li|h[1-6]|pre|code|blockquote|a|table|tr|td|th|thead|tbody|section|article|header|footer|main|aside|nav|figure|figcaption|mark|small|sub|sup|ins|del|s|q|cite|abbr|time|dl|dt|dd)$/i;
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

Shared.formatTime = function (iso) {
  if (!iso) return '';
  var d = new Date(iso);
  var now = new Date();
  var opts = { hour: 'numeric', minute: '2-digit' };
  if (d.toDateString() !== now.toDateString()) {
    opts.month = 'short';
    opts.day = 'numeric';
  }
  return d.toLocaleTimeString('en-US', opts);
};

Shared.formatFileSize = function (bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

Shared.$ = function (id) { return document.getElementById(id); };

window.Shared = Shared;