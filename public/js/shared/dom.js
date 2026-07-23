var Shared = window.Shared || {};

Shared.escapeHtml = function (str) {
  var d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
};

Shared.sanitizeHtml = function (html) {
  if (!html) return '';
  var allowed = /^(br|hr|img|input|b|i|u|em|strong|p|div|span|ul|ol|li|h[1-6]|pre|code|blockquote|a|table|tr|td|th|thead|tbody|section|article|header|footer|main|aside|nav|figure|figcaption|mark|small|sub|sup|ins|del|s|q|cite|abbr|time|dl|dt|dd)$/i;
  return String(html).replace(/<[^>]*>/g, function (match) {
    var m = match.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b/);
    if (m && allowed.test(m[1])) return match;
    return '';
  });
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