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
    if (!res.ok) throw { status: res.status, data: data };
    return data;
  },

  get: function (path) { return this.request('GET', path); },
  post: function (path, body) { return this.request('POST', path, body); },
  put: function (path, body) { return this.request('PUT', path, body); },
  delete: function (path) { return this.request('DELETE', path); },
  del: function (path) { return this.request('DELETE', path); },
};
