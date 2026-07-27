var Sanitize = (function () {
  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
  }

  var ALLOWED_TAGS = ['p', 'br', 'b', 'i', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'hr', 'sub', 'sup'];

  function stripScripts(html) {
    var div = document.createElement('div');
    div.innerHTML = html;

    var walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null, false);
    var node;
    var nodesToRemove = [];

    while ((node = walker.nextNode())) {
      var tagName = node.tagName.toLowerCase();

      if (tagName === 'script' || tagName === 'iframe' || tagName === 'object' || tagName === 'embed' || tagName === 'form') {
        nodesToRemove.push(node);
        continue;
      }

      var attrs = node.attributes;
      for (var i = attrs.length - 1; i >= 0; i--) {
        var attrName = attrs[i].name.toLowerCase();
        if (attrName.startsWith('on')) {
          node.removeAttribute(attrs[i].name);
        } else if (attrName === 'href' || attrName === 'src') {
          var val = node.getAttribute(attrs[i].name) || '';
          if (/^javascript:/i.test(val.trim())) {
            node.removeAttribute(attrs[i].name);
          }
        }
      }

      if (!ALLOWED_TAGS.includes(tagName)) {
        var replacement = document.createElement('div');
        while (node.firstChild) {
          replacement.appendChild(node.firstChild);
        }
        nodesToRemove.push(node);
        node.parentNode.insertBefore(replacement, node);
      }
    }

    nodesToRemove.forEach(function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });

    return div.innerHTML;
  }

  function sanitizeComponentHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    var walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null, false);
    var node;
    var nodesToRemove = [];
    while ((node = walker.nextNode())) {
      var tagName = node.tagName.toLowerCase();
      if (tagName === 'script' || tagName === 'iframe' || tagName === 'object' || tagName === 'embed' || tagName === 'form') {
        nodesToRemove.push(node);
        continue;
      }
      var attrs = node.attributes;
      for (var i = attrs.length - 1; i >= 0; i--) {
        var attrName = attrs[i].name.toLowerCase();
        if (attrName.startsWith('on')) {
          node.removeAttribute(attrs[i].name);
        } else if (attrName === 'href' || attrName === 'src') {
          var val = node.getAttribute(attrs[i].name) || '';
          if (/^javascript:/i.test(val.trim())) {
            node.removeAttribute(attrs[i].name);
          }
        }
      }
    }
    nodesToRemove.forEach(function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });
    return div.innerHTML;
  }

  function sanitize(html) {
    if (!html) return '';
    var text = String(html);
    var escaped = escapeHtml(text);
    if (!escaped.includes('&lt;') && !escaped.includes('&gt;')) return escaped;
    var unescaped = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    var cleaned = stripScripts(unescaped);
    var reEscaped = escapeHtml(cleaned);
    if (!reEscaped.includes('&lt;') && !reEscaped.includes('&gt;')) return reEscaped;
    return stripScripts(cleaned);
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text || '';
  }

  function setSanitizedHtml(el, html) {
    if (!el) return;
    el.innerHTML = sanitize(html);
  }

  var UNSAFE_PROTOCOLS = ['javascript:', 'vbscript:', 'data:text/html', 'data:application/xml', 'data:text/xml'];

  function sanitizeUrl(url) {
    if (!url) return '';
    var trimmed = String(url).trim().toLowerCase();
    for (var i = 0; i < UNSAFE_PROTOCOLS.length; i++) {
      if (trimmed.indexOf(UNSAFE_PROTOCOLS[i]) === 0) return '';
    }
    return String(url);
  }

  var UNSAFE_PROTOCOLS = ['javascript:', 'vbscript:', 'data:text/html', 'data:application/xml', 'data:text/xml'];

  function sanitizeUrl(url) {
    if (!url) return '';
    var trimmed = String(url).trim().toLowerCase();
    for (var i = 0; i < UNSAFE_PROTOCOLS.length; i++) {
      if (trimmed.indexOf(UNSAFE_PROTOCOLS[i]) === 0) return '';
    }
    return String(url);
  }

  return {
    escapeHtml: escapeHtml,
    sanitize: sanitize,
    setText: setText,
    setSanitizedHtml: setSanitizedHtml,
    sanitizeUrl: sanitizeUrl,
    sanitizeComponentHtml: sanitizeComponentHtml,
  };
})();
