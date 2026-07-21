const AuthAPI = {
  register(data) {
    return api.post('/auth/register', data);
  },

  login(data) {
    return api.post('/auth/login', data);
  },

  verifyOtp(data) {
    return api.post('/auth/verify-otp', data);
  },

  resendOtp(data) {
    return api.post('/auth/resend-otp', data);
  },

  forgotPassword(data) {
    return api.post('/auth/forgot-password', data);
  },

  resetPassword(data) {
    return api.post('/auth/reset-password', data);
  },

  logout() {
    return api.post('/auth/logout');
  },
};
