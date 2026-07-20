const CareerAPI = {
  list() {
    return api.get('/careers');
  },

  get(id) {
    return api.get('/careers/' + id);
  },

  create(data) {
    return api.post('/careers', data);
  },

  update(id, data) {
    return api.put('/careers/' + id, data);
  },

  delete(id) {
    return api.delete('/careers/' + id);
  },
};
