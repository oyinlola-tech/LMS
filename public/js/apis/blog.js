const BlogAPI = {
  list() {
    return api.get('/api/blog');
  },

  getBySlug(slug) {
    return api.get('/api/blog/' + encodeURIComponent(slug));
  },

  create(data) {
    return api.post('/api/blog', data);
  },

  update(id, data) {
    return api.put('/api/blog/' + id, data);
  },

  delete(id) {
    return api.delete('/api/blog/' + id);
  },
};
