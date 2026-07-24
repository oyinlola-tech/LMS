var Shared = window.Shared || {};

Shared.auth = {
  getToken: function () { return localStorage.getItem('token'); },
  setToken: function (t) { localStorage.setItem('token', t); },
  clearToken: function () { localStorage.removeItem('token'); },
  isLoggedIn: function () { return !!localStorage.getItem('token'); },

  getUser: function () {
    try {
      var token = localStorage.getItem('token');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) { return null; }
  },

  getUserId: function () {
    var u = this.getUser();
    return u ? u.sub : null;
  },

  getRole: function () {
    var u = this.getUser();
    return u ? u.role : null;
  },

  requireAuth: function () {
    if (!this.isLoggedIn()) { window.location.href = '/login'; return false; }
    return true;
  },

  checkWarnings: function () {
    if (!this.isLoggedIn()) return;
    var token = localStorage.getItem('token');
    fetch('/users/warnings', { headers: { Authorization: 'Bearer ' + token } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.data && res.data.length) {
          var unread = res.data.filter(function (w) { return !w.readAt; });
          if (unread.length) {
            var link = document.getElementById('header-warnings');
            var badge = document.getElementById('warning-badge');
            if (link) { link.style.display = 'inline-flex'; }
            if (badge) { badge.style.display = 'flex'; badge.textContent = unread.length; }
            if (!window._warningPopupShown) {
              window._warningPopupShown = true;
              alert('You have ' + unread.length + ' unread warning(s). Please check your account.');
            }
          }
        }
      })
      .catch(function () {});
  },
};

window.Shared = Shared;