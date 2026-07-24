function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; }
function renderStars(rating) { var s = ''; for (var i = 0; i < 5; i++) s += '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' ' + (i < Math.round(rating) ? '1' : '0') + ';font-size:1rem">star</span>'; return s; }
function formatDuration(m) { if (!m) return '0 min'; if (m < 60) return m + ' min'; var h = Math.floor(m / 60); var min = m % 60; return h + 'h ' + (min ? min + 'min' : ''); }
function getLessonIcon(t) { return { video: 'play_circle', pdf: 'description', quiz: 'quiz', note: 'sticky_note_2' }[t] || 'radio_button_unchecked'; }

var courseId = window.location.pathname.split('/').pop();
var courseData = null;
var isEnrolled = false;
var currentUserId = null;
var assignmentsCache = {};

try { var p = JSON.parse(atob((localStorage.getItem('token') || '').split('.')[1])); currentUserId = p.sub; } catch(e) {}

function id(e) { return document.getElementById(e); }

function showLoading() { id('loading-state').style.display = 'block'; id('error-state').style.display = 'none'; id('course-content').style.display = 'none'; }
function showError() { id('loading-state').style.display = 'none'; id('error-state').style.display = 'block'; id('course-content').style.display = 'none'; }
function showContent() { id('loading-state').style.display = 'none'; id('error-state').style.display = 'none'; id('course-content').style.display = 'block'; }

function loadCourseDetail() {
  showLoading();
  api.get('/courses/' + courseId).then(function(res) {
    if (!res || !res.data) { showError(); return; }
    courseData = res.data;
    renderCourse(res.data);
    renderCurriculum(res.data.sections, res.data.tutor, res.data.tutorProfile);
    renderInstructor(res.data.tutor, res.data.tutorProfile);
    renderPricing(res.data);
    renderPerks(res.data.perks);
    renderGrowth(res.data.specialization);
    isEnrolled = res.data.isEnrolled;
    if (isEnrolled) updateEnrollButton();
    showContent();
    loadReviews(courseId);
    loadSuggestedCourses();
    loadMentors();
  }).catch(function() { showError(); });

  PublicAPI.getCoursePreview(courseId).then(function(res) {
    if (res && res.data) {
      renderRating(res.data.rating, res.data.reviewCount);
      if (res.data.descriptionHtml && id('course-description')) id('course-description').innerHTML = res.data.descriptionHtml;
    }
  }).catch(function() {});
}

function renderCourse(c) {
  document.title = 'LearnBridge - ' + (c.title || '');
  var style = c.difficulty === 'expert' ? 'background:var(--secondary-fixed);color:var(--on-secondary-fixed)' : 'background:var(--primary-fixed);color:var(--on-primary-fixed)';
  var text = c.difficulty === 'beginner' ? 'Beginner' : c.difficulty === 'expert' ? 'Advanced' : 'Intermediate';
  id('course-badge').textContent = text; id('course-badge').setAttribute('style', style);
  id('course-category').textContent = c.categories && c.categories.length ? c.categories[0] : '';
  id('course-title').textContent = c.title || '';
  id('course-short-desc').textContent = (c.description || '').substring(0, 200) + ((c.description || '').length > 200 ? '...' : '');
  id('course-hours').textContent = c.totalHours ? c.totalHours + ' hours' : 'N/A';
  id('course-lessons').textContent = c.totalLessons ? c.totalLessons + ' lessons' : 'N/A';
  id('course-level').textContent = text + ' Level';
  var thumb = id('course-thumbnail');
  if (c.thumbnailUrl) { thumb.style.backgroundImage = 'url(' + c.thumbnailUrl + ')'; }
  else { thumb.style.background = 'var(--surface-variant)'; thumb.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><span class="material-symbols-outlined" style="font-size:4rem;color:var(--outline)">school</span></div>'; }
  if (c.description && !id('course-description').innerHTML) id('course-description').innerHTML = c.description.replace(/\n/g, '<br/>');
  var sc = (c.sections && c.sections.length) || 0;
  id('curriculum-summary').textContent = sc + ' modules \u00B7 ' + (c.totalLessons || 0) + ' lessons \u00B7 ' + (c.totalHours || 0) + ' hours';
}

function renderRating(rating, count) {
  if (rating > 0) { id('rating-display').style.display = 'flex'; id('course-rating').textContent = rating.toFixed(1); id('course-review-count').textContent = '(' + count + ')'; }
  else { id('rating-display').style.display = 'none'; }
}

function renderCurriculum(sections, tutor, tutorProfile) {
  var container = id('curriculum-list');
  if (!sections || !sections.length) { container.innerHTML = '<p style="color:var(--on-surface-variant)">No curriculum yet.</p>'; return; }
  var instructorAvatar = tutor ? (tutor.avatarUrl || '/img/placeholder.svg') : '/img/placeholder.svg';
  var instructorName = tutor ? escapeHtml(tutor.fullName) : 'Instructor';
  var instructorHeadline = tutorProfile ? escapeHtml(tutorProfile.headline || tutor.bio || '') : (tutor ? escapeHtml(tutor.bio || '') : '');
  var instructorId = tutor ? tutor.id : '';

  var html = '';
  sections.forEach(function(section, si) {
    var lessons = section.Lessons || [];
    var secDur = 0; lessons.forEach(function(l) { secDur += l.durationMinutes || 0; });
    var cover = section.coverImage;
    var hasCover = cover && cover.length > 10;

    html += '<div class="rounded-2xl border mb-4 overflow-hidden" style="background:#fff;border-color:var(--outline-variant)">';

    if (hasCover) {
      html += '<div class="relative h-44" style="background-image:url(' + cover + ');background-size:cover;background-position:center">'
        + '<div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.7), transparent)"></div>'
        + '<div style="position:absolute;bottom:1rem;left:1.5rem;color:#fff">'
        + '<p class="text-xs font-bold uppercase opacity-80">Module ' + (si + 1) + '</p>'
        + '<h3 class="text-xl font-black">' + escapeHtml(section.title || 'Module ' + (si + 1)) + '</h3>'
        + '</div></div>';
    }

    html += '<div class="flex items-center justify-between p-4 cursor-pointer section-header" data-section="' + si + '" style="font-weight:700;font-size:1rem' + (hasCover ? '' : '') + '">'
      + '<div class="flex items-center gap-2">'
      + '<span class="material-symbols-outlined section-arrow" style="transition:transform 0.2s;font-size:1.2rem">chevron_right</span>'
      + '<span>' + escapeHtml(section.title || 'Module ' + (si + 1)) + '</span>'
      + '</div>'
      + '<span class="text-xs" style="color:var(--on-surface-variant);font-weight:400">' + lessons.length + ' lessons \u00B7 ' + formatDuration(secDur) + '</span>'
      + '</div>';

    html += '<div class="section-body" style="display:none;border-top:1px solid var(--outline-variant)">';

    if (section.coreObjective || section.moduleBrief) {
      html += '<div class="p-4" style="background:var(--surface);border-bottom:1px solid var(--outline-variant)">';
      if (section.coreObjective) html += '<p class="text-xs font-bold mb-1" style="color:var(--on-surface-variant)">CORE OBJECTIVE</p><p class="text-sm mb-3">' + escapeHtml(section.coreObjective) + '</p>';
      if (section.moduleBrief) html += '<p class="text-xs font-bold mb-1" style="color:var(--on-surface-variant)">MODULE BRIEF</p><p class="text-sm">' + escapeHtml(section.moduleBrief) + '</p>';
      html += '</div>';
    }

    html += '<div class="px-4 py-2">';
    lessons.forEach(function(lesson) {
      html += '<div class="curriculum-lesson' + (lesson.isPreview ? ' preview-lesson' : '') + '">'
        + '<div class="flex items-center gap-3">'
        + '<span class="material-symbols-outlined" style="font-size:1.1rem;color:var(--on-surface-variant)">' + getLessonIcon(lesson.type) + '</span>'
        + '<span class="text-sm font-medium">' + escapeHtml(lesson.title) + '</span>'
        + (lesson.isPreview ? '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded" style="background:var(--primary);color:#fff">PREVIEW</span>' : '')
        + '</div>'
        + '<span class="text-xs" style="color:var(--on-surface-variant)">' + formatDuration(lesson.durationMinutes) + '</span>'
        + '</div>';
    });
    html += '</div>';

    if (section.keyDeliverables && section.keyDeliverables.length) {
      html += '<div class="p-4 border-t" style="border-color:var(--outline-variant)">'
        + '<p class="text-xs font-bold mb-2" style="color:var(--on-surface-variant)">KEY DELIVERABLES</p><div class="flex flex-wrap gap-1.5">';
      section.keyDeliverables.forEach(function(d) { html += '<span class="text-xs px-2 py-0.5 rounded" style="background:var(--surface-variant)">' + escapeHtml(d) + '</span>'; });
      html += '</div></div>';
    }

    html += '<div class="p-4 border-t flex items-center gap-3" style="border-color:var(--outline-variant)">'
      + '<div class="size-8 rounded-full flex-shrink-0" style="background-image:url(' + instructorAvatar + ');background-size:cover;background-position:center"></div>'
      + '<div><p class="text-xs font-bold">' + instructorName + '</p><p class="text-[10px]" style="color:var(--on-surface-variant)">' + instructorHeadline + '</p></div>'
      + (instructorId ? '<a href="/profile/' + instructorId + '" class="text-xs font-bold ml-auto" style="color:var(--primary)">View</a>' : '')
      + '</div>';

    html += '<div class="module-assignments" data-module-id="' + section.id + '" data-module-idx="' + si + '">'
      + '<div class="p-4 text-center" style="color:var(--on-surface-variant)"><span class="material-symbols-outlined" style="font-size:1.1rem;vertical-align:middle">hourglass</span> <span class="text-xs">Loading assignments...</span></div>'
      + '</div>';

    html += '</div></div>';
  });

  container.innerHTML = html;

  container.querySelectorAll('.section-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var body = header.nextElementSibling;
      var arrow = header.querySelector('.section-arrow');
      var isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
      if (!isOpen) {
        var moduleId = body.querySelector('.module-assignments');
        if (moduleId && !moduleId._loaded) loadModuleAssignments(moduleId);
      }
    });
  });
}

