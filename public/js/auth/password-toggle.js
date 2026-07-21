function bindPwToggle(btn) {
  if (btn._pwBound) return;
  btn._pwBound = true;
  btn.addEventListener('click', function () {
    var input = document.getElementById(btn.getAttribute('data-toggle-pw'));
    if (!input) return;
    var isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    var icon = btn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = isPassword ? 'visibility' : 'visibility_off';
  });
}

function initPwToggles() {
  document.querySelectorAll('[data-toggle-pw]').forEach(bindPwToggle);
}

document.addEventListener('DOMContentLoaded', initPwToggles);
document.addEventListener('components-loaded', initPwToggles);
