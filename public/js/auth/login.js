document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = form.querySelector('.btn-submit');
  const errorEl = document.getElementById('form-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    errorEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const result = await AuthAPI.login({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      });

      if (result.data.requiresOtp) {
        localStorage.setItem('pendingUserId', result.data.userId);
        window.location.href = '/verify-otp';
      } else if (result.data.token) {
        localStorage.setItem('token', result.data.token);
        window.location.href = '/';
      }
    } catch (err) {
      const msg = err?.error?.message || err?.error?.code || 'Sign in failed. Please try again.';
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
});