function loadModuleAssignments(container) {
  container._loaded = true;
  var moduleId = container.getAttribute('data-module-id');
  if (!localStorage.getItem('token')) {
    container.innerHTML = '<div class="p-4 border-t" style="border-color:var(--outline-variant)"><a href="#" class="text-xs font-bold" style="color:var(--primary)" data-auth="login">Login to view assignments</a></div>';
    wireAuthRequiredActions();
    return;
  }
  api.get('/assignments/module/' + moduleId).then(function(res) {
    if (!res || !res.data || !res.data.length) {
      container.innerHTML = '<div class="p-4 border-t text-center" style="border-color:var(--outline-variant);color:var(--on-surface-variant)"><p class="text-xs">No assignments for this module.</p></div>';
      return;
    }
    var html = '<div class="border-t" style="border-color:var(--outline-variant)"><div class="p-3" style="background:var(--surface)"><p class="text-xs font-bold">ASSIGNMENTS</p></div>';
    res.data.forEach(function(a) {
      var status = a.submissionStatus || 'not_submitted';
      var statusColor = status === 'graded' ? '#16a34a' : status === 'submitted' ? 'var(--primary)' : 'var(--on-surface-variant)';
      var statusIcon = status === 'graded' ? 'check_circle' : status === 'submitted' ? 'hourglass_top' : 'radio_button_unchecked';
      var dueStr = a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '';
      var points = a.totalPoints ? a.totalPoints + ' pts' : '';
      var reqTypes = a.requirement && a.requirement.fileTypes ? a.requirement.fileTypes.join(', ') : '';

      html += '<div class="p-4 border-t" style="border-color:var(--outline-variant)">'
        + '<div class="flex items-start justify-between mb-2">'
        + '<div><p class="font-bold text-sm">' + escapeHtml(a.title) + '</p>'
        + (a.coreObjective ? '<p class="text-xs" style="color:var(--on-surface-variant)">' + escapeHtml(a.coreObjective) + '</p>' : '')
        + '</div>'
        + '<div class="flex items-center gap-1 text-xs" style="color:' + statusColor + '">'
        + '<span class="material-symbols-outlined" style="font-size:1rem">' + statusIcon + '</span>'
        + '<span class="font-bold capitalize">' + status.replace('_', ' ') + '</span>'
        + '</div></div>';

      if (dueStr || points || reqTypes) {
        html += '<div class="flex flex-wrap gap-3 text-xs mb-3" style="color:var(--on-surface-variant)">';
        if (dueStr) html += '<span><span class="material-symbols-outlined" style="font-size:0.8rem;vertical-align:middle">calendar_today</span> Due: ' + dueStr + '</span>';
        if (points) html += '<span>' + points + '</span>';
        if (reqTypes) html += '<span>Files: ' + escapeHtml(reqTypes) + '</span>';
        html += '</div>';
      }

      html += '<div class="flex items-center gap-2">';
      if (status === 'not_submitted') {
        html += '<button class="text-xs font-bold py-1.5 px-3 rounded-lg start-assignment-btn" data-id="' + a.id + '" style="background:var(--primary);color:#fff">Start Assignment</button>';
        html += '<button class="text-xs font-bold py-1.5 px-3 rounded-lg submit-assignment-btn" data-id="' + a.id + '" style="background:var(--surface-variant);color:var(--on-surface)">Submit</button>';
      } else {
        html += '<span class="text-xs font-bold" style="color:' + statusColor + '">' + (status === 'graded' ? 'Graded' : 'Submitted') + '</span>';
      }
      if (a.downloadAssetsUrl) {
        html += '<a href="' + a.downloadAssetsUrl + '" target="_blank" class="text-xs font-bold py-1.5 px-3 rounded-lg" style="background:var(--surface-variant);color:var(--on-surface)">Download Assets</a>';
      }
      html += '</div></div>';
    });
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.start-assignment-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var aId = this.getAttribute('data-id');
        api.post('/assignments/' + aId + '/start').then(function() {
          loadModuleAssignments(container);
        }).catch(function(err) { alert((err && err.error && err.error.message) || 'Failed to start'); });
      });
    });

    container.querySelectorAll('.submit-assignment-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var aId = this.getAttribute('data-id');
        var fileUrl = prompt('Enter file URL (or paste a link to your work):');
        if (!fileUrl) return;
        api.post('/assignments/' + aId + '/submit', { fileUrl: fileUrl, fileType: 'link' }).then(function() {
          loadModuleAssignments(container);
        }).catch(function(err) { alert((err && err.error && err.error.message) || 'Failed to submit'); });
      });
    });
  }).catch(function() {
    container.innerHTML = '<div class="p-4 border-t text-center" style="border-color:var(--outline-variant);color:var(--on-surface-variant)"><p class="text-xs">Failed to load assignments.</p></div>';
  });
}

