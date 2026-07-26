function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; }

function formatCurrency(amount, currency) {
  if (amount == null || isNaN(amount)) return 'Free';
  var c = (currency || 'USD').toUpperCase();
  var decimals = 2;
  if (c === 'XOF' || c === 'XAF' || c === 'BIF' || c === 'DJF' || c === 'GNF' || c === 'KMF' || c === 'MGA' || c === 'RWF' || c === 'VND' || c === 'JPY' || c === 'KRW') decimals = 0;
  var fixed = Number(amount).toFixed(decimals);
  var symbols = { USD: '$', NGN: '₦', GBP: '£', EUR: '€', KES: 'KSh', GHS: 'GH₵', ZAR: 'R', XOF: 'CFA', XAF: 'CFA', EGP: 'E£' };
  var sym = symbols[c] || c + ' ';
  return sym + fixed;
}
var DEFAULT_IMG = '/img/placeholder.svg';
var profileId = window.location.pathname.split('/').pop();
if (profileId === 'profile' || profileId === 'profile.html' || profileId === '') { profileId = null; }
var currentUserId = null;

function getUserId() {
  try {
    var token = localStorage.getItem('token');
    if (token) { var p = JSON.parse(atob(token.split('.')[1])); currentUserId = p.sub; }
  } catch(e) {}
}

function showLoading() { document.getElementById('loading-profile').style.display = 'block'; document.getElementById('error-profile').style.display = 'none'; document.getElementById('profile-content').style.display = 'none'; }
function showError() { document.getElementById('loading-profile').style.display = 'none'; document.getElementById('error-profile').style.display = 'block'; document.getElementById('profile-content').style.display = 'none'; }
function showContent() { document.getElementById('loading-profile').style.display = 'none'; document.getElementById('error-profile').style.display = 'none'; document.getElementById('profile-content').style.display = 'block'; }

function loadProfile() {
  showLoading();
  var targetId = profileId;
  if (!targetId || targetId === 'profile.html' || targetId === '') {
    if (currentUserId) {
      targetId = currentUserId;
    } else {
      showError();
      return;
    }
  }

  api.get('/users/' + targetId).then(function(res) {
    if (!res || !res.data) { showError(); return; }
    var u = res.data;
    renderProfile(u);
    loadUserContent(u);
    showContent();
  }).catch(function() { showError(); });

  if (localStorage.getItem('token') && currentUserId && currentUserId !== targetId) {
    api.get('/api/follow/' + targetId + '/status').then(function(res) {
      if (res && res.data) renderFollowBtn(res.data.isFollowing);
    }).catch(function() {});
  }
}

function renderProfile(u) {
  document.title = 'LearnBridge - ' + (u.fullName || 'Profile');

  document.getElementById('profile-avatar').style.backgroundImage = 'url(' + (u.avatarUrl || DEFAULT_IMG) + ')';
  document.getElementById('profile-name').textContent = u.fullName || '';

  var isAdmin = u.role === 'admin' || u.role === 'super_admin';
  var badge = document.getElementById('profile-verified-badge');
  if (isAdmin) { badge.style.display = 'inline-flex'; } else { badge.style.display = 'none'; }

  var headline = u.TutorProfile ? u.TutorProfile.headline || '' : '';
  document.getElementById('profile-headline').textContent = headline || (u.role === 'tutor' ? 'Instructor' : u.role === 'admin' || u.role === 'super_admin' ? 'Administrator' : 'Learner');
  document.getElementById('profile-bio').textContent = u.bio || '';

  document.getElementById('profile-followers').textContent = u.followerCount || 0;
  document.getElementById('profile-following').textContent = u.followingCount || 0;

  if (u.role === 'learner' && u.LearnerStats) {
    renderLearnerStats(u.LearnerStats);
  }

  var msgBtn = document.getElementById('profile-msg-btn');
  var followBtn = document.getElementById('profile-follow-btn');
  if (localStorage.getItem('token') && currentUserId !== profileId) {
    msgBtn.style.display = 'inline-flex';
    msgBtn.onclick = function() { startConversation(u.id, u.fullName); };
    followBtn.style.display = 'inline-flex';
  }
}

