(function () {
  function updateAuthUI() {
    var token = localStorage.getItem('token');
    document.querySelectorAll('[data-auth]').forEach(function (el) {
      var showFor = el.getAttribute('data-auth');
      if (showFor === 'guest') el.style.display = token ? 'none' : '';
      else if (showFor === 'user') el.style.display = token ? '' : 'none';
    });
  }

  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.AuthAPI && AuthAPI.logout) {
        AuthAPI.logout().catch(function () {});
      }
      localStorage.removeItem('token');
      localStorage.removeItem('needsProfileSetup');
      window.location.href = '/';
    });
  }

  updateAuthUI();
  document.addEventListener('components-loaded', updateAuthUI);
  document.addEventListener('auth-change', updateAuthUI);
})();
