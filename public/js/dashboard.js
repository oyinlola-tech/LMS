(function () {
  function updateUserInfo() {
    var nameEl = document.getElementById('user-name');
    var token = localStorage.getItem('token');
    if (token) {
      try {
        var payload = JSON.parse(atob(token.split('.')[1]));
        nameEl.textContent = payload.fullName || payload.email || 'Learner';
      } catch (_) {}
    }
  }

  function loadDashboard() {
    api.get('/dashboard').then(function (r) {
      var data = r.data || {};
      var enrolled = document.getElementById('stat-enrolled');
      var completed = document.getElementById('stat-completed');
      var certs = document.getElementById('stat-certificates');
      var streak = document.getElementById('stat-streak');
      if (enrolled) enrolled.textContent = data.enrolledCourses != null ? data.enrolledCourses : '—';
      if (completed) completed.textContent = data.completedCourses != null ? data.completedCourses : '—';
      if (certs) certs.textContent = data.certificates != null ? data.certificates : '—';
      if (streak) streak.textContent = data.streakDays != null ? data.streakDays : '—';

      var list = document.getElementById('my-courses-list');
      if (list && data.courses && data.courses.length) {
        list.innerHTML = data.courses.map(function (c) {
          var progress = c.progress || 0;
          return '<div class="course-progress-card">'
            + '<div style="flex: 1">'
            + '<p class="font-bold">' + escapeHtml(c.title) + '</p>'
            + '<div class="progress-bar"><div class="progress-bar-fill" style="width: ' + progress + '%"></div></div>'
            + '<p class="text-xs mt-1" style="color: var(--on-surface-variant)">' + progress + '% complete</p>'
            + '</div>'
            + '<a href="/courses/' + c.id + '" class="btn-icon"><span class="material-symbols-outlined">arrow_forward</span></a>'
            + '</div>';
        }).join('');
      } else if (list) {
        list.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--on-surface-variant)">You are not enrolled in any courses yet. <a href="/courses" style="color: var(--primary)">Browse courses</a></div>';
      }
    }).catch(function () {
      var list = document.getElementById('my-courses-list');
      if (list) list.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--error)">Failed to load dashboard data.</div>';
    });
  }

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
  }

  document.addEventListener('components-loaded', function () {
    updateUserInfo();
    loadDashboard();

    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && !logoutBtn._listener) {
      logoutBtn._listener = true;
      logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('token');
        window.location.href = '/';
      });
    }
  });
})();
