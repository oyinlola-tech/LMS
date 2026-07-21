(function () {
  var components = document.querySelectorAll('[data-include]');
  if (!components.length) return;

  var loaded = 0;
  var total = components.length;

  components.forEach(function (el) {
    var name = el.getAttribute('data-include');
    fetch('/components/' + name + '.html')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        el.outerHTML = html;
        loaded++;
        if (loaded === total) {
          document.dispatchEvent(new CustomEvent('components-loaded'));
        }
      })
      .catch(function () {
        el.outerHTML = '<!-- failed to load component: ' + name + ' -->';
        loaded++;
        if (loaded === total) {
          document.dispatchEvent(new CustomEvent('components-loaded'));
        }
      });
  });
})();
