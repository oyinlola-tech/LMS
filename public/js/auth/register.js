document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const submitBtn = form.querySelector('.btn-submit');
  const errorEl = document.getElementById('form-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    errorEl.style.display = 'none';

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    if (!fullName || !email || !password || !confirmPassword) {
      errorEl.textContent = 'All fields are required.';
      errorEl.style.display = 'block';
      return;
    }

    if (password !== confirmPassword) {
      errorEl.textContent = 'Passwords do not match.';
      errorEl.style.display = 'block';
      return;
    }

    if (password.length < 8) {
      errorEl.textContent = 'Password must be at least 8 characters.';
      errorEl.style.display = 'block';
      return;
    }

    if (!terms) {
      errorEl.textContent = 'You must agree to the Terms and Privacy Policy.';
      errorEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      await AuthAPI.register({ fullName, email, password });
      localStorage.setItem('pendingUserId', email);
      window.location.href = '/verify-otp';
    } catch (err) {
      const msg = err?.error?.message || err?.error?.code || 'Registration failed. Please try again.';
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
});
