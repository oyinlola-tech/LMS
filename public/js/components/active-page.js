document.addEventListener('components-loaded', function() {
  var path = window.location.pathname;
  var page = 'dashboard';
  if (path.startsWith('/messages') || path.startsWith('/messaging')) page = 'messages';
  else if (path.startsWith('/profile')) page = 'profile';
  else if (path.startsWith('/courses') || path.startsWith('/course')) page = 'courses';
  else if (path.startsWith('/settings')) page = 'settings';
  else if (path.startsWith('/analytics') || path.startsWith('/tutor/analytics')) page = 'analytics';
  else if (path.startsWith('/users') || path.startsWith('/admin/users')) page = 'users';
  else if (path.startsWith('/system')) page = 'system';

  document.querySelectorAll('[data-page]').forEach(function(el) {
    if (el.getAttribute('data-page') === page) el.classList.add('active');
  });
});
