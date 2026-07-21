const ReviewsAPI = {
  submit(courseId, data) {
    return api.post('/courses/' + courseId + '/reviews', data);
  },

  getCourseReviews(courseId) {
    return api.get('/courses/' + courseId + '/reviews');
  },

  getTestimonials() {
    return api.get('/public/testimonials');
  },
};
