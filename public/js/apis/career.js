const CareerAPI = {
  list() {
    return api.get('/api/careers');
  },

  get(id) {
    return api.get('/api/careers/' + id);
  },

  create(data) {
    return api.post('/api/careers', data);
  },

  update(id, data) {
    return api.put('/api/careers/' + id, data);
  },

  delete(id) {
    return api.delete('/api/careers/' + id);
  },
};
