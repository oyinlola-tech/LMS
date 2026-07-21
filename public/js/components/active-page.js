document.addEventListener('components-loaded', function() {
  var path = window.location.pathname;
  var page = 'dashboard';
  if (path.startsWith('/messages') || path.startsWith('/messaging')) page = 'messages';
  else if (path.startsWith('/profile')) page = 'profile';
  else if (path.includes('courses') && !path.startsWith('/admin') && !path.startsWith('/tutor')) page = 'courses';
  else if (path.includes('settings')) page = 'settings';
  else if (path.includes('analytics')) page = 'analytics';
  else if (path.includes('users') || path.includes('admins')) page = 'users';
  else if (path.includes('system')) page = 'system';

  document.querySelectorAll('[data-page]').forEach(function(el) {
    if (el.getAttribute('data-page') === page) el.classList.add('active');
  });
});
