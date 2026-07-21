const AdminAPI = {
  getDashboard(range) {
    return api.get(`/admin/dashboard?range=${range || '7d'}`);
  },

  exportDashboard(range) {
    return api.get(`/admin/dashboard/export?range=${range || '7d'}`);
  },

  getReport(format, range) {
    return api.get(`/admin/dashboard/report?format=${format || 'json'}&range=${range || '7d'}`);
  },

  getAuditTrail(limit) {
    return api.get(`/admin/dashboard/audit?limit=${limit || 50}`);
  },

  listUsers(params) {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${q}`);
  },

  getUser(id) {
    return api.get(`/admin/users/${id}`);
  },

  updateUser(id, data) {
    return api.put(`/admin/users/${id}`, data);
  },

  deleteUser(id) {
    return api.delete(`/admin/users/${id}`);
  },
};
