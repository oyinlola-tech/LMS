document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgot-form');
  const submitBtn = form.querySelector('.btn-submit');
  const errorEl = document.getElementById('form-error');
  const successEl = document.getElementById('form-success');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    errorEl.style.display = 'none';
    successEl.textContent = '';
    successEl.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    if (!email) {
      errorEl.textContent = 'Please enter your email address.';
      errorEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      await AuthAPI.forgotPassword({ email });
      successEl.textContent = 'If the email exists, you will receive a reset link.';
      successEl.style.display = 'block';
      form.querySelector('input').value = '';
    } catch (err) {
      const msg = err?.error?.message || 'Request failed. Please try again.';
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Reset Link';
    }
  });
});
