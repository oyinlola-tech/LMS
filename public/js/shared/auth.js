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
};

window.Shared = Shared;