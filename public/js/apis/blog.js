const BlogAPI = {
  list() {
    return api.get('/blog');
  },

  getBySlug(slug) {
    return api.get('/blog/' + encodeURIComponent(slug));
  },

  create(data) {
    return api.post('/blog', data);
  },

  update(id, data) {
    return api.put('/blog/' + id, data);
  },

  delete(id) {
    return api.delete('/blog/' + id);
  },
};
