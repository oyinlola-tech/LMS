(function () {
  var components = document.querySelectorAll('[data-include]');
  if (!components.length) return;

  var loaded = 0;
  var total = components.length;

  components.forEach(function (el) {
    var name = el.getAttribute('data-include');
    var path;
    if (name.indexOf('/') !== -1) {
      path = name + '.html';
    } else {
      path = '/components/' + name + '.html';
    }
    fetch(path)
      .then(function (res) { return res.text(); })
      .then(function (html) {
        el.outerHTML = html;
        loaded++;
        if (loaded === total) {
          document.dispatchEvent(new CustomEvent('components-loaded'));
        }
      })
      .catch(function () {
        var errEl = document.createElement('div');
        errEl.textContent = '[Component: ' + name + ' failed to load]';
        errEl.style.cssText = 'padding:0.75rem;text-align:center;font-size:0.8125rem;color:var(--error,#c62828);background:var(--surface-container,#f5f5f5);border:1px dashed var(--outline-variant,#ccc);border-radius:0.5rem;margin:0.25rem 0';
        el.parentNode.replaceChild(errEl, el);
        loaded++;
        if (loaded === total) {
          document.dispatchEvent(new CustomEvent('components-loaded'));
        }
      });
  });
})();
