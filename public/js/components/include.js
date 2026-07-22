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
        errEl.textContent = '[failed to load component: ' + name + ']';
        errEl.style.display = 'none';
        el.parentNode.replaceChild(errEl, el);
        loaded++;
        if (loaded === total) {
          document.dispatchEvent(new CustomEvent('components-loaded'));
        }
      });
  });
})();
