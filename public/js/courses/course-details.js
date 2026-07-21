function escapeHtml(text) {
  var d = document.createElement('div');
  d.textContent = text || '';
  return d.innerHTML;
}

function renderStars(rating) {
  var s = '';
  for (var i = 0; i < 5; i++) {
    s += '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' ' + (i < Math.round(rating) ? '1' : '0') + '; font-size: 1rem">star</span>';
  }
  return s;
}

function formatDuration(minutes) {
  if (!minutes) return '0 min';
  if (minutes < 60) return minutes + ' min';
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  return h + 'h ' + (m ? m + 'min' : '');
}

function getLessonIcon(type) {
  switch (type) {
    case 'video': return 'play_circle';
    case 'pdf': return 'description';
    case 'quiz': return 'quiz';
    case 'note': return 'sticky_note_2';
    default: return 'radio_button_unchecked';
  }
}

var courseId = window.location.pathname.split('/').pop();
var courseData = null;
var isEnrolled = false;

function showLoading() {
  document.getElementById('loading-state').style.display = 'block';
  document.getElementById('error-state').style.display = 'none';
  document.getElementById('course-content').style.display = 'none';
}

function showError() {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display = 'block';
  document.getElementById('course-content').style.display = 'none';
}

function showContent() {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display = 'none';
  document.getElementById('course-content').style.display = 'block';
}

function loadCourseDetail() {
  showLoading();

  api.get('/courses/' + courseId)
    .then(function (res) {
      if (!res || !res.data) { showError(); return; }
      courseData = res.data;
      renderCourse(res.data);
      renderCurriculum(res.data.sections);
      renderInstructor(res.data.tutor, res.data.tutorProfile);
      renderPricing(res.data);
      renderPerks(res.data.perks);
      renderGrowth(res.data.specialization);
      isEnrolled = res.data.isEnrolled;
      if (isEnrolled) updateEnrollButton();
      showContent();
      loadReviews(courseId);
      loadSuggestedCourses();
    })
    .catch(function () {
      showError();
    });

  PublicAPI.getCoursePreview(courseId).then(function (res) {
    if (res && res.data) {
      renderRating(res.data.rating, res.data.reviewCount);
      if (res.data.descriptionHtml && document.getElementById('course-description')) {
        document.getElementById('course-description').innerHTML = res.data.descriptionHtml;
      }
    }
  }).catch(function () {});
}

function renderCourse(c) {
  document.title = 'LearnBridge - ' + (c.title || 'Course Details');

  var badgeStyle = c.difficulty === 'expert'
    ? 'background: var(--secondary-fixed); color: var(--on-secondary-fixed)'
    : 'background: var(--primary-fixed); color: var(--on-primary-fixed)';
  var badgeText = c.difficulty === 'beginner' ? 'Beginner' : c.difficulty === 'expert' ? 'Advanced' : 'Intermediate';

  document.getElementById('course-badge').textContent = badgeText;
  document.getElementById('course-badge').setAttribute('style', badgeStyle);
  document.getElementById('course-category').textContent = c.categories && c.categories.length ? c.categories[0] : '';
  document.getElementById('course-title').textContent = c.title || '';
  document.getElementById('course-short-desc').textContent = (c.description || '').substring(0, 200) + ((c.description || '').length > 200 ? '...' : '');

  document.getElementById('course-hours').textContent = c.totalHours ? c.totalHours + ' hours' : 'N/A';
  document.getElementById('course-lessons').textContent = c.totalLessons ? c.totalLessons + ' lessons' : 'N/A';
  document.getElementById('course-level').textContent = badgeText + ' Level';

  var thumb = document.getElementById('course-thumbnail');
  if (c.thumbnailUrl) {
    thumb.style.backgroundImage = 'url(' + c.thumbnailUrl + ')';
  } else {
    thumb.style.background = 'var(--surface-variant)';
    thumb.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><span class="material-symbols-outlined" style="font-size:4rem;color:var(--outline)">school</span></div>';
  }

  if (c.description && !document.getElementById('course-description').innerHTML) {
    document.getElementById('course-description').innerHTML = c.description.replace(/\n/g, '<br/>');
  }

  var sectionCount = (c.sections && c.sections.length) || 0;
  var lessonCount = c.totalLessons || 0;
  document.getElementById('curriculum-summary').textContent = sectionCount + ' sections \u00B7 ' + lessonCount + ' lessons \u00B7 ' + (c.totalHours || 0) + ' hours total';
}