function renderFollowBtn(isFollowing) {
  var btn = document.getElementById('profile-follow-btn');
  btn.textContent = isFollowing ? 'Following' : 'Follow';
  btn.style.background = isFollowing ? 'var(--primary)' : 'var(--surface-variant)';
  btn.style.color = isFollowing ? '#fff' : 'var(--on-surface)';
  btn.onclick = function() {
    var url = isFollowing ? '/api/follow/' + profileId + '/unfollow' : '/api/follow/' + profileId + '/follow';
    var method = isFollowing ? 'DELETE' : 'POST';
    api.request(url, { method: method }).then(function() {
      isFollowing = !isFollowing;
      renderFollowBtn(isFollowing);
    }).catch(function(err) {
      if (err && err.error && err.error.code === 'ALREADY_FOLLOWING') {
        isFollowing = true;
        renderFollowBtn(true);
      }
    });
  };
}

function renderLearnerStats(stats) {
  var container = document.getElementById('learner-stats');
  container.style.display = 'grid';
  container.innerHTML = ''
    + '<div class="stat-card"><div class="text-2xl font-black" style="color:var(--primary)">' + (stats.coursesActive || 0) + '</div><div class="text-xs mt-1" style="color:var(--on-surface-variant)">Active Courses</div></div>'
    + '<div class="stat-card"><div class="text-2xl font-black" style="color:var(--primary)">' + (stats.coursesCompleted || 0) + '</div><div class="text-xs mt-1" style="color:var(--on-surface-variant)">Completed</div></div>'
    + '<div class="stat-card"><div class="text-2xl font-black" style="color:var(--primary)">' + Math.round(stats.hoursSpent || 0) + '</div><div class="text-xs mt-1" style="color:var(--on-surface-variant)">Hours Spent</div></div>'
    + '<div class="stat-card"><div class="text-2xl font-black" style="color:var(--primary)">' + (stats.weeklyGoalProgressHours || 0) + ' / ' + (stats.weeklyGoalHours || 0) + '</div><div class="text-xs mt-1" style="color:var(--on-surface-variant)">Weekly Goal</div></div>';
}

function startConversation(participantId, name) {
  if (!localStorage.getItem('token')) { if (typeof openAuthModal === 'function') openAuthModal('login'); return; }
  var subject = prompt('Message to ' + name + ':');
  if (!subject) return;
  api.post('/messages/threads', { participantId: participantId, subject: '', message: subject })
    .then(function(res) {
      if (res && res.data && res.data.threadId) window.location.href = '/messages';
    })
    .catch(function(err) { alert((err && err.error && err.error.message) || 'Failed to send'); });
}

function loadUserContent(u) {
  if (u.role === 'tutor') {
    api.get('/users/' + profileId).then(function(res) {
      if (res && res.data && res.data.courses) renderCourseGrid(res.data.courses);
    }).catch(function() {});
  } else {
    api.get('/courses/featured').then(function(res) {
      if (res && res.data) {
        var mine = res.data.filter(function(c) { return c.tutor && c.tutor.id === profileId; });
        renderCourseGrid(mine.length ? mine : []);
      }
    }).catch(function() {});
  }

  api.get('/api/groups/mine').then(function(res) {
    if (res && res.data) {
      var mine = res.data.filter(function(g) { return g.creator && g.creator.id === profileId; });
      renderCommunities(mine);
    }
  }).catch(function() {});

  renderAchievements(u);
  renderAbout(u);
}