function loadMentors() {
  var container = id('mentors-list');
  if (!container) return;
  api.get('/mentorship/course/' + courseId).then(function(res) {
    if (!res || !res.data || !res.data.length) {
      container.innerHTML = '<p class="text-xs" style="color:var(--on-surface-variant)">No mentors yet.</p>';
      return;
    }
    var html = '';
    res.data.forEach(function(m) {
      var u = m.User || {};
      html += '<div class="flex items-center gap-3 py-2">'
        + '<div class="size-9 rounded-full" style="background-image:url(' + (u.avatarUrl || '/img/placeholder.svg') + ');background-size:cover;background-position:center"></div>'
        + '<div class="grow"><p class="text-sm font-bold">' + escapeHtml(u.fullName || '') + '</p></div>'
        + '<a href="/profile/' + u.id + '" class="text-xs font-bold" style="color:var(--primary)">View</a>'
        + (localStorage.getItem('token') && currentUserId !== u.id ? '<button class="text-xs font-bold mentor-msg-btn" data-id="' + u.id + '" data-name="' + escapeHtml(u.fullName || '') + '" style="color:var(--primary)">Message</button>' : '')
        + '</div>';
    });
    container.innerHTML = html;
    container.querySelectorAll('.mentor-msg-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var name = this.getAttribute('data-name');
        var msg = prompt('Message to ' + name + ':');
        if (!msg) return;
        api.post('/messages/threads', { participantId: this.getAttribute('data-id'), subject: '', message: msg })
          .then(function() { window.location.href = '/messages'; })
          .catch(function(err) { alert('Failed to send'); });
      });
    });
  }).catch(function() {});
}

