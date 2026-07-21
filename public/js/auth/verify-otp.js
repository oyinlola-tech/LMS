document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.otp-input');
  const form = document.getElementById('otp-form');
  const submitBtn = form.querySelector('.btn-submit');
  const errorEl = document.getElementById('otp-error');
  const resendBtn = document.getElementById('resend-btn');
  const timerSpan = document.getElementById('timer');

  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      if (!/^\d+$/.test(paste)) return;
      const digits = paste.slice(0, inputs.length).split('');
      digits.forEach((d, i) => {
        if (inputs[i]) {
          inputs[i].value = d;
          if (i < inputs.length - 1) inputs[i + 1].focus();
        }
      });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    errorEl.style.display = 'none';

    const code = Array.from(inputs).map(i => i.value).join('');
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      errorEl.textContent = 'Please enter all 6 digits.';
      errorEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    const email = localStorage.getItem('pendingUserId');

    try {
      const result = await AuthAPI.verifyOtp({ email, code });
      if (result.data?.token) {
        localStorage.setItem('token', result.data.token);
        localStorage.removeItem('pendingUserId');
        window.location.href = '/';
      } else {
        errorEl.textContent = result.message || 'Verification failed.';
        errorEl.style.display = 'block';
      }
    } catch (err) {
      const msg = err?.error?.message || 'Verification failed. Try again.';
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      inputs.forEach(i => i.value = '');
      inputs[0].focus();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verify & Proceed';
    }
  });

  if (resendBtn) {
    resendBtn.addEventListener('click', async () => {
      resendBtn.disabled = true;
      const email = localStorage.getItem('pendingUserId');
      try {
        await AuthAPI.resendOtp({ email });
        startTimer(59);
      } catch {
        resendBtn.disabled = false;
      }
    });
  }

  function startTimer(seconds) {
    let timeLeft = seconds;
    timerSpan.textContent = `(0:${timeLeft < 10 ? '0' : ''}${timeLeft})`;
    resendBtn.classList.add('text-primary/50');

    const interval = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(interval);
        timerSpan.textContent = '';
        resendBtn.disabled = false;
        resendBtn.classList.remove('text-primary/50');
      } else {
        timerSpan.textContent = `(0:${timeLeft < 10 ? '0' : ''}${timeLeft})`;
      }
    }, 1000);
  }
});