function renderRating(rating, count) {
  var el = document.getElementById('rating-display');
  if (rating > 0) {
    el.style.display = 'flex';
    document.getElementById('course-rating').textContent = rating.toFixed(1);
    document.getElementById('course-review-count').textContent = '(' + count + ')';
  } else {
    el.style.display = 'none';
  }
}

function renderCurriculum(sections) {
  var container = document.getElementById('curriculum-list');
  if (!sections || sections.length === 0) {
    container.innerHTML = '<p style="color: var(--on-surface-variant)">No curriculum available yet.</p>';
    return;
  }

  var html = '';
  sections.forEach(function (section, si) {
    var lessons = section.Lessons || [];
    var sectionDuration = 0;
    lessons.forEach(function (l) { sectionDuration += l.durationMinutes || 0; });

    html += '<div class="rounded-2xl border mb-3 overflow-hidden" style="background: #fff; border-color: var(--outline-variant)">'
      + '<div class="flex items-center justify-between p-4 cursor-pointer section-header" data-section="' + si + '" style="font-weight: 700; font-size: 1rem">'
      + '<div class="flex items-center gap-2">'
      + '<span class="material-symbols-outlined section-arrow" style="transition: transform 0.2s; font-size: 1.2rem">chevron_right</span>'
      + '<span>' + escapeHtml(section.title || 'Section ' + (si + 1)) + '</span>'
      + '</div>'
      + '<span class="text-xs" style="color: var(--on-surface-variant); font-weight: 400">' + lessons.length + ' lectures \u00B7 ' + formatDuration(sectionDuration) + '</span>'
      + '</div>'
      + '<div class="section-body" style="display: none; border-top: 1px solid var(--outline-variant)">';

    lessons.forEach(function (lesson) {
      var isPreview = lesson.isPreview;
      html += '<div class="curriculum-lesson' + (isPreview ? ' preview-lesson' : '') + '">'
        + '<div class="flex items-center gap-3">'
        + '<span class="material-symbols-outlined" style="font-size: 1.1rem; color: var(--on-surface-variant)">' + getLessonIcon(lesson.type) + '</span>'
        + '<span class="text-sm font-medium">' + escapeHtml(lesson.title) + '</span>'
        + (isPreview ? '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded" style="background: var(--primary); color: #fff">PREVIEW</span>' : '')
        + '</div>'
        + '<span class="text-xs" style="color: var(--on-surface-variant)">' + formatDuration(lesson.durationMinutes) + '</span>'
        + '</div>';
    });

    html += '</div></div>';
  });

  container.innerHTML = html;

  container.querySelectorAll('.section-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var body = header.nextElementSibling;
      var arrow = header.querySelector('.section-arrow');
      if (body.style.display === 'none') {
        body.style.display = 'block';
        arrow.style.transform = 'rotate(90deg)';
      } else {
        body.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
      }
    });
  });
}

function renderPricing(c) {
  var priceEl = document.getElementById('current-price');
  var oldPriceEl = document.getElementById('old-price');
  var discountEl = document.getElementById('discount-badge');

  if (c.price != null && c.price > 0) {
    priceEl.textContent = c.currency === 'EUR' ? '\u20AC' + c.price.toFixed(2) : '$' + c.price.toFixed(2);
    if (c.previousPrice && c.previousPrice > c.price) {
      oldPriceEl.textContent = c.currency === 'EUR' ? '\u20AC' + c.previousPrice.toFixed(2) : '$' + c.previousPrice.toFixed(2);
      oldPriceEl.style.display = 'inline';
      if (c.discountPercent) {
        discountEl.textContent = c.discountPercent + '% OFF';
        discountEl.style.display = 'inline';
      }
    } else {
      oldPriceEl.style.display = 'none';
      discountEl.style.display = 'none';
    }
  } else {
    priceEl.textContent = 'Free';
    oldPriceEl.style.display = 'none';
    discountEl.style.display = 'none';
  }
}

