(function () {
  'use strict';

  var courseId = null;

  function init() {
    if (!document.getElementById('details-content')) return;
    courseId = extractCourseId();
    if (!courseId) {
      showError();
      return;
    }
    loadCourse();
    wireBack();
    wireShare();
  }

  function extractCourseId() {
    var m = window.location.pathname.match(/\/course\/([a-f0-9-]+)/i);
    return m ? m[1] : null;
  }

  function loadCourse() {
    api.get('/courses/' + courseId).then(function (r) {
      var course = r.data;
      if (!course) { showError(); return; }
      renderCourse(course);
      loadReviews();
      loadSimilar();
    }).catch(function () {
      showError();
    });
  }

  function renderCourse(course) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('course-content').style.display = '';

    document.title = 'LearnBridge - ' + course.title;

    // Hero
    renderHero(course);

    // Outcomes
    renderOutcomes(course);

    // Requirements
    renderRequirements(course);

    // Curriculum
    renderCurriculum(course);

    // Instructor
    renderInstructor(course);

    // Pricing
    renderPricing(course);

    // Certificate
    renderCertificate(course);
  }

  function renderHero(course) {
    var thumb = document.getElementById('hero-thumb');
    if (thumb) thumb.style.backgroundImage = 'url(' + (course.thumbnailUrl || '/img/placeholder.svg') + ')';

    var badges = document.getElementById('hero-badges');
    if (badges) {
      var html = '';
      if (course.discountPercent > 0) html += '<span class="featured-badge" style="background:#16a34a">' + course.discountPercent + '% OFF</span>';
      if (!course.price || course.price === 0) html += '<span class="featured-badge" style="background:#16a34a">Free</span>';
      badges.innerHTML = html;
    }

    var el = document.getElementById('detail-title');
    if (el) el.textContent = course.title;

    el = document.getElementById('detail-subtitle');
    if (el) el.textContent = course.description || '';

    var meta = document.getElementById('hero-meta');
    if (meta) {
      meta.innerHTML =
        '<span><span class="material-symbols-outlined">schedule</span>' + (course.totalHours || 0) + 'h</span>' +
        '<span><span class="material-symbols-outlined">menu_book</span>' + (course.totalLessons || 0) + ' lessons</span>' +
        '<span><span class="material-symbols-outlined">signal_cellular_alt</span>' + capitalize(course.difficulty || 'beginner') + '</span>';
    }

    var inst = document.getElementById('hero-instructor');
    if (inst && course.tutor) {
      var avatar = course.tutor.avatarUrl || '';
      inst.innerHTML =
        '<div class="instructor-avatar-sm" style="background-image:url(' + escAttr(avatar || '/img/placeholder.svg') + ')"></div>' +
        '<div><div class="instructor-name-sm">' + escHtml(course.tutor.fullName) + '</div>' +
        '<div class="instructor-title-sm">Instructor</div></div>';
    }
  }

  function renderOutcomes(course) {
    var container = document.getElementById('outcomes-list');
    if (!container) return;
    var objectives = [];
    if (course.learningObjectives && Array.isArray(course.learningObjectives)) {
      objectives = course.learningObjectives;
    } else if (typeof course.learningObjectives === 'string') {
      try { objectives = JSON.parse(course.learningObjectives); } catch (_) { objectives = [course.learningObjectives]; }
    }
    if (!objectives.length) {
      document.getElementById('outcomes-section').style.display = 'none';
      return;
    }
    container.innerHTML = objectives.map(function (o) {
      return '<div class="outcome-item"><span class="material-symbols-outlined">check_circle</span><span>' + escHtml(o) + '</span></div>';
    }).join('');
  }

  function renderRequirements(course) {
    var container = document.getElementById('requirements-list');
    if (!container) return;
    var reqs = [];
    if (course.requirements && Array.isArray(course.requirements)) {
      reqs = course.requirements;
    } else if (course.requirements && typeof course.requirements === 'string') {
      try { reqs = JSON.parse(course.requirements); } catch (_) { reqs = [course.requirements]; }
    }
    if (!reqs.length) {
      document.getElementById('requirements-section').style.display = 'none';
      return;
    }
    container.innerHTML = reqs.map(function (r) {
      return '<li><span class="material-symbols-outlined">circle</span><span>' + escHtml(r) + '</span></li>';
    }).join('');
  }

  function renderCurriculum(course) {
    var container = document.getElementById('curriculum-accordion');
    var summary = document.getElementById('curriculum-summary');
    if (!container) return;

    var sections = course.sections || [];
    if (!sections.length) {
      document.getElementById('curriculum-section').style.display = 'none';
      return;
    }

    var totalLessons = 0;
    var totalDuration = 0;
    sections.forEach(function (s) {
      var lessons = s.Lessons || [];
      totalLessons += lessons.length;
      lessons.forEach(function (l) { totalDuration += l.durationMinutes || 0; });
    });

    if (summary) {
      summary.textContent = sections.length + ' modules \u00B7 ' + totalLessons + ' lessons \u00B7 ' + formatDuration(totalDuration);
    }

    container.innerHTML = sections.map(function (mod, idx) {
      var lessons = mod.Lessons || [];
      var modDuration = lessons.reduce(function (sum, l) { return sum + (l.durationMinutes || 0); }, 0);
      var lessonsHtml = lessons.map(function (lesson) {
        return renderLesson(lesson);
      }).join('');

      return '<div class="curriculum-module">' +
        '<div class="module-header" data-module="' + idx + '">' +
          '<div class="module-header-left">' +
            '<span class="material-symbols-outlined module-toggle">expand_more</span>' +
            '<div><div class="module-title">' + escHtml(mod.title) + '</div>' +
            '<div class="module-meta">' + lessons.length + ' lessons \u00B7 ' + formatDuration(modDuration) + '</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="module-lessons">' + lessonsHtml + '</div>' +
      '</div>';
    }).join('');

    // Wire module toggles
    container.querySelectorAll('.module-header').forEach(function (header) {
      header.onclick = function () {
        var lessons = this.nextElementSibling;
        var toggle = this.querySelector('.module-toggle');
        lessons.classList.toggle('open');
        toggle.classList.toggle('open');
      };
    });

    // Open first module by default
    var first = container.querySelector('.module-header');
    if (first) first.click();
  }

  function renderLesson(lesson) {
    var state = lesson.userState || 'locked';
    var iconMap = { completed: 'check_circle', current: 'play_circle', preview: 'play_circle', locked: 'lock', unavailable: 'block' };
    var icon = iconMap[state] || 'radio_button_unchecked';
    var iconClass = state === 'completed' ? 'completed' : state === 'current' ? 'current' : state === 'locked' ? 'locked' : state === 'preview' ? 'preview' : '';

    var badgeHtml = '';
    if (state === 'preview') badgeHtml = '<span class="lesson-state-badge preview">Preview</span>';
    else if (state === 'locked') badgeHtml = '<span class="lesson-state-badge locked">Locked</span>';

    var typeIcon = lesson.type === 'video' ? 'play_circle' : lesson.type === 'pdf' ? 'description' : lesson.type === 'quiz' ? 'quiz' : 'note';

    return '<div class="curriculum-lesson" data-lesson-id="' + lesson.id + '">' +
      '<div class="lesson-left">' +
        '<span class="material-symbols-outlined lesson-icon ' + iconClass + '">' + typeIcon + '</span>' +
        '<span class="lesson-title">' + escHtml(lesson.title) + '</span>' +
      '</div>' +
      '<div class="flex items-center gap-2">' +
        (lesson.durationMinutes ? '<span class="lesson-duration">' + lesson.durationMinutes + ' min</span>' : '') +
        badgeHtml +
      '</div>' +
    '</div>';
  }

  function renderInstructor(course) {
    var container = document.getElementById('instructor-card');
    if (!container) return;
    var tutor = course.tutor;
    if (!tutor) { document.getElementById('instructor-section').style.display = 'none'; return; }

    var profile = course.tutorProfile || {};
    var avatar = tutor.avatarUrl || '';
    var bio = tutor.bio || profile.bio || '';

    container.innerHTML =
      '<div class="instructor-avatar-lg" style="background-image:url(' + escAttr(avatar || '/img/placeholder.svg') + ')"></div>' +
      '<div class="instructor-info">' +
        '<h3>' + escHtml(tutor.fullName) + '</h3>' +
        '<div class="instructor-bio">' + escHtml(bio) + '</div>' +
      '</div>';
  }

  function renderPricing(course) {
    var container = document.getElementById('pricing-card');
    if (!container) return;

    var price = course.price;
    var isFree = price == null || price === 0;
    var prevPrice = course.previousPrice;
    var discount = course.discountPercent || 0;

    var priceHtml = isFree
      ? '<span class="current-price free">Free</span>'
      : '<span class="current-price">' + Shared.formatCurrency(price, course.currency) + '</span>';

    if (prevPrice && prevPrice > 0) {
      priceHtml += '<span class="old-price">' + Shared.formatCurrency(prevPrice, course.currency) + '</span>';
      if (discount > 0) priceHtml += '<span class="discount-badge">' + discount + '% off</span>';
    }

    var btnText = course.isEnrolled ? 'Continue Learning' : 'Enroll Now';
    var btnClass = course.isEnrolled ? 'continue' : 'primary';

    var perks = [];
    if (course.perks && Array.isArray(course.perks)) perks = course.perks;
    else if (course.perks && typeof course.perks === 'string') {
      try { perks = JSON.parse(course.perks); } catch (_) { perks = [course.perks]; }
    }

    var perksHtml = perks.length
      ? '<div class="perks-list">' + perks.map(function (p) {
          return '<div class="perk-item"><span class="material-symbols-outlined">check</span><span>' + escHtml(p) + '</span></div>';
        }).join('') + '</div>'
      : '';

    container.innerHTML =
      '<div class="price-display">' + priceHtml + '</div>' +
      '<button class="enroll-btn ' + btnClass + '" id="enroll-btn">' +
        '<span class="material-symbols-outlined">' + (course.isEnrolled ? 'play_arrow' : 'add_shopping_cart') + '</span> ' + btnText +
      '</button>' +
      '<button class="free-preview-btn" id="preview-btn">' +
        '<span class="material-symbols-outlined">play_circle</span> Free Preview' +
      '</button>' +
      perksHtml;

    document.getElementById('enroll-btn').onclick = function () {
      if (course.isEnrolled) {
        window.location.href = '/course/' + course.id;
      } else {
        enrollCourse(course.id);
      }
    };

    document.getElementById('preview-btn').onclick = function () {
      playPreview(course);
    };
  }

  function renderCertificate(course) {
    var container = document.getElementById('certificate-info');
    if (!container) return;
    if (!course.isEnrolled) {
      document.getElementById('certificate-section').style.display = 'none';
      return;
    }
    document.getElementById('certificate-section').style.display = '';
    container.innerHTML =
      '<span class="material-symbols-outlined">verified</span>' +
      '<div class="certificate-text">' +
        '<h4>Certificate of Completion</h4>' +
        '<p>Complete all lessons to earn your certificate.</p>' +
      '</div>';
  }

  function loadReviews() {
    api.get('/courses/' + courseId + '/reviews').then(function (r) {
      var data = r.data;
      renderReviews(data);
    }).catch(function () {});
  }

  function renderReviews(data) {
    var summary = document.getElementById('reviews-summary');
    var list = document.getElementById('reviews-list');
    if (!summary || !list) return;

    var reviews = Array.isArray(data) ? data : (data && data.reviews ? data.reviews : []);
    if (!reviews.length) {
      summary.style.display = 'none';
      list.innerHTML = '<div class="reviews-empty">No reviews yet.</div>';
      return;
    }

    var total = reviews.length;
    var sum = reviews.reduce(function (s, r) { return s + r.rating; }, 0);
    var avg = total > 0 ? (sum / total) : 0;

    summary.innerHTML =
      '<div class="reviews-avg">' + avg.toFixed(1) + '</div>' +
      '<div><div class="reviews-stars">' + renderStars(avg) + '</div>' +
      '<div class="reviews-count">' + total + ' review' + (total !== 1 ? 's' : '') + '</div></div>';

    list.innerHTML = reviews.map(function (r) {
      var user = r.User || {};
      var avatar = user.avatarUrl || '';
      return '<div class="review-item">' +
        '<div class="review-header">' +
          '<div class="review-avatar" style="background-image:url(' + escAttr(avatar || '/img/placeholder.svg') + ')"></div>' +
          '<span class="review-author">' + escHtml(user.fullName || 'Anonymous') + '</span>' +
          '<span class="review-stars">' + renderStars(r.rating) + '</span>' +
          '<span class="review-date">' + formatDate(r.createdAt) + '</span>' +
        '</div>' +
        (r.comment ? '<div class="review-comment">' + escHtml(r.comment) + '</div>' : '') +
      '</div>';
    }).join('');
  }

  function loadSimilar() {
    api.get('/courses?limit=4').then(function (r) {
      var data = r.data;
      var courses = data.courses || [];
      var filtered = courses.filter(function (c) { return c.id !== courseId; }).slice(0, 4);
      if (!filtered.length) return;
      var container = document.getElementById('similar-grid');
      var section = document.getElementById('similar-section');
      if (!container || !section) return;
      section.style.display = '';
      container.innerHTML = filtered.map(function (c) {
        return '<a href="/course/' + c.id + '" class="similar-card">' +
          '<div class="similar-thumb" style="background-image:url(' + escAttr(c.thumbnailUrl || '/img/placeholder.svg') + ')"></div>' +
          '<div class="similar-body">' +
            '<h4>' + escHtml(c.title) + '</h4>' +
            '<div class="text-xs">' + escHtml(c.tutor ? c.tutor.fullName : '') + '</div>' +
          '</div>' +
        '</a>';
      }).join('');
    }).catch(function () {});
  }

  function enrollCourse(id) {
    var token = localStorage.getItem('token');
    if (!token) {
      if (window.openAuthModal) window.openAuthModal('register');
      return;
    }
    var btn = document.getElementById('enroll-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Enrolling...'; }
    api.post('/courses/' + id + '/enroll', {}).then(function () {
      window.location.href = '/course/' + id;
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Enroll Now'; }
      alert('Failed to enroll. Please try again.');
    });
  }

  function playPreview(course) {
    // Find first preview lesson
    var sections = course.sections || [];
    for (var i = 0; i < sections.length; i++) {
      var lessons = sections[i].Lessons || [];
      for (var j = 0; j < lessons.length; j++) {
        var lesson = lessons[j];
        if (lesson.isPreview && lesson.videoUrl) {
          window.open(lesson.videoUrl, '_blank');
          return;
        }
      }
    }
    alert('No preview available for this course.');
  }

  function wireBack() {
    var btn = document.getElementById('back-btn');
    if (btn) btn.onclick = function () { window.history.back(); };
  }

  function wireShare() {
    var btn = document.getElementById('share-btn');
    if (!btn) return;
    btn.onclick = function () {
      if (navigator.share) {
        navigator.share({ title: document.title, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        btn.innerHTML = '<span class="material-symbols-outlined">check</span>';
        setTimeout(function () { btn.innerHTML = '<span class="material-symbols-outlined">share</span>'; }, 2000);
      }
    };
  }

  function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = '';
  }


  function formatDuration(minutes) {
    if (!minutes) return '0 min';
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return (h ? h + 'h ' : '') + m + 'min';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function renderStars(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.5;
    var s = '';
    for (var i = 0; i < full; i++) s += '<span class="material-symbols-outlined" style="font-size:0.85rem;font-variation-settings:\'FILL\' 1">star</span>';
    if (half) s += '<span class="material-symbols-outlined" style="font-size:0.85rem;font-variation-settings:\'FILL\' 1">star_half</span>';
    var empty = 5 - full - (half ? 1 : 0);
    for (var i = 0; i < empty; i++) s += '<span class="material-symbols-outlined" style="font-size:0.85rem">star</span>';
    return s;
  }

  function escHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escAttr(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('components-loaded', init);
})();
