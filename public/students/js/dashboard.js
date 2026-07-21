(function () {
  var overviewData = null;

  function updateUserInfo() {
    var nameEl = id('dash-user-name');
    var avatarEl = id('dash-user-avatar');
    var token = localStorage.getItem('token');
    if (token) {
      try {
        var payload = JSON.parse(atob(token.split('.')[1]));
        nameEl.textContent = payload.fullName || payload.email || 'Learner';
        if (payload.avatarUrl) avatarEl.style.backgroundImage = 'url(' + payload.avatarUrl + ')';
      } catch (_) {}
    }
  }

  function loadOverview() {
    api.get('/dashboard/overview').then(function (r) {
      overviewData = r.data || {};
      renderMastery(overviewData);
      renderAnnouncements(overviewData.announcements);
      renderCourses(overviewData.recommendedCourses, overviewData.stats);
      renderMentors(overviewData.recommendedMentors);
      renderMilestones(overviewData.milestones, overviewData.completedMilestones);
      renderWeeklyGoal(overviewData.weeklyGoal);
    }).catch(function () {
      showError('mastery-section', 'Failed to load dashboard data');
    });
  }

  function renderMastery(data) {
    var stats = data.stats || {};
    var score = stats.masteryScore || 0;
    var numEl = id('mastery-score-num');
    if (numEl) numEl.textContent = score;

    var circumference = 326.73;
    var offset = circumference - (score / 100) * circumference;
    var ring = id('mastery-ring');
    if (ring) setTimeout(function () { ring.style.strokeDashoffset = offset; }, 200);

    var encouragement = id('mastery-encouragement');
    if (encouragement) {
      if (score >= 90) encouragement.textContent = 'Outstanding! You\u2019re in the top 10% of learners this month.';
      else if (score >= 75) encouragement.textContent = 'Great work! You\u2019re in the top 25% of learners.';
      else if (score >= 50) encouragement.textContent = 'Keep going! You\u2019re above average. You\u2019re in the top 50% of learners.';
      else if (score >= 25) encouragement.textContent = 'You\u2019re making progress! Stay consistent to climb higher.';
      else encouragement.textContent = 'Start learning today to build your mastery!';
    }

    setText('mstat-courses', (stats.coursesActive || 0) + (stats.coursesCompleted || 0));
    setText('mstat-hours', Math.round(stats.hoursSpent || 0));
    setText('mstat-streak', stats.streakDays || 0);
  }

  function renderAnnouncements(announcements) {
    var list = id('announcements-list');
    if (!list) return;
    if (!announcements || !announcements.length) {
      list.innerHTML = '<div class="rounded-2xl border p-4 text-center" style="background:var(--surface-container);border-color:var(--outline-variant)"><p class="text-sm" style="color:var(--on-surface-variant)">No announcements yet.</p></div>';
      return;
    }
    list.innerHTML = announcements.slice(0, 4).map(function (a) {
      var courseName = a.Course ? a.Course.title : '';
      var body = a.body || '';
      return '<div class="announcement-card" onclick="showAnnouncement(\'' + a.id + '\')">'
        + (courseName ? '<span class="course-badge">' + escapeHtml(courseName) + '</span>' : '')
        + '<h4>' + escapeHtml(a.title) + '</h4>'
        + '<p>' + escapeHtml(body) + '</p>'
        + '</div>';
    }).join('');
  }

  function renderCourses(courses, stats) {
    var grid = id('ongoing-courses-grid');
    if (!grid) return;
    var activeCourses = (courses || []).filter(function (c) { return c.isPublished !== false; });
    if (!activeCourses.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;padding:2rem;text-align:center;color:var(--on-surface-variant);font-size:0.875rem">No ongoing courses. <a href="/courses" style="color:var(--primary)">Browse courses</a></div>';
      return;
    }
    grid.innerHTML = activeCourses.slice(0, 4).map(function (c) {
      var img = c.coverImage || c.thumbnailUrl || '';
      var progress = c.progressPercent || 0;
      return '<div class="ongoing-course-card">'
        + '<div class="course-thumb" style="background-image:url(' + (img || '/img/placeholder.svg') + ')">'
        + '<div class="course-progress-overlay"><div class="fill" style="width:' + progress + '%"></div></div>'
        + '</div>'
        + '<div class="course-body">'
        + '<h4>' + escapeHtml(c.title) + '</h4>'
        + '<p class="course-meta">' + progress + '% complete</p>'
        + '<div class="course-actions">'
        + '<button class="btn-sm" style="background:var(--primary);color:#fff" onclick="window.location.href=\'/lessons/' + c.id + '\'">Resume</button>'
        + '<button class="btn-sm" style="background:var(--surface-container-high);color:var(--on-surface)" onclick="window.location.href=\'/courses/' + c.id + '/materials\'">Materials</button>'
        + '<button class="btn-sm" style="background:var(--surface-container-high);color:var(--on-surface)" onclick="window.location.href=\'/courses/' + c.id + '\'">Details</button>'
        + '</div>'
        + '</div>'
        + '</div>';
    }).join('');
  }

  function renderMentors(mentors) {
    var list = id('mentors-list');
    if (!list) return;
    if (!mentors || !mentors.length) {
      list.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--on-surface-variant);font-size:0.8125rem">No mentors available.</div>';
      return;
    }
    list.innerHTML = mentors.slice(0, 3).map(function (m) {
      var avatar = m.avatarUrl || '';
      var name = m.fullName || 'Mentor';
      var headline = m.TutorProfile ? m.TutorProfile.headline || '' : '';
      return '<a href="/profile/' + m.id + '" class="mentor-card" style="text-decoration:none;color:inherit">'
        + '<div class="mentor-avatar" style="background-image:url(' + (avatar || '/img/placeholder.svg') + ')"></div>'
        + '<div class="mentor-info"><h5>' + escapeHtml(name) + '</h5>'
        + (headline ? '<p>' + escapeHtml(headline) + '</p>' : '')
        + '</div>'
        + '</a>';
    }).join('');
  }

  function renderMilestones(upcoming, completed) {
    var list = id('milestones-list');
    if (!list) return;
    var html = '';
    if (upcoming && upcoming.length) {
      html += '<p class="text-xs font-bold uppercase mb-2" style="color:var(--on-surface-variant);letter-spacing:0.05em">Upcoming</p>';
      html += upcoming.slice(0, 3).map(function (m) {
        var due = m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'No due date';
        return '<div class="milestone-item"><div class="milestone-icon upcoming"><span class="material-symbols-outlined">flag</span></div><div class="milestone-info"><h5>' + escapeHtml(m.title) + '</h5><p>Due ' + due + '</p></div></div>';
      }).join('');
    }
    if (completed && completed.length) {
      html += '<p class="text-xs font-bold uppercase mt-3 mb-2" style="color:var(--on-surface-variant);letter-spacing:0.05em">Completed</p>';
      html += completed.slice(0, 3).map(function (m) {
        var done = m.completedAt ? new Date(m.completedAt).toLocaleDateString() : '';
        return '<div class="milestone-item"><div class="milestone-icon completed"><span class="material-symbols-outlined">check</span></div><div class="milestone-info"><h5>' + escapeHtml(m.title) + '</h5><p>Completed ' + done + '</p></div></div>';
      }).join('');
    }
    if (!html) {
      html = '<div style="padding:1rem;text-align:center;color:var(--on-surface-variant);font-size:0.8125rem">No milestones yet.</div>';
    }
    list.innerHTML = html;
  }

  function renderWeeklyGoal(goal) {
    var bar = id('weekly-goal-bar');
    var text = id('weekly-goal-text');
    if (!bar || !text) return;
    if (!goal || !goal.weeklyGoalHours) {
      bar.style.width = '0%';
      text.textContent = 'Set a weekly goal to track your progress.';
      return;
    }
    var pct = goal.weeklyGoalPercent || 0;
    bar.style.width = pct + '%';
    text.textContent = goal.message || Math.round(goal.weeklyGoalProgressHours) + ' of ' + goal.weeklyGoalHours + ' hours completed';
  }

  /* ===== Notifications ===== */
  function loadNotifications() {
    api.get('/notifications').then(function (r) {
      var notifs = r.data || [];
      renderNotificationBadge(notifs);
      renderNotificationDropdown(notifs);
      renderRecentNotifications(notifs);
    }).catch(function () {});
  }

  function renderNotificationBadge(notifs) {
    var badge = id('notif-badge');
    if (!badge) return;
    var unread = notifs.filter(function (n) { return !n.isRead; }).length;
    if (unread > 0) { badge.textContent = unread > 99 ? '99+' : unread; badge.style.display = 'flex'; }
    else { badge.style.display = 'none'; }
  }

  function renderNotificationDropdown(notifs) {
    var list = id('notif-dropdown-list');
    if (!list) return;
    if (!notifs || !notifs.length) {
      list.innerHTML = '<div class="notif-dropdown-empty">No notifications</div>';
      return;
    }
    list.innerHTML = notifs.slice(0, 10).map(function (n) {
      return '<div class="notif-item' + (n.isRead ? '' : ' unread') + '" onclick="markNotifRead(\'' + n.id + '\')">'
        + '<div class="notif-icon"><span class="material-symbols-outlined">' + getNotifIcon(n.type) + '</span></div>'
        + '<div class="notif-content">'
        + '<div class="notif-title">' + escapeHtml(n.title) + '</div>'
        + '<div class="notif-message">' + escapeHtml(n.message) + '</div>'
        + '<div class="notif-time">' + timeAgo(n.createdAt) + '</div>'
        + '</div></div>';
    }).join('');
  }

  function renderRecentNotifications(notifs) {
    var list = id('recent-notif-list');
    if (!list) return;
    if (!notifs || !notifs.length) {
      list.innerHTML = '<div style="padding:0.75rem;text-align:center;color:var(--on-surface-variant);font-size:0.8125rem">No recent notifications</div>';
      return;
    }
    list.innerHTML = notifs.slice(0, 5).map(function (n) {
      return '<div class="notif-item' + (n.isRead ? '' : ' unread') + '" style="padding:0.5rem 0.5rem;border-left:none">'
        + '<div class="notif-icon" style="width:1.75rem;height:1.75rem;font-size:0.875rem"><span class="material-symbols-outlined">' + getNotifIcon(n.type) + '</span></div>'
        + '<div class="notif-content">'
        + '<div class="notif-title">' + escapeHtml(n.title) + '</div>'
        + '<div class="notif-time">' + timeAgo(n.createdAt) + '</div>'
        + '</div></div>';
    }).join('');
  }

  function getNotifIcon(type) {
    var icons = { reminder: 'alarm', announcement: 'campaign', event: 'event', feedback: 'rate_review', system: 'settings' };
    return icons[type] || 'notifications';
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    var now = Date.now();
    var then = new Date(dateStr).getTime();
    var diff = Math.max(0, Math.floor((now - then) / 1000));
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return new Date(dateStr).toLocaleDateString();
  }

  /* ===== Notification Dropdown Toggle ===== */
  function wireNotificationToggle() {
    var toggle = id('notif-toggle-btn');
    var dropdown = id('notif-dropdown');
    if (!toggle || !dropdown) return;
    toggle.onclick = function (e) {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    };
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  /* ===== Mark Notification Read ===== */
  window.markNotifRead = function (id) {
    api.put('/notifications/' + id + '/read').then(function () {
      loadNotifications();
    }).catch(function () {});
  };

  /* ===== Mark All Read ===== */
  function wireMarkAllRead() {
    var btn = id('mark-all-read-btn');
    if (!btn) return;
    btn.onclick = function () {
      api.post('/notifications/mark-all-read').then(function () {
        loadNotifications();
      }).catch(function () {});
    };
  }

  /* ===== Announcement Modal ===== */
  window.showAnnouncement = function (id) {
    if (!overviewData || !overviewData.announcements) return;
    var ann = overviewData.announcements.find(function (a) { return a.id === id; });
    if (!ann) return;
    var overlay = document.createElement('div');
    overlay.className = 'announcement-overlay';
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    var courseName = ann.Course ? ann.Course.title : '';
    overlay.innerHTML = '<div class="announcement-modal">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">'
      + '<div><h3>' + escapeHtml(ann.title) + '</h3>'
      + '<p class="ann-meta">' + (courseName ? 'Posted in ' + escapeHtml(courseName) + ' \u00B7 ' : '') + (ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : '') + '</p></div>'
      + '<button onclick="this.closest(\'.announcement-overlay\').remove()" style="background:none;border:none;cursor:pointer;color:var(--on-surface-variant);font-size:1.5rem">&times;</button>'
      + '</div>'
      + '<div class="ann-body">' + escapeHtml(ann.body || ann.content || '') + '</div>'
      + '</div>';
    document.body.appendChild(overlay);
  };

  /* ===== Helpers ===== */
  function id(el) { return document.getElementById(el); }
  function setText(el, val) { var e = id(el); if (e) e.textContent = val; }
  function showError(section, msg) {
    var el = id(section);
    if (el) el.innerHTML = '<div class="rounded-2xl border p-4 text-center" style="background:#fff;border-color:var(--outline-variant)"><p class="text-sm" style="color:var(--error)">' + msg + '</p></div>';
  }

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
  }

  /* ===== Init ===== */
  document.addEventListener('components-loaded', function () {
    updateUserInfo();
    loadOverview();
    loadNotifications();
    wireNotificationToggle();
    wireMarkAllRead();

    var logoutBtn = id('dash-logout-btn');
    if (logoutBtn && !logoutBtn._listener) {
      logoutBtn._listener = true;
      logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('token');
        window.location.href = '/';
      });
    }
  });
})();