function renderPerks(perks) {
  var container = document.getElementById('perks-list');
  if (!perks || perks.length === 0) {
    container.innerHTML = '<p class="text-xs" style="color: var(--on-surface-variant)">No additional features listed.</p>';
    return;
  }
  var html = '';
  perks.forEach(function (perk) {
    html += '<div class="perk-item"><span class="material-symbols-outlined">check_circle</span><span class="text-sm">' + escapeHtml(perk) + '</span></div>';
  });
  container.innerHTML = html;
}

function renderGrowth(specialization) {
  var section = document.getElementById('growth-section');
  var container = document.getElementById('growth-content');
  if (!specialization) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  var html = '<div class="rounded-2xl border p-6" style="background: #fff; border-color: var(--outline-variant)">'
    + '<div class="flex items-center gap-3 mb-4">'
    + '<span class="material-symbols-outlined" style="font-size: 2rem; color: var(--primary)">trending_up</span>'
    + '<div><h3 class="font-bold">' + escapeHtml(specialization.title || 'Career Path') + '</h3>'
    + '<p class="text-sm" style="color: var(--on-surface-variant)">' + escapeHtml(specialization.description || '') + '</p></div>'
    + '</div>';
  if (specialization.steps && specialization.steps.length) {
    html += '<div style="border-top: 1px solid var(--outline-variant); padding-top: 1rem">';
    specialization.steps.forEach(function (step, i) {
      html += '<div class="flex items-center gap-3 py-2">'
        + '<div class="size-8 rounded-full flex items-center justify-center text-sm font-bold" style="background: var(--primary-fixed); color: var(--on-primary-fixed)">' + (i + 1) + '</div>'
        + '<span class="text-sm">' + escapeHtml(step) + '</span>'
        + '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function renderInstructor(tutor, tutorProfile) {
  var container = document.getElementById('instructor-card');
  if (!tutor) {
    container.innerHTML = '<p style="color: var(--on-surface-variant)">Instructor information not available.</p>';
    return;
  }

  var avatar = tutor.avatarUrl || '/img/placeholder.svg';
  var headline = tutorProfile ? tutorProfile.headline || tutor.bio || '' : tutor.bio || '';
  var token = localStorage.getItem('token');

  container.innerHTML = '<div class="instructor-avatar" style="background-image: url(' + avatar + ')"></div>'
    + '<div class="grow">'
    + '<div class="flex items-center gap-2 mb-1">'
    + '<h3 class="text-xl font-bold">' + escapeHtml(tutor.fullName) + '</h3>'
    + '</div>'
    + '<p class="text-sm mb-1" style="color: var(--primary); font-weight: 600">' + escapeHtml(headline || 'Instructor') + '</p>'
    + '<p class="text-sm mb-3" style="color: var(--on-surface-variant)">' + escapeHtml(tutor.bio || '') + '</p>'
    + '<div class="flex items-center gap-3">'
    + '<a href="/profile/' + tutor.id + '" class="text-sm font-bold" style="color: var(--primary)">View Profile</a>'
    + '<button id="follow-btn" class="text-sm font-bold py-1.5 px-4 rounded-lg transition-all" style="background: var(--surface-variant); color: var(--on-surface)">' + (token ? 'Loading...' : 'Follow') + '</button>'
    + '</div>'
    + '</div>';

  if (token) {
    loadFollowStatus(tutor.id);
  } else {
    var btn = document.getElementById('follow-btn');
    btn.textContent = 'Follow';
    btn.setAttribute('data-auth', 'login');
    wireAuthRequiredActions();
  }
}

function loadFollowStatus(tutorId) {
  api.get('/api/follow/' + tutorId + '/status')
    .then(function (res) {
      var btn = document.getElementById('follow-btn');
      if (!btn) return;
      if (res && res.data) {
        if (res.data.isFollowing) {
          btn.textContent = 'Following';
          btn.style.background = 'var(--primary)';
          btn.style.color = '#fff';
          btn._isFollowing = true;
        } else {
          btn.textContent = 'Follow';
          btn.style.background = 'var(--surface-variant)';
          btn.style.color = 'var(--on-surface)';
          btn._isFollowing = false;
        }
        btn.onclick = function () {
          toggleFollow(tutorId, btn);
        };
      }
    })
    .catch(function () {
      var btn = document.getElementById('follow-btn');
      if (btn) { btn.textContent = 'Follow'; btn.onclick = function () { toggleFollow(tutorId, btn); }; }
    });
}

function toggleFollow(tutorId, btn) {
  if (!localStorage.getItem('token')) {
    if (typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }
  var wasFollowing = btn._isFollowing;
  var method = wasFollowing ? 'DELETE' : 'POST';
  var url = wasFollowing ? '/api/follow/' + tutorId + '/unfollow' : '/api/follow/' + tutorId + '/follow';

  api.request(url, { method: method })
    .then(function () {
      btn._isFollowing = !wasFollowing;
      if (btn._isFollowing) {
        btn.textContent = 'Following';
        btn.style.background = 'var(--primary)';
        btn.style.color = '#fff';
      } else {
        btn.textContent = 'Follow';
        btn.style.background = 'var(--surface-variant)';
        btn.style.color = 'var(--on-surface)';
      }
    })
    .catch(function (err) {
      if (err && err.error && err.error.code === 'ALREADY_FOLLOWING') {
        btn._isFollowing = true;
        btn.textContent = 'Following';
        btn.style.background = 'var(--primary)';
        btn.style.color = '#fff';
      }
    });
}

function loadReviews(courseId) {
  api.get('/courses/' + courseId + '/reviews').then(function (res) {
    if (res && res.data && res.data.reviews && res.data.reviews.length) {
      var html = '<div class="mt-12">'
        + '<h2 class="text-2xl font-black mb-4">Student Reviews</h2>'
        + '<div class="flex flex-wrap gap-4">';
      res.data.reviews.slice(0, 3).forEach(function (r) {
        var u = r.User || {};
        html += '<div class="rounded-2xl border p-5" style="background: #fff; border-color: var(--outline-variant); flex: 1; min-width: 280px">'
          + '<div class="flex items-center gap-3 mb-3">'
          + '<div class="size-10 rounded-full" style="background-image: url(' + (u.avatarUrl || '/img/placeholder.svg') + '); background-size: cover; background-position: center"></div>'
          + '<div><p class="font-bold text-sm">' + escapeHtml(u.fullName || 'Student') + '</p>'
          + '<div style="color: var(--tertiary)">' + renderStars(r.rating || 0) + '</div></div>'
          + '</div>'
          + '<p class="text-sm" style="color: var(--on-surface-variant)">' + escapeHtml(r.comment || '') + '</p>'
          + '</div>';
      });
      html += '</div></div>';

      var curriculumSection = document.getElementById('curriculum-section');
      if (curriculumSection) {
        curriculumSection.insertAdjacentHTML('afterend', html);
      }
    }
  }).catch(function () {});
}

function loadSuggestedCourses() {
  var grid = document.getElementById('suggested-grid');
  var token = localStorage.getItem('token');

  var fetchFn = token
    ? api.get('/courses/recommended')
    : PublicAPI.getFeaturedCourses();

  fetchFn.then(function (res) {
    var courses = res && res.data ? (Array.isArray(res.data) ? res.data : res.data.courses || res.data) : [];
    courses = courses.filter(function (c) { return c.id !== courseId; }).slice(0, 4);

    if (courses.length) {
      grid.innerHTML = courses.map(function (c) {
        return '<a href="/course/' + c.id + '" class="block rounded-2xl overflow-hidden border transition-all hover:shadow-lg" style="background: #fff; border-color: var(--outline-variant); text-decoration: none; color: inherit">'
          + '<div class="h-36" style="background-image: url(' + (c.thumbnailUrl || '/img/placeholder.svg') + '); background-size: cover; background-position: center"></div>'
          + '<div class="p-4"><h3 class="font-bold text-sm mb-1">' + escapeHtml(c.title || '') + '</h3>'
          + '<p class="text-xs" style="color: var(--on-surface-variant)">'
          + (c.tutor ? escapeHtml(c.tutor.fullName || '') : '')
          + '</p></div></a>';
      }).join('');
    } else {
      grid.innerHTML = '<div class="col-span-full text-center py-8"><p style="color: var(--on-surface-variant)">No suggestions available.</p></div>';
    }
  }).catch(function () {
    grid.innerHTML = '<div class="col-span-full text-center py-8"><p style="color: var(--on-surface-variant)">Failed to load suggestions.</p></div>';
  });
}

function updateEnrollButton() {
  var btn = document.getElementById('enroll-btn');
  if (btn) {
    btn.textContent = 'Go to Course';
    btn.onclick = function () {
      window.location.href = '/dashboard';
    };
  }
}

function wireAuthRequiredActions() {
  document.querySelectorAll('[data-auth]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (!localStorage.getItem('token')) {
        e.preventDefault();
        if (typeof openAuthModal === 'function') {
          openAuthModal(el.getAttribute('data-auth') || 'login');
        } else {
          window.location.href = '/login';
        }
      }
    });
  });
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
    if (logoutBtn && !logoutBtn._listener) {
      logoutBtn._listener = true;
      logoutBtn.addEventListener('click', async function () {
        try { await AuthAPI.logout(); } catch (_) {}
        localStorage.removeItem('token');
        window.location.href = '/';
      });
    }
  } else if (!token && loginBtn && joinBtn) {
    loginBtn.style.display = '';
    joinBtn.style.display = '';
    if (profileBtn) profileBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (!courseId || courseId === 'course-details.html' || courseId === '') {
    showError();
    return;
  }
  loadCourseDetail();
  updateAuthUI();
});

