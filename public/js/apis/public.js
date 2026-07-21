const PublicAPI = {
  getLandingData() {
    return api.get('/public/landing');
  },

  getFeaturedCourses() {
    return api.get('/courses/featured');
  },

  getCourseCategories() {
    return api.get('/courses/categories');
  },

  getCoursePreview(id) {
    return api.get('/courses/' + id + '/preview');
  },
};
