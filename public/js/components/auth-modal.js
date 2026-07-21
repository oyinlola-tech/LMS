(function () {
  var modal, modalLogin, modalRegister, modalOtp;
  var loginForm, registerForm, otpForm;
  var loginError, registerError, otpError;
  var switchRegister, switchLogin;
  var closeBtn;
  var currentMode = 'login';

  function init() {
    modal = document.getElementById('auth-modal');
    if (!modal) return;

    modalLogin = document.getElementById('modal-login');
    modalRegister = document.getElementById('modal-register');
    modalOtp = document.getElementById('modal-otp');
    loginForm = document.getElementById('modal-login-form');
    registerForm = document.getElementById('modal-register-form');
    otpForm = document.getElementById('modal-otp-form');
    loginError = document.getElementById('modal-login-error');
    registerError = document.getElementById('modal-register-error');
    otpError = document.getElementById('modal-otp-error');
    switchRegister = document.getElementById('modal-switch-register');
    switchLogin = document.getElementById('modal-switch-login');
    closeBtn = document.getElementById('modal-close-btn');

    var backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (switchRegister) switchRegister.addEventListener('click', function (e) {
      e.preventDefault();
      showPanel('register');
    });

    if (switchLogin) switchLogin.addEventListener('click', function (e) {
      e.preventDefault();
      showPanel('login');
    });

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (otpForm) otpForm.addEventListener('submit', handleOtp);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  function showPanel(panel) {
    loginError.style.display = 'none';
    registerError.style.display = 'none';
    otpError.style.display = 'none';

    modalLogin.style.display = panel === 'login' ? 'block' : 'none';
    modalRegister.style.display = panel === 'register' ? 'block' : 'none';
    modalOtp.style.display = panel === 'otp' ? 'block' : 'none';
    currentMode = panel;
  }

  function openModal(panel) {
    if (!modal) return;
    showPanel(panel || 'login');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    loginError.style.display = 'none';
    registerError.style.display = 'none';
    otpError.style.display = 'none';
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
    if (otpForm) {
      otpForm.querySelectorAll('.otp-input').forEach(function (i) { i.value = ''; });
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    loginError.textContent = '';
    loginError.style.display = 'none';
    var email = document.getElementById('modal-login-email').value.trim();
    var password = document.getElementById('modal-login-password').value;
    var btn = loginForm.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    AuthAPI.login({ email: email, password: password })
      .then(function (result) {
        if (result.data.requiresOtp) {
          localStorage.setItem('pendingUserId', result.data.userId);
          showPanel('otp');
        } else if (result.data.token) {
          localStorage.setItem('token', result.data.token);
          closeModal();
          window.location.reload();
        }
      })
      .catch(function (err) {
        var msg = (err && err.error && (err.error.message || err.error.code)) || 'Sign in failed.';
        loginError.textContent = msg;
        loginError.style.display = 'block';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Sign In';
      });
  }

  function handleRegister(e) {
    e.preventDefault();
    registerError.textContent = '';
    registerError.style.display = 'none';
    var fullName = document.getElementById('modal-register-name').value.trim();
    var email = document.getElementById('modal-register-email').value.trim();
    var password = document.getElementById('modal-register-password').value;
    var btn = registerForm.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    AuthAPI.register({ fullName: fullName, email: email, password: password })
      .then(function () {
        localStorage.setItem('pendingUserId', email);
        showPanel('otp');
      })
      .catch(function (err) {
        var msg = (err && err.error && (err.error.message || err.error.code)) || 'Registration failed.';
        registerError.textContent = msg;
        registerError.style.display = 'block';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Create Account';
      });
  }

  function handleOtp(e) {
    e.preventDefault();
    otpError.textContent = '';
    otpError.style.display = 'none';
    var inputs = otpForm.querySelectorAll('.otp-input');
    var code = Array.from(inputs).map(function (i) { return i.value; }).join('');
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      otpError.textContent = 'Please enter all 6 digits.';
      otpError.style.display = 'block';
      return;
    }
    var email = localStorage.getItem('pendingUserId');
    var btn = otpForm.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Verifying...';

    AuthAPI.verifyOtp({ email: email, code: code })
      .then(function (result) {
        if (result.data && result.data.token) {
          localStorage.setItem('token', result.data.token);
          localStorage.removeItem('pendingUserId');
          closeModal();
          window.location.reload();
        } else {
          otpError.textContent = result.message || 'Verification failed.';
          otpError.style.display = 'block';
        }
      })
      .catch(function (err) {
        var msg = (err && err.error && err.error.message) || 'Verification failed.';
        otpError.textContent = msg;
        otpError.style.display = 'block';
        inputs.forEach(function (i) { i.value = ''; });
        if (inputs[0]) inputs[0].focus();
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Verify';
      });
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('components-loaded', init);

  window.openAuthModal = openModal;
  window.closeAuthModal = closeModal;
})();
