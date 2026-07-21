const GroupAPI = {
  list(q) {
    const params = q ? '?q=' + encodeURIComponent(q) : '';
    return api.get('/api/groups' + params);
  },

  getMine() {
    return api.get('/api/groups/mine');
  },

  get(id) {
    return api.get('/api/groups/' + id);
  },

  create(data) {
    return api.post('/api/groups', data);
  },

  update(id, data) {
    return api.put('/api/groups/' + id, data);
  },

  delete(id) {
    return api.delete('/api/groups/' + id);
  },

  join(id) {
    return api.post('/api/groups/' + id + '/join');
  },

  leave(id) {
    return api.post('/api/groups/' + id + '/leave');
  },

  getMembers(id) {
    return api.get('/api/groups/' + id + '/members');
  },
};

const FollowAPI = {
  getFollowers(userId) {
    return api.get('/api/follow/' + userId + '/followers');
  },

  getFollowing(userId) {
    return api.get('/api/follow/' + userId + '/following');
  },

  follow(userId) {
    return api.post('/api/follow/' + userId + '/follow');
  },

  unfollow(userId) {
    return api.post('/api/follow/' + userId + '/unfollow');
  },

  getStatus(userId) {
    return api.get('/api/follow/' + userId + '/status');
  },
};
