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
        <td><span class="badge ${u.role === 'admin' ? 'active' : ''}">${u.role || 'learner'}</span></td>
        <td><span class="badge ${u.status === 'active' ? 'active' : 'inactive'}">${u.status === 'active' ? 'Active' : 'Inactive'}</span></td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
        <td><button class="btn-icon" data-email="${u.email}" type="button">✕</button></td>
      </tr>
    `).join('')
  }

  async function loadDashboard () {
    try {
      const res = await AdminAPI.getDashboard('7d')
      const data = res.data || {}
      const totals = data.totals || {}

      $('stat-users').textContent = totals.users ?? totals.totalUsers ?? '—'
      $('stat-courses').textContent = totals.activeCourses ?? totals.totalCourses ?? '—'
      $('stat-enrollments').textContent = totals.pendingAllocations ?? '—'
      $('stat-revenue').textContent = '—'
    } catch (err) {
      console.error('Dashboard load error:', err)
    }

    try {
      const usersRes = await AdminAPI.listUsers({ limit: '10' })
      const usersData = usersRes.data || {}
      renderUsers(usersData.items || [])
    } catch (err) {
      console.error('Users load error:', err)
    }
  }

  $('logout-btn')?.addEventListener('click', function () {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  })

  loadDashboard()
})()
