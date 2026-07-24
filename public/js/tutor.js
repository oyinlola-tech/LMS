(function () {
  function updateUserInfo() {
    var nameEl = document.getElementById('user-name');
    var token = localStorage.getItem('token');
    if (token) {
      try {
        var payload = JSON.parse(atob(token.split('.')[1]));
        nameEl.textContent = payload.fullName || payload.email || 'Tutor';
      } catch (_) {}
    }
  }

  function loadDashboard() {
    api.get('/tutor-dashboard/overview').then(function (r) {
      var data = r.data || {};
      var courses = document.getElementById('stat-courses');
      var students = document.getElementById('stat-students');
      var rating = document.getElementById('stat-rating');
      var pending = document.getElementById('stat-pending');
      if (courses) courses.textContent = data.totalCourses != null ? data.totalCourses : '—';
      if (students) students.textContent = data.totalStudents != null ? data.totalStudents : '—';
      if (rating) rating.textContent = data.avgRating != null ? data.avgRating.toFixed(1) : '—';
      if (pending) pending.textContent = data.pendingSubmissions != null ? data.pendingSubmissions : '—';

      var tbody = document.getElementById('submissions-body');
      if (tbody && data.submissions && data.submissions.length) {
        tbody.innerHTML = data.submissions.map(function (s) {
          var statusClass = s.status === 'submitted' ? 'pending' : 'active';
          return '<tr>'
            + '<td>' + escapeHtml(s.studentName || '—') + '</td>'
            + '<td>' + escapeHtml(s.courseTitle || '—') + '</td>'
            + '<td>' + escapeHtml(s.assignmentTitle || '—') + '</td>'
            + '<td><span class="badge ' + statusClass + '">' + escapeHtml(s.status) + '</span></td>'
            + '<td><button class="btn-icon" onclick="location.href=\'/tutor\'"><span class="material-symbols-outlined">visibility</span></button></td>'
            + '</tr>';
        }).join('');
      } else if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--on-surface-variant)">No pending submissions.</td></tr>';
      }
    }).catch(function () {
      var tbody = document.getElementById('submissions-body');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--error)">Failed to load data.</td></tr>';
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