function renderPricing(c) {
  var priceEl = id('current-price'), oldPriceEl = id('old-price'), discountEl = id('discount-badge');
  if (c.price != null && c.price > 0) {
    priceEl.textContent = Shared.formatCurrency(c.price, c.currency);
    if (c.previousPrice && c.previousPrice > c.price) {
      oldPriceEl.textContent = Shared.formatCurrency(c.previousPrice, c.currency);
      oldPriceEl.style.display = 'inline';
      discountEl.textContent = c.discountPercent + '% OFF'; discountEl.style.display = 'inline';
    } else { oldPriceEl.style.display = 'none'; discountEl.style.display = 'none'; }
  } else { priceEl.textContent = 'Free'; oldPriceEl.style.display = 'none'; discountEl.style.display = 'none'; }
}

function renderPerks(perks) {
  var container = id('perks-list');
  if (!perks || !perks.length) { container.innerHTML = '<p class="text-xs" style="color:var(--on-surface-variant)">No additional features listed.</p>'; return; }
  container.innerHTML = perks.map(function(p) { return '<div class="perk-item"><span class="material-symbols-outlined">check_circle</span><span class="text-sm">' + escapeHtml(p) + '</span></div>'; }).join('');
}

function renderGrowth(specialization) {
  var section = id('growth-section'), container = id('growth-content');
  if (!specialization) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  var html = '<div class="rounded-2xl border p-6" style="background:#fff;border-color:var(--outline-variant)"><div class="flex items-center gap-3 mb-4">'
    + '<span class="material-symbols-outlined" style="font-size:2rem;color:var(--primary)">trending_up</span>'
    + '<div><h3 class="font-bold">' + escapeHtml(specialization.title || 'Career Path') + '</h3><p class="text-sm" style="color:var(--on-surface-variant)">' + escapeHtml(specialization.description || '') + '</p></div></div>';
  if (specialization.steps && specialization.steps.length) {
    html += '<div style="border-top:1px solid var(--outline-variant);padding-top:1rem">';
    specialization.steps.forEach(function(step, i) {
      html += '<div class="flex items-center gap-3 py-2"><div class="size-8 rounded-full flex items-center justify-center text-sm font-bold" style="background:var(--primary-fixed);color:var(--on-primary-fixed)">' + (i + 1) + '</div><span class="text-sm">' + escapeHtml(step) + '</span></div>';
    });
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function renderInstructor(tutor, tutorProfile) {
  var container = id('instructor-card');
  if (!tutor) { container.innerHTML = '<p style="color:var(--on-surface-variant)">Instructor info not available.</p>'; return; }
  var avatar = tutor.avatarUrl || '/img/placeholder.svg';
  var headline = tutorProfile ? tutorProfile.headline || tutor.bio || '' : tutor.bio || '';
  var token = localStorage.getItem('token');
  var profileUrl = '/profile/' + tutor.id;
  container.innerHTML = '<div class="instructor-avatar" style="background-image:url(' + avatar + ')"></div>'
    + '<div class="grow"><div class="flex items-center gap-2 mb-1"><h3 class="text-xl font-bold">' + escapeHtml(tutor.fullName) + '</h3></div>'
    + '<p class="text-sm mb-1" style="color:var(--primary);font-weight:600">' + escapeHtml(headline || 'Instructor') + '</p>'
    + '<p class="text-sm mb-3" style="color:var(--on-surface-variant)">' + escapeHtml(tutor.bio || '') + '</p>'
    + '<div class="flex items-center gap-3"><a href="' + profileUrl + '" class="text-sm font-bold" style="color:var(--primary)">View Profile</a>'
    + '<button id="follow-btn" class="text-sm font-bold py-1.5 px-4 rounded-lg transition-all" style="background:var(--surface-variant);color:var(--on-surface)">' + (token ? 'Loading...' : 'Follow') + '</button></div></div>';
  if (token) loadFollowStatus(tutor.id);
  else { var btn = id('follow-btn'); btn.textContent = 'Follow'; btn.setAttribute('data-auth', 'login'); wireAuthRequiredActions(); }
}

function loadFollowStatus(tutorId) {
  api.get('/api/follow/' + tutorId + '/status').then(function(res) {
    var btn = id('follow-btn'); if (!btn) return;
    if (res && res.data) {
      btn.textContent = res.data.isFollowing ? 'Following' : 'Follow';
      btn.style.background = res.data.isFollowing ? 'var(--primary)' : 'var(--surface-variant)';
      btn.style.color = res.data.isFollowing ? '#fff' : 'var(--on-surface)';
      btn._isFollowing = res.data.isFollowing;
      btn.onclick = function() { toggleFollow(tutorId, btn); };
    }
  }).catch(function() { var btn = id('follow-btn'); if (btn) { btn.textContent = 'Follow'; btn.onclick = function() { toggleFollow(tutorId, btn); }; } });
}

function toggleFollow(tutorId, btn) {
  if (!localStorage.getItem('token')) { if (typeof openAuthModal === 'function') openAuthModal('login'); return; }
  var was = btn._isFollowing;
  api.request(was ? '/api/follow/' + tutorId + '/unfollow' : '/api/follow/' + tutorId + '/follow', { method: was ? 'DELETE' : 'POST' })
    .then(function() {
      btn._isFollowing = !was; btn.textContent = btn._isFollowing ? 'Following' : 'Follow';
      btn.style.background = btn._isFollowing ? 'var(--primary)' : 'var(--surface-variant)';
      btn.style.color = btn._isFollowing ? '#fff' : 'var(--on-surface)';
    }).catch(function(err) {
      if (err && err.error && err.error.code === 'ALREADY_FOLLOWING') { btn._isFollowing = true; btn.textContent = 'Following'; btn.style.background = 'var(--primary)'; btn.style.color = '#fff'; }
    });
}

function loadReviews(courseId) {
  api.get('/courses/' + courseId + '/reviews').then(function(res) {
    if (res && res.data && res.data.reviews && res.data.reviews.length) {
      var html = '<div class="mt-12"><h2 class="text-2xl font-black mb-4">Student Reviews</h2><div class="flex flex-wrap gap-4">';
      res.data.reviews.slice(0, 3).forEach(function(r) {
        var u = r.User || {};
        html += '<div class="rounded-2xl border p-5" style="background:#fff;border-color:var(--outline-variant);flex:1;min-width:280px">'
          + '<div class="flex items-center gap-3 mb-3"><div class="size-10 rounded-full" style="background-image:url(' + (u.avatarUrl || '/img/placeholder.svg') + ');background-size:cover;background-position:center"></div>'
          + '<div><p class="font-bold text-sm">' + escapeHtml(u.fullName || 'Student') + '</p><div style="color:var(--tertiary)">' + renderStars(r.rating || 0) + '</div></div></div>'
          + '<p class="text-sm" style="color:var(--on-surface-variant)">' + escapeHtml(r.comment || '') + '</p></div>';
      });
      html += '</div></div>';
      var cs = id('curriculum-section');
      if (cs) cs.insertAdjacentHTML('afterend', html);
    }
  }).catch(function() {});
}

function loadSuggestedCourses() {
  var grid = id('suggested-grid');
  var token = localStorage.getItem('token');
  var fetchFn = token ? api.get('/courses/recommended') : PublicAPI.getFeaturedCourses();
  fetchFn.then(function(res) {
    var courses = res && res.data ? (Array.isArray(res.data) ? res.data : res.data.courses || res.data) : [];
    courses = courses.filter(function(c) { return c.id !== courseId; }).slice(0, 4);
    if (courses.length) {
      grid.innerHTML = courses.map(function(c) {
        return '<a href="/course/' + c.id + '" class="block rounded-2xl overflow-hidden border transition-all hover:shadow-lg" style="background:#fff;border-color:var(--outline-variant);text-decoration:none;color:inherit">'
          + '<div class="h-36" style="background-image:url(' + (c.thumbnailUrl || '/img/placeholder.svg') + ');background-size:cover;background-position:center"></div>'
          + '<div class="p-4"><h3 class="font-bold text-sm mb-1">' + escapeHtml(c.title || '') + '</h3>'
          + '<p class="text-xs" style="color:var(--on-surface-variant)">' + (c.tutor ? escapeHtml(c.tutor.fullName || '') : '') + '</p></div></a>';
      }).join('');
    } else { grid.innerHTML = '<div class="col-span-full text-center py-8"><p style="color:var(--on-surface-variant)">No suggestions available.</p></div>'; }
  }).catch(function() { grid.innerHTML = '<div class="col-span-full text-center py-8"><p style="color:var(--on-surface-variant)">Failed to load suggestions.</p></div>'; });
}

function updateEnrollButton() {
  var btn = id('enroll-btn');
  if (btn) { btn.textContent = 'Go to Course'; btn.onclick = function() { window.location.href = '/dashboard'; }; }
}

function wireAuthRequiredActions() {
  document.querySelectorAll('[data-auth]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      if (!localStorage.getItem('token')) { e.preventDefault(); if (typeof openAuthModal === 'function') openAuthModal(el.getAttribute('data-auth') || 'login'); else window.location.href = '/login'; }
    });
  });
}

