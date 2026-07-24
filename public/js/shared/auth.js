var Shared = window.Shared || {};

function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; }

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
    var self = this;
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
              self.showWarningModal(unread);
            }
          }
        }
      })
      .catch(function () {});
  },
  fetchAndShowWarnings: function () {
    if (!this.isLoggedIn()) return;
    var token = localStorage.getItem('token');
    var self = this;
    fetch('/users/warnings', { headers: { Authorization: 'Bearer ' + token } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.data && res.data.length) {
          var unread = res.data.filter(function (w) { return !w.readAt; });
          if (unread.length) self.showWarningModal(res.data);
          else alert('No warnings.');
        }
      })
      .catch(function () {});
  },
  showWarningModal: function (warnings) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    overlay.innerHTML = '<div class="modal-backdrop"></div>'
      + '<div class="modal-container" style="max-width: 28rem">'
      + '<div class="modal-header"><h2 style="font-size:1.25rem;font-weight:700;display:flex;align-items:center;gap:0.5rem"><span class="material-symbols-outlined" style="color:var(--error)">warning</span> Warnings</h2><button class="modal-close" id="warning-modal-close" type="button"><span class="material-symbols-outlined">close</span></button></div>'
      + '<div class="modal-body">'
      + '<p style="margin-bottom:1rem;color:var(--on-surface-variant);font-size:0.875rem">You have received the following warnings:</p>'
      + '<div id="warning-list" style="display:flex;flex-direction:column;gap:0.75rem">'
      + warnings.map(function (w) {
          var issuedBy = w.issuedBy || {};
          return '<div class="warning-item" style="padding:1rem;border:1px solid var(--outline-variant);border-radius:0.75rem;background:var(--surface)">'
            + '<p style="font-size:0.875rem;margin-bottom:0.5rem">' + escapeHtml(w.reason) + '</p>'
            + '<div style="display:flex;justify-content:space-between;align-items:center">'
            + '<span style="font-size:0.75rem;color:var(--on-surface-variant)">by ' + escapeHtml(issuedBy.fullName || 'Admin') + '</span>'
            + '<button class="mark-read-btn" data-id="' + w.id + '" style="font-size:0.75rem;padding:0.25rem 0.75rem;border-radius:0.5rem;border:1px solid var(--outline-variant);background:none;cursor:pointer;color:var(--primary);font-weight:600">Mark Read</button>'
            + '</div></div>';
        }).join('')
      + '</div></div></div>';
    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');
    overlay.querySelector('.modal-backdrop').addEventListener('click', function () { overlay.remove(); document.body.classList.remove('modal-open'); });
    overlay.querySelector('#warning-modal-close').addEventListener('click', function () { overlay.remove(); document.body.classList.remove('modal-open'); });
    overlay.querySelectorAll('.mark-read-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var token = localStorage.getItem('token');
        fetch('/admin/reports/warnings/' + id + '/read', { method: 'PUT', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } })
          .then(function () {
            var item = btn.closest('.warning-item');
            if (item) item.style.opacity = '0.5';
            btn.textContent = 'Read';
            btn.disabled = true;
            var remaining = overlay.querySelectorAll('.mark-read-btn:not([disabled])').length;
            var badge = document.getElementById('warning-badge');
            if (badge) badge.textContent = remaining;
            if (!remaining) { overlay.remove(); document.body.classList.remove('modal-open'); }
          })
          .catch(function () {});
      });
    });
  },
};

window.Shared = Shared;