function renderCourseGrid(courses) {
  var grid = document.getElementById('courses-grid');
  if (!courses || !courses.length) {
    grid.innerHTML = '<div class="col-span-full text-center py-8" style="color:var(--on-surface-variant)"><span class="material-symbols-outlined text-4xl mb-2">school</span><p>No courses yet.</p></div>';
    return;
  }
  grid.innerHTML = courses.map(function(c) {
    return '<a href="/course/' + c.id + '" class="block rounded-2xl overflow-hidden border transition-all hover:shadow-lg" style="background:#fff;border-color:var(--outline-variant);text-decoration:none;color:inherit">'
      + '<div class="h-36" style="background-image:url(' + (c.thumbnailUrl || DEFAULT_IMG) + ');background-size:cover;background-position:center"></div>'
      + '<div class="p-4"><h3 class="font-bold text-sm">' + escapeHtml(c.title || '') + '</h3>'
      + '<div class="flex items-center gap-2 mt-2">'
      + '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded" style="background:var(--primary-fixed);color:var(--on-primary-fixed)">' + (c.difficulty || '') + '</span>'
      + (c.price != null ? '<span class="text-xs font-bold">' + formatCurrency(c.price, c.currency) + '</span>' : '<span class="text-xs font-bold" style="color:var(--primary)">Free</span>')
      + '</div></div></a>';
  }).join('');
}

function renderCommunities(groups) {
  var grid = document.getElementById('communities-grid');
  var items = Array.isArray(groups) ? groups : (groups.items || groups.rows || []);
  if (!items.length) {
    grid.innerHTML = '<div class="col-span-full text-center py-8" style="color:var(--on-surface-variant)"><span class="material-symbols-outlined text-4xl mb-2">groups</span><p>No communities yet.</p></div>';
    return;
  }
  grid.innerHTML = items.map(function(g) {
    return '<div class="rounded-2xl border p-4" style="background:#fff;border-color:var(--outline-variant)">'
      + '<div class="flex items-center gap-3 mb-2">'
      + '<div class="size-10 rounded-xl" style="background:var(--primary-fixed);display:flex;align-items:center;justify-content:center">'
      + '<span class="material-symbols-outlined" style="color:var(--primary);font-size:1.25rem">group</span></div>'
      + '<div><h3 class="font-bold text-sm">' + escapeHtml(g.name || '') + '</h3>'
      + '<p class="text-xs" style="color:var(--on-surface-variant)">' + escapeHtml((g.description || '').substring(0, 80)) + '</p></div></div>'
      + (g._count && g._count.members ? '<p class="text-xs" style="color:var(--on-surface-variant)">' + g._count.members + ' members</p>' : '')
      + '</div>';
  }).join('');
}

