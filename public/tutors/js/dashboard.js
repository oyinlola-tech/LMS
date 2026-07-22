(function () {
  var data = null;

  function loadOverview() {
    api.get('/tutor-dashboard/overview').then(function (r) {
      data = r.data || {};
      renderStats(data);
      renderEarningsChart(data.monthlyEarnings);
      renderCourseAnalytics(data.stats);
      renderSubmissions(data.pendingAttention, data);
      renderActiveCourses(data.activeCourses);
      renderActivityFeed(data.learnerActivity);
      renderPerformance(data);
      renderStudents(data.studentsOverview);
      renderEvents(data.upcomingEvents, data.officeHours);
      renderReviews(data.reviews);
      renderDiscussions(data.discussions);
    }).catch(function () {
      document.querySelectorAll('.skeleton').forEach(function (el) {
        el.textContent = 'Failed to load';
        el.style.background = 'none';
        el.style.color = 'var(--error)';
        el.style.fontSize = '0.8125rem';
      });
    });
  }

  function renderStats(d) {
    var rev = d.revenue || {};
    var currency = rev.currency || '$';
    var formatted = formatCurrency(rev.total, currency);
    setText('s-revenue', formatted);
    var delta = rev.monthlyDeltaPercent;
    var deltaEl = id('s-revenue-delta');
    if (delta != null && deltaEl) {
      deltaEl.textContent = (delta > 0 ? '+' : '') + delta + '%';
      deltaEl.className = 'stat-delta ' + (delta >= 0 ? 'up' : 'down');
    }

    setText('s-students', d.totalStudents || 0);
    setText('s-courses', (d.stats ? d.stats.publishedCourses : 0));
    var subEl = id('s-courses-sub');
    if (subEl) {
      var drafts = d.stats ? d.stats.draftCoursesCount : 0;
      subEl.textContent = drafts + ' draft' + (drafts !== 1 ? 's' : '');
    }
    setText('s-rating', (d.avgRating || 0) + ' \u2605');
    setText('s-pending', d.pendingAttention ? d.pendingAttention.length : 0);
  }

  function renderEarningsChart(monthly) {
    var chart = id('earnings-chart');
    if (!chart) return;
    if (!monthly || !monthly.length) {
      chart.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x1F4B0;</div>No earnings data yet</div>';
      return;
    }
    var maxAmount = Math.max.apply(null, monthly.map(function (m) { return m.amount; })) || 1;
    chart.innerHTML = monthly.map(function (m) {
      var pct = Math.max(3, (m.amount / maxAmount) * 100);
      return '<div class="earnings-bar-wrap">'
        + '<div class="earnings-bar" style="height:' + pct + '%">'
        + '<div class="earnings-bar-tooltip">' + formatCurrency(m.amount) + '</div>'
        + '</div>'
        + '<span class="earnings-bar-label">' + m.month + '</span>'
        + '</div>';
    }).join('');
  }

  function renderCourseAnalytics(stats) {
    var grid = id('course-analytics');
    if (!grid) return;
    if (!stats) {
      grid.innerHTML = '<div class="empty-state">No data</div>';
      return;
    }
    grid.innerHTML = '<div class="course-analytics-grid">'
      + '<div class="ca-item"><div class="ca-value">' + (stats.publishedCourses || 0) + '</div><div class="ca-label">Published</div></div>'
      + '<div class="ca-item"><div class="ca-value">' + (stats.draftCoursesCount || 0) + '</div><div class="ca-label">Drafts</div></div>'
      + '<div class="ca-item"><div class="ca-value">' + (stats.certificatesIssued || 0) + '</div><div class="ca-label">Certificates</div></div>'
      + '<div class="ca-item"><div class="ca-value">' + (stats.completionRate || 0) + '%</div><div class="ca-label">Completion</div><div class="ca-sub">' + stats.assignmentsTotal + ' assignments</div></div>'
      + '</div>';
  }

  function renderSubmissions(pending, d) {
    var section = id('submissions-section');
    if (!section) return;
    section.innerHTML = '';
    var queue = pending || [];
    if (!queue.length) {
      section.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x2705;</div>No pending submissions</div>';
      return;
    }
    queue.slice(0, 5).forEach(function (s) {
      var name = '';
      var detail = s.message || '';
      var parts = s.message ? s.message.replace('Action required: Assignment "', '').split('"') : [];
      var assignTitle = parts.length > 0 ? parts[0] : '';
      var studentName = detail.indexOf('from ') > -1 ? detail.split('from ').pop() : '';
      var initials = (studentName || '?').charAt(0).toUpperCase();
      var item = document.createElement('div');
      item.className = 'submission-item';
      item.innerHTML = '<div class="submission-avatar" style="display:flex;align-items:center;justify-content:center;background:var(--primary-fixed);color:var(--primary);font-weight:700;font-size:0.8125rem">' + initials + '</div>'
        + '<div class="submission-info"><div class="si-name">' + escapeHtml(studentName) + '</div><div class="si-detail">' + escapeHtml(assignTitle) + '</div></div>'
        + '<div class="submission-meta"><span class="si-status pending">Pending</span></div>';
      item.style.cursor = 'pointer';
      item.onclick = function () { window.location.href = '/tutor/assignments/' + (s.assignmentId || '') + '/submission'; };
      section.appendChild(item);
    });
  }

  function renderActiveCourses(courses) {
    var section = id('active-courses-section');
    if (!section) return;
    if (!courses || !courses.length) {
      section.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x1F4DA;</div>No active courses</div>';
      return;
    }
    section.innerHTML = '';
    courses.slice(0, 4).forEach(function (c) {
      var img = c.thumbnailUrl || '';
      var weekStr = c.weekInfo ? 'Week ' + c.weekInfo.week + '/' + c.weekInfo.totalWeeks : '';
      var item = document.createElement('div');
      item.className = 'course-item';
      item.innerHTML = '<div class="course-item-thumb" style="background-image:url(' + (img || '/img/placeholder.svg') + ')"></div>'
        + '<div class="course-item-info"><div class="ci-title">' + escapeHtml(c.title) + '</div><div class="ci-meta">' + c.learners + ' learner' + (c.learners !== 1 ? 's' : '') + (weekStr ? ' \u00B7 ' + weekStr : '') + '</div></div>'
        + '<div class="course-item-progress"><div class="ci-progress-bar"><div class="fill" style="width:' + c.completedPercent + '%"></div></div><div class="ci-progress-text">' + c.completedPercent + '%</div></div>';
      item.style.cursor = 'pointer';
      item.onclick = function () { window.location.href = '/courses/' + c.id; };
      section.appendChild(item);
    });
  }

  function renderActivityFeed(activity) {
    var feed = id('activity-feed');
    if (!feed) return;
    if (!activity || !activity.length) {
      feed.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x1F4CB;</div>No recent activity</div>';
      return;
    }
    feed.innerHTML = '';
    activity.slice(0, 6).forEach(function (a) {
      var item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = '<div class="activity-dot ' + (a.type || 'submission') + '"></div>'
        + '<div class="activity-content"><div class="ac-message">' + escapeHtml(a.message) + '</div><div class="ac-time">' + timeAgo(a.createdAt) + '</div></div>';
      feed.appendChild(item);
    });
  }

  function renderPerformance(d) {
    var grid = id('perf-grid');
    if (!grid) return;
    var stats = d.stats || {};
    grid.innerHTML = '<div class="perf-item"><div class="perf-value">' + (d.totalStudents || 0) + '</div><div class="perf-label">Students</div></div>'
      + '<div class="perf-item"><div class="perf-value">' + (d.avgRating || 0) + '</div><div class="perf-label">Rating</div></div>'
      + '<div class="perf-item"><div class="perf-value">' + (stats.assignmentsTotal || 0) + '</div><div class="perf-label">Assignments</div></div>'
      + '<div class="perf-item"><div class="perf-value">' + (stats.certificatesIssued || 0) + '</div><div class="perf-label">Certificates</div></div>';
  }

  function renderStudents(students) {
    var section = id('students-section');
    if (!section) return;
    if (!students || !students.length) {
      section.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x1F465;</div>No students yet</div>';
      return;
    }
    section.innerHTML = '';
    students.slice(0, 5).forEach(function (s) {
      var avatar = s.avatarUrl || '';
      var lastActive = s.lastActive ? timeAgo(s.lastActive) : 'Never';
      var item = document.createElement('div');
      item.className = 'student-item';
      item.innerHTML = '<div class="student-avatar" style="background-image:url(' + (avatar || '/img/placeholder.svg') + ')"></div>'
        + '<div class="student-info"><div class="st-name">' + escapeHtml(s.fullName) + '</div><div class="st-meta">' + s.completedCount + '/' + s.courseCount + ' courses \u00B7 Active ' + lastActive + '</div></div>';
      item.style.cursor = 'pointer';
      item.onclick = function () { window.location.href = '/profile/' + s.id; };
      section.appendChild(item);
    });
  }

  function renderEvents(events, officeHours) {
    var section = id('events-section');
    if (!section) return;
    var all = (events || []).concat((officeHours || []).map(function (o) {
      return {
        id: o.id,
        title: o.title,
        startsAt: o.startsAt,
        type: 'office_hour',
        meetingUrl: o.meetingUrl,
        course: o.course,
        durationMinutes: o.durationMinutes,
      };
    }));
    all.sort(function (a, b) { return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(); });
    if (!all.length) {
      section.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x1F4C5;</div>No upcoming events</div>';
      return;
    }
    section.innerHTML = '';
    all.slice(0, 4).forEach(function (e) {
      var d = new Date(e.startsAt);
      var dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      var timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      var courseStr = e.course ? e.course.title : '';
      var item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = '<div class="event-icon"><span class="material-symbols-outlined">' + (e.type === 'office_hour' ? 'group' : 'event') + '</span></div>'
        + '<div class="event-info"><div class="ev-title">' + escapeHtml(e.title) + '</div>'
        + '<div class="ev-meta">' + dateStr + ' \u00B7 ' + timeStr + '</div>'
        + (courseStr ? '<div class="ev-course">' + escapeHtml(courseStr) + '</div>' : '')
        + '</div>';
      section.appendChild(item);
    });
  }

  function renderReviews(reviews) {
    var section = id('reviews-section');
    if (!section) return;
    if (!reviews || !reviews.length) {
      section.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x2B50;</div>No reviews yet</div>';
      return;
    }
    section.innerHTML = '';
    reviews.slice(0, 4).forEach(function (r) {
      var stars = '';
      for (var i = 0; i < 5; i++) { stars += i < r.rating ? '\u2605' : '\u2606'; }
      var item = document.createElement('div');
      item.className = 'review-item';
      item.innerHTML = '<div class="review-header">'
        + '<span class="review-stars">' + stars + '</span>'
        + '<span class="review-user">' + escapeHtml(r.user?.fullName || '') + '</span>'
        + '<span class="review-course">' + escapeHtml(r.course?.title || '') + '</span>'
        + '</div>'
        + (r.comment ? '<div class="review-comment">' + escapeHtml(r.comment) + '</div>' : '')
        + '<div class="review-time">' + timeAgo(r.createdAt) + '</div>';
      section.appendChild(item);
    });
  }

  function renderDiscussions(discussions) {
    var section = id('discussions-section');
    if (!section) return;
    if (!discussions || !discussions.length) {
      section.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x1F4AC;</div>No discussions yet</div>';
      return;
    }
    section.innerHTML = '';
    discussions.slice(0, 4).forEach(function (d) {
      var avatar = d.user?.avatarUrl || '';
      var item = document.createElement('div');
      item.className = 'discussion-item';
      item.innerHTML = '<div class="discussion-avatar" style="background-image:url(' + (avatar || '/img/placeholder.svg') + ')"></div>'
        + '<div class="discussion-info"><div class="di-title">' + escapeHtml(d.title) + '</div>'
        + '<div class="di-body">' + escapeHtml(d.body) + '</div>'
        + '<div class="di-meta">' + escapeHtml(d.user?.fullName || '') + ' \u00B7 ' + d.replyCount + ' repl' + (d.replyCount === 1 ? 'y' : 'ies') + ' \u00B7 ' + escapeHtml(d.course?.title || '') + '</div>'
        + '</div>';
      item.style.cursor = 'pointer';
      item.onclick = function () { window.location.href = '/discussions'; };
      section.appendChild(item);
    });
  }

  /* ===== Helpers ===== */
  function id(el) { return document.getElementById(el); }
  function setText(el, val) { var e = id(el); if (e) e.textContent = val; }

  function formatCurrency(amount, currency) {
    if (amount == null) return '—';
    currency = currency || '$';
    if (amount >= 1000) return currency + (amount / 1000).toFixed(1) + 'k';
    return currency + (amount % 1 === 0 ? amount : amount.toFixed(2));
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

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
  }

  /* ===== Init ===== */
  document.addEventListener('components-loaded', function () {
    loadOverview();

    var logoutBtn = document.querySelector('#dash-logout-btn, .logout-btn');
    if (logoutBtn && !logoutBtn._listener) {
      logoutBtn._listener = true;
      logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('token');
        window.location.href = '/';
      });
    }
  });
})();