document.addEventListener('components-loaded', function () {
  updateAuthUI();
  wireAuthRequiredActions();

  var enrollBtn = document.getElementById('enroll-btn');
  if (enrollBtn) {
    enrollBtn.addEventListener('click', function () {
      if (isEnrolled) {
        window.location.href = '/dashboard';
        return;
      }
      if (!localStorage.getItem('token')) {
        if (typeof openAuthModal === 'function') openAuthModal('login');
        return;
      }
      var btn = this;
      btn.textContent = 'Enrolling...';
      btn.disabled = true;
      api.post('/courses/' + courseId + '/enroll')
        .then(function () {
          isEnrolled = true;
          updateEnrollButton();
        })
        .catch(function (err) {
          alert((err && err.error && err.error.message) || 'Failed to enroll');
          btn.textContent = 'Enroll Now';
          btn.disabled = false;
        });
    });
  }

  var previewBtn = document.getElementById('preview-btn');
  if (previewBtn) {
    previewBtn.addEventListener('click', function () {
      if (!courseData || !courseData.sections) return;
      var previewLesson = null;
      courseData.sections.some(function (s) {
        if (!s.Lessons) return false;
        return s.Lessons.some(function (l) {
          if (l.isPreview) { previewLesson = l; return true; }
          return false;
        });
      });
      if (previewLesson) {
        window.location.href = '/lessons/' + previewLesson.id;
      } else if (courseData.sections.length && courseData.sections[0].Lessons && courseData.sections[0].Lessons.length) {
        window.location.href = '/lessons/' + courseData.sections[0].Lessons[0].id;
      } else {
        alert('No preview available for this course.');
      }
    });
  }
});
