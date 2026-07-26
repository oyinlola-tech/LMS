var API_BASE = '';

var api = {
  async request(method, path, body) {
    var opts = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    var token = localStorage.getItem('token');
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    var res = await fetch(API_BASE + path, opts);
    var data = await res.json();
    if (!res.ok) {
      if (res.status === 429) showRateLimitToast(data);
      throw { status: res.status, data: data };
    }
    return data;
  },

  get: function (path) { return this.request('GET', path); },
  post: function (path, body) { return this.request('POST', path, body); },
  put: function (path, body) { return this.request('PUT', path, body); },
  delete: function (path) { return this.request('DELETE', path); },
  del: function (path) { return this.request('DELETE', path); },

  async upload(path, formData) {
    var opts = { method: 'POST', body: formData };
    var token = localStorage.getItem('token');
    if (token) opts.headers = { 'Authorization': 'Bearer ' + token };
    var res = await fetch(API_BASE + path, opts);
    var data = await res.json();
    if (!res.ok) {
      if (res.status === 429) showRateLimitToast(data);
      throw { status: res.status, data: data };
    }
    return data;
  },
};

function showRateLimitToast(data) {
  var sec = 30;
  var m = data && data.message;
  if (m) { var match = m.match(/(\d+)\s*seconds?/); if (match) sec = parseInt(match[1], 10); }
  var existing = document.getElementById('rl-toast');
  if (existing) {
    existing.parentNode.removeChild(existing);
    if (window._rlInterval) { clearInterval(window._rlInterval); window._rlInterval = null; }
  }
  var toast = document.createElement('div');
  toast.id = 'rl-toast';
  toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#d32f2f;color:#fff;padding:0.85rem 1.25rem;border-radius:0.75rem;font-size:0.875rem;font-family:sans-serif;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.25);opacity:0;transform:translateY(1rem);transition:opacity 0.3s,transform 0.3s;max-width:360px';
  toast.textContent = 'Too many requests. Retry in ' + sec + 's';
  document.body.appendChild(toast);
  requestAnimationFrame(function () { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
  if (sec > 0) {
    window._rlInterval = setInterval(function () {
      sec--;
      if (sec <= 0) {
        clearInterval(window._rlInterval);
        window._rlInterval = null;
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(1rem)';
        setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
      } else {
        toast.textContent = 'Too many requests. Retry in ' + sec + 's';
      }
    }, 1000);
  }
}