function updateAuthUI() {
  var token = localStorage.getItem('token');
  var loginBtn = id('header-login'), joinBtn = id('header-join'), profileBtn = id('header-profile'), logoutBtn = id('header-logout');
  if (token && profileBtn && logoutBtn) {
    if (loginBtn) loginBtn.style.display = 'none'; if (joinBtn) joinBtn.style.display = 'none';
    profileBtn.style.display = 'flex'; logoutBtn.style.display = 'flex';
    if (logoutBtn && !logoutBtn._listener) {
      logoutBtn._listener = true;
      logoutBtn.addEventListener('click', async function() { try { await AuthAPI.logout(); } catch(_) {} localStorage.removeItem('token'); window.location.href = '/'; });
    }
  } else if (!token && loginBtn && joinBtn) {
    loginBtn.style.display = ''; joinBtn.style.display = '';
    if (profileBtn) profileBtn.style.display = 'none'; if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

var commentsPage = 1;
var replyingTo = null;

function loadComments(page) {
  page = page || 1;
  if (!localStorage.getItem('token')) {
    id('comments-area').innerHTML = '<div class="rounded-2xl border p-6 text-center" style="background:#fff;border-color:var(--outline-variant)"><p class="text-sm" style="color:var(--on-surface-variant)"><a href="#" data-auth="login" style="color:var(--primary);font-weight:600">Login</a> to view and post comments.</p></div>';
    wireAuthRequiredActions();
    return;
  }
  api.get('/courses/' + courseId + '/comments?page=' + page + '&limit=10').then(function(res) {
    if (!res || !res.data) { id('comments-area').innerHTML = ''; return; }
    var data = res.data;
    commentsPage = data.page || 1;
    var html = '<div class="mb-4"><textarea id="comment-input" rows="2" class="chat-input" placeholder="Write a comment..." style="width:100%;resize:none;padding:0.75rem;border-radius:0.75rem"></textarea>'
      + '<div id="reply-indicator" style="display:none" class="flex items-center gap-2 mt-2 text-xs" style="color:var(--on-surface-variant)">'
      + '<span>Replying to <strong id="reply-to-name"></strong></span>'
      + '<button id="cancel-reply-btn" class="text-xs font-bold" style="color:var(--error)">Cancel</button></div>'
      + '<button id="post-comment-btn" class="btn-primary text-sm mt-2">Post Comment</button></div>';

    if (data.items && data.items.length) {
      html += '<div class="space-y-4">';
      data.items.forEach(function(c) {
        html += renderComment(c);
      });
      html += '</div>';
      if (data.totalPages > data.page) {
        html += '<div class="text-center mt-4"><button id="load-more-comments" class="text-sm font-bold py-2 px-4 rounded-lg" style="background:var(--surface-variant);color:var(--on-surface)">Load More Comments</button></div>';
      }
    } else {
      html += '<div class="text-center py-8 rounded-2xl border" style="background:#fff;border-color:var(--outline-variant)"><p class="text-sm" style="color:var(--on-surface-variant)">No comments yet. Be the first!</p></div>';
    }
    id('comments-area').innerHTML = html;
    wireCommentEvents();
  }).catch(function() { id('comments-area').innerHTML = '<p class="text-sm" style="color:var(--error)">Failed to load comments.</p>'; });
}

function renderComment(c) {
  var u = c.User || {};
  var date = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '';
  var replyCount = c.replyCount || 0;
  return '<div class="rounded-2xl border p-4" style="background:#fff;border-color:var(--outline-variant)">'
    + '<div class="flex items-center gap-3 mb-2">'
    + '<div class="size-8 rounded-full" style="background-image:url(' + (u.avatarUrl || '/img/placeholder.svg') + ');background-size:cover;background-position:center"></div>'
    + '<div><p class="text-sm font-bold">' + escapeHtml(u.fullName || 'User') + '</p><p class="text-[10px]" style="color:var(--outline)">' + date + '</p></div>'
    + '</div>'
    + '<p class="text-sm mb-2">' + escapeHtml(c.content) + '</p>'
    + '<div class="flex items-center gap-3">'
    + '<button class="text-xs font-bold reply-btn" data-id="' + c.id + '" data-name="' + escapeHtml(u.fullName || 'User') + '" style="color:var(--primary)">Reply</button>'
    + (replyCount > 0 ? '<button class="text-xs font-bold show-replies-btn" data-id="' + c.id + '" style="color:var(--on-surface-variant)">Show Replies (' + replyCount + ')</button>' : '')
    + '</div>'
    + '<div class="replies-container" data-parent-id="' + c.id + '" style="display:none;margin-top:0.75rem;padding-left:1rem;border-left:2px solid var(--outline-variant)"></div>'
    + '</div>';
}

function renderReply(r) {
  var u = r.User || {};
  var date = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '';
  return '<div class="flex items-start gap-2 py-2">'
    + '<div class="size-6 rounded-full flex-shrink-0" style="background-image:url(' + (u.avatarUrl || '/img/placeholder.svg') + ');background-size:cover;background-position:center"></div>'
    + '<div class="grow"><div class="flex items-center gap-2"><span class="text-xs font-bold">' + escapeHtml(u.fullName || 'User') + '</span><span class="text-[10px]" style="color:var(--outline)">' + date + '</span></div>'
    + '<p class="text-sm">' + escapeHtml(r.content) + '</p></div></div>';
}

function wireCommentEvents() {
  var postBtn = id('post-comment-btn');
  if (postBtn) {
    postBtn.onclick = function() {
      var input = id('comment-input');
      var text = input.value.trim();
      if (!text) return;
      var body = { content: text };
      if (replyingTo) body.parentId = replyingTo.id;
      api.post('/courses/' + courseId + '/comments', body).then(function() {
        input.value = '';
        replyingTo = null;
        id('reply-indicator').style.display = 'none';
        loadComments(1);
      }).catch(function(err) { alert((err && err.error && err.error.message) || 'Failed to post'); });
    };
  }

  id('cancel-reply-btn').onclick = function() { replyingTo = null; id('reply-indicator').style.display = 'none'; };

  document.querySelectorAll('.reply-btn').forEach(function(btn) {
    btn.onclick = function() {
      replyingTo = { id: this.getAttribute('data-id'), name: this.getAttribute('data-name') };
      id('reply-to-name').textContent = replyingTo.name;
      id('reply-indicator').style.display = 'flex';
      id('comment-input').focus();
    };
  });

  document.querySelectorAll('.show-replies-btn').forEach(function(btn) {
    btn.onclick = function() {
      var parentId = this.getAttribute('data-id');
      var container = document.querySelector('.replies-container[data-parent-id="' + parentId + '"]');
      if (!container) return;
      if (container.style.display !== 'none') { container.style.display = 'none'; this.textContent = this.textContent.replace('Hide', 'Show'); return; }
      if (container._loaded) { container.style.display = 'block'; this.textContent = 'Hide Replies'; return; }
      api.get('/courses/' + courseId + '/comments/' + parentId + '/replies').then(function(res) {
        if (res && res.data && res.data.items) {
          container.innerHTML = res.data.items.map(renderReply).join('');
          container.style.display = 'block';
          container._loaded = true;
          btn.textContent = 'Hide Replies';
        }
      }).catch(function() {});
    };
  });

  var loadMore = id('load-more-comments');
  if (loadMore) {
    loadMore.onclick = function() {
      loadComments(commentsPage + 1);
    };
  }
}

document.addEventListener('DOMContentLoaded', function() {
  if (!courseId || courseId === 'course-details.html' || courseId === '') { showError(); return; }
  loadCourseDetail(); updateAuthUI();
});

document.addEventListener('components-loaded', function() {
  updateAuthUI(); wireAuthRequiredActions();
  var enrollBtn = id('enroll-btn');
  if (enrollBtn) {
    enrollBtn.addEventListener('click', function() {
      if (isEnrolled) { window.location.href = '/dashboard'; return; }
      if (!localStorage.getItem('token')) { if (typeof openAuthModal === 'function') openAuthModal('login'); return; }
      var btn = this; btn.textContent = 'Enrolling...'; btn.disabled = true;
      api.post('/courses/' + courseId + '/enroll').then(function() { isEnrolled = true; updateEnrollButton(); })
        .catch(function(err) { alert((err && err.error && err.error.message) || 'Failed to enroll'); btn.textContent = 'Enroll Now'; btn.disabled = false; });
    });
  }
  var previewBtn = id('preview-btn');
  if (previewBtn) {
    previewBtn.addEventListener('click', function() {
      if (!courseData || !courseData.sections) return;
      var pl = null; courseData.sections.some(function(s) { if (!s.Lessons) return false; return s.Lessons.some(function(l) { if (l.isPreview) { pl = l; return true; } return false; }); });
      if (pl) window.location.href = '/lessons/' + pl.id;
      else if (courseData.sections.length && courseData.sections[0].Lessons && courseData.sections[0].Lessons.length) window.location.href = '/lessons/' + courseData.sections[0].Lessons[0].id;
      else alert('No preview available.');
    });
  }

  var token = localStorage.getItem('token');
  var applyBtn = id('apply-mentor-btn');
  if (applyBtn && token) {
    api.get('/mentorship/my-application/' + courseId).then(function(res) {
      if (res && res.data) {
        applyBtn.textContent = res.data.status === 'approved' ? 'You are a Mentor' : res.data.status === 'pending' ? 'Application Pending' : 'Apply to be a Mentor';
        if (res.data.status === 'approved' || res.data.status === 'pending') applyBtn.disabled = true;
        else applyBtn.style.display = 'inline-flex';
      } else {
        applyBtn.style.display = 'inline-flex';
      }
    }).catch(function() { applyBtn.style.display = 'inline-flex'; });

    applyBtn.addEventListener('click', function() {
      var msg = prompt('Why do you want to be a mentor for this course? (optional)');
      api.post('/mentorship/apply', { courseId: courseId, message: msg || '' }).then(function() {
        applyBtn.textContent = 'Application Pending';
        applyBtn.disabled = true;
      }).catch(function(err) { alert((err && err.error && err.error.message) || 'Failed to apply'); });
    });
  }

  loadComments();
});
