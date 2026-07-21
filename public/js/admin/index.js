(function () {
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/login'
    return
  }

  const $ = id => document.getElementById(id)

  function renderUsers (users) {
    const tbody = $('users-table-body')
    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--on-surface-variant)">No users found.</td></tr>'
      return
    }
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.fullName || '—'}</td>
        <td>${u.email}</td>
        <td><span class="badge ${u.role === 'admin' ? 'active' : ''}">${u.role || 'student'}</span></td>
        <td><span class="badge ${u.isActive ? 'active' : 'inactive'}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
        <td><button class="btn-icon" data-email="${u.email}" type="button">✕</button></td>
      </tr>
    `).join('')
  }

  async function loadDashboard () {
    try {
      const data = await AdminAPI.getDashboard(token)
      $('stat-users').textContent = data.totalUsers ?? '—'
      $('stat-courses').textContent = data.totalCourses ?? '—'
      $('stat-enrollments').textContent = data.totalEnrollments ?? '—'
      $('stat-revenue').textContent = data.revenue != null ? `$${data.revenue.toLocaleString()}` : '—'
      if (data.adminEmail) $('admin-email').textContent = data.adminEmail
      renderUsers(data.recentUsers)
    } catch (err) {
      console.error('Dashboard load error:', err)
    }
  }

  $('logout-btn')?.addEventListener('click', function () {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  })

  loadDashboard()
})()