function renderAchievements(u) {
  var container = document.getElementById('achievements-content');
  var hasAchievements = u.UserStreak || u.Milestones || u.UserSkillProgress;

  if (!hasAchievements) {
    container.innerHTML = '<div class="text-center py-8" style="color:var(--on-surface-variant)"><span class="material-symbols-outlined text-4xl mb-2">emoji_events</span><p>No achievements yet.</p></div>';
    return;
  }

  var html = '<div class="grid gap-4 md:grid-cols-2">';

  if (u.UserStreak) {
    html += '<div class="rounded-2xl border p-5" style="background:#fff;border-color:var(--outline-variant)">'
      + '<div class="flex items-center gap-3 mb-3"><span class="material-symbols-outlined" style="font-size:2rem;color:var(--tertiary)">local_fire_department</span>'
      + '<div><h3 class="font-bold">Learning Streak</h3></div></div>'
      + '<div class="flex items-end gap-4"><span class="text-4xl font-black" style="color:var(--tertiary)">' + (u.UserStreak.currentStreak || 0) + '</span>'
      + '<span class="text-sm mb-1" style="color:var(--on-surface-variant)">current streak</span></div>'
      + '<p class="text-xs mt-2" style="color:var(--on-surface-variant)">Longest: ' + (u.UserStreak.longestStreak || 0) + ' days</p>'
      + '</div>';
  }

  if (u.Milestones && u.Milestones.length) {
    html += '<div class="rounded-2xl border p-5" style="background:#fff;border-color:var(--outline-variant)">'
      + '<h3 class="font-bold mb-3 flex items-center gap-2"><span class="material-symbols-outlined">flag</span> Milestones</h3>';
    u.Milestones.slice(0, 5).forEach(function(m) {
      var done = m.completedAt ? 'style="text-decoration:line-through;color:var(--on-surface-variant)"' : '';
      html += '<div class="flex items-center gap-2 py-1"><span class="material-symbols-outlined" style="font-size:1rem;' + (m.completedAt ? 'color:var(--primary)' : 'color:var(--outline)') + '">' + (m.completedAt ? 'check_circle' : 'radio_button_unchecked') + '</span><span class="text-sm" ' + done + '>' + escapeHtml(m.title) + '</span></div>';
    });
    html += '</div>';
  }

  if (u.UserSkillProgress && u.UserSkillProgress.length) {
    html += '<div class="rounded-2xl border p-5 md:col-span-2" style="background:#fff;border-color:var(--outline-variant)">'
      + '<h3 class="font-bold mb-3 flex items-center gap-2"><span class="material-symbols-outlined">trending_up</span> Skills</h3>'
      + '<div class="grid gap-3 md:grid-cols-2">';
    u.UserSkillProgress.slice(0, 6).forEach(function(s) {
      html += '<div><div class="flex justify-between text-xs mb-1"><span class="font-medium">' + escapeHtml(s.skill) + '</span><span style="color:var(--on-surface-variant)">' + (s.level || 'beginner') + '</span></div>'
        + '<div style="height:6px;background:var(--surface-variant);border-radius:999px;overflow:hidden"><div style="height:100%;width:' + (s.percent || 0) + '%;background:var(--primary);border-radius:999px;transition:width 0.5s"></div></div></div>';
    });
    html += '</div></div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

function renderAbout(u) {
  var html = '<div class="grid gap-4 md:grid-cols-2">';
  html += '<div><p class="text-xs font-bold mb-1" style="color:var(--on-surface-variant)">Role</p><p class="text-sm font-medium capitalize">' + (u.role || '').replace('_', ' ') + '</p></div>';
  if (u.email) html += '<div><p class="text-xs font-bold mb-1" style="color:var(--on-surface-variant)">Email</p><p class="text-sm font-medium">' + escapeHtml(u.email) + '</p></div>';
  if (u.location) html += '<div><p class="text-xs font-bold mb-1" style="color:var(--on-surface-variant)">Location</p><p class="text-sm font-medium">' + escapeHtml(u.location) + '</p></div>';
  if (u.skills && u.skills.length) {
    html += '<div class="md:col-span-2"><p class="text-xs font-bold mb-1" style="color:var(--on-surface-variant)">Skills</p><div class="flex flex-wrap gap-1.5">';
    u.skills.forEach(function(s) { html += '<span class="text-xs px-2 py-0.5 rounded" style="background:var(--surface-variant)">' + escapeHtml(s) + '</span>'; });
    html += '</div></div>';
  }
  html += '</div>';
  document.getElementById('about-content').innerHTML = html;
}

function updateAuthUI() {
  var token = localStorage.getItem('token');
  var loginBtn = document.getElementById('header-login');
  var joinBtn = document.getElementById('header-join');
  var profileBtn = document.getElementById('header-profile');
  var logoutBtn = document.getElementById('header-logout');
  if (token && profileBtn && logoutBtn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (joinBtn) joinBtn.style.display = 'none';
    profileBtn.style.display = 'flex';
    logoutBtn.style.display = 'flex';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  getUserId();
  loadProfile();
  updateAuthUI();
});

document.addEventListener('components-loaded', function() {
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
      btn.classList.add('active');
      var tab = document.getElementById('tab-' + btn.getAttribute('data-tab'));
      if (tab) tab.classList.add('active');
    });
  });
});
