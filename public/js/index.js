function escapeHtml(text) {
  var d = document.createElement('div');
  d.textContent = text || '';
  return d.innerHTML;
}

function renderStars(rating) {
  var s = '';
  for (var i = 0; i < 5; i++) {
    s += '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' ' + (i < rating ? '1' : '0') + '">star</span>';
  }
  return s;
}

var DEFAULT_IMG = '/img/placeholder.svg';

fetch('/public/config').then(function (r) { return r.json(); }).then(function (res) {
  if (res && res.data && res.data.defaultAvatarUrl) DEFAULT_IMG = res.data.defaultAvatarUrl;
}).catch(function () { /* use local fallback */ });

function renderCourseCard(c) {
  var cat = c.categories && c.categories.length ? c.categories[0] : 'Course';
  var badge = c.difficulty === 'beginner' ? 'Beginner' : c.difficulty === 'expert' ? 'Advanced' : 'Intermediate';
  var badgeStyle = c.difficulty === 'expert'
    ? 'background: var(--secondary-fixed); color: var(--on-secondary-fixed)'
    : 'background: var(--primary-fixed); color: var(--on-primary-fixed)';
  var img = c.thumbnailUrl || DEFAULT_IMG;
  var instructorName = c.tutor ? c.tutor.fullName : 'Instructor';
  var instructorAvatar = c.tutor && c.tutor.avatarUrl ? c.tutor.avatarUrl : DEFAULT_IMG;
  var price = c.price != null ? '$' + c.price.toFixed(2) : 'Free';
  return '<div class="rounded-2xl overflow-hidden border flex flex-col transition-all" style="background: #fff; border-color: var(--outline-variant); box-shadow: 0 1px 2px rgba(0,0,0,0.05)">'
    + '<div class="relative h-48" style="background-image: url(\'' + img + '\'); background-size: cover; background-position: center"></div>'
    + '<div class="p-6 flex flex-col grow">'
    + '<div class="flex justify-between items-center mb-4">'
    + '<span class="text-[11px] font-bold px-2 py-0.5 rounded uppercase" style="' + badgeStyle + '">' + escapeHtml(cat) + '</span>'
    + '</div>'
    + '<h3 class="text-xl font-bold mb-2">' + escapeHtml(c.title) + '</h3>'
    + '<div class="flex items-center gap-3 mb-6">'
    + '<div class="size-8 rounded-full" style="background-image: url(\'' + (instructorAvatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&q=80') + '\'); background-size: cover; background-position: center"></div>'
    + '<p class="text-sm font-medium" style="color: var(--on-surface-variant)">' + escapeHtml(instructorName) + '</p>'
    + '</div>'
    + '<div class="mt-auto flex items-center justify-between pt-4" style="border-top: 1px solid var(--outline-variant)">'
    + '<span class="text-lg font-black">' + price + '</span>'
    + '<button class="text-sm font-bold py-2 px-4 rounded-lg transition-all" style="color: var(--primary); background: rgba(0, 74, 198, 0.05)" data-auth="login">Enroll Now</button>'
    + '</div>'
    + '</div>'
    + '</div>';
}

function renderInstructorCard(instructor) {
  var img = instructor.avatarUrl || DEFAULT_IMG;
  var headline = instructor.TutorProfile ? instructor.TutorProfile.headline || instructor.bio || '' : instructor.bio || '';
  return '<div class="group text-center">'
    + '<div class="relative size-48 mx-auto mb-6 rounded-3xl overflow-hidden shadow-lg transition-all duration-300">'
    + '<div class="w-full h-full transition-all duration-500" style="background-image: url(\'' + img + '\'); background-size: cover; background-position: center; filter: grayscale(1)"></div>'
    + '</div>'
    + '<h4 class="text-xl font-bold mb-1">' + escapeHtml(instructor.fullName) + '</h4>'
    + '<p class="text-sm font-bold mb-2" style="color: var(--primary)">' + escapeHtml(headline || 'Expert Instructor') + '</p>'
    + '</div>';
}

function renderBlogCard(post) {
  var img = post.featuredImage || '';
  var date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  var authorName = post.author ? post.author.fullName : 'LearnBridge';
  return '<a href="/blog/' + post.slug + '" class="block rounded-2xl overflow-hidden border transition-all hover:shadow-lg" style="background: #fff; border-color: var(--outline-variant); text-decoration: none; color: inherit">'
    + (img ? '<div class="h-48" style="background-image: url(\'' + img + '\'); background-size: cover; background-position: center"></div>' : '')
    + '<div class="p-6">'
    + '<p class="text-xs uppercase tracking-widest font-bold mb-2" style="color: var(--primary)">' + date + '</p>'
    + '<h3 class="text-lg font-bold mb-2">' + escapeHtml(post.title) + '</h3>'
    + '<p class="text-sm" style="color: var(--on-surface-variant)">' + escapeHtml(post.excerpt || '') + '</p>'
    + '<p class="text-xs mt-4" style="color: var(--on-surface-variant)">By ' + escapeHtml(authorName) + '</p>'
    + '</div>'
    + '</a>';
}

function renderTestimonialCard(t) {
  var user = t.User || {};
  var name = user.fullName || 'Student';
  var avatar = user.avatarUrl || DEFAULT_IMG;
  var title = user.bio || 'Verified Graduate';
  var comment = t.comment || '';
  return '<div class="testimonial-card p-8 rounded-2xl border" style="background: #fff; border-color: var(--outline-variant); box-shadow: 0 1px 2px rgba(0,0,0,0.05); min-width: 380px; flex-shrink: 0">'
    + '<div class="flex mb-6" style="color: var(--tertiary)">' + renderStars(t.rating || 5) + '</div>'
    + '<p class="mb-8 text-base italic leading-relaxed">"' + escapeHtml(comment) + '"</p>'
    + '<div class="flex items-center gap-4">'
    + '<div class="size-12 rounded-full" style="background-image: url(\'' + avatar + '\'); background-size: cover; background-position: center"></div>'
    + '<div>'
    + '<p class="font-bold">' + escapeHtml(name) + '</p>'
    + '<p class="text-xs" style="color: var(--on-surface-variant)">' + escapeHtml(title) + '</p>'
    + '</div>'
    + '</div>'
    + '</div>';
}

function renderTestimonialMarquee(reviews) {
  var grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  if (!reviews || reviews.length === 0) {
    grid.innerHTML = '<div class="col-span-full text-center py-8"><p style="color: var(--on-surface-variant)">No testimonials yet.</p></div>';
    return;
  }
  var cards = reviews.map(renderTestimonialCard).join('');
  grid.innerHTML = '<div class="marquee" style="padding: 1rem 0">'
    + '<div class="marquee-content" style="gap: 2rem; animation: scroll 40s linear infinite">' + cards + '</div>'
    + '<div class="marquee-content" style="gap: 2rem; animation: scroll 40s linear infinite">' + cards + '</div>'
    + '</div>';
}

function loadLandingData() {
  PublicAPI.getLandingData().then(function (result) {
    var data = result.data;

    var courseGrid = document.getElementById('course-grid');
    if (courseGrid && data.featuredCourses && data.featuredCourses.length) {
      courseGrid.innerHTML = data.featuredCourses.map(renderCourseCard).join('');
      wireAuthRequiredActions();
    } else if (courseGrid) {
      courseGrid.innerHTML = '<div class="col-span-full text-center py-8"><p style="color: var(--on-surface-variant)">No courses available yet.</p></div>';
    }

    var statsMap = {
      'stat-users': data.stats ? data.stats.totalUsers : null,
      'stat-courses': data.stats ? data.stats.totalCourses : null,
      'stat-enrollments': data.stats ? data.stats.totalEnrollments : null,
      'stat-certificates': data.stats ? data.stats.totalCertificates : null,
    };
    Object.keys(statsMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && statsMap[id] != null) {
        var val = statsMap[id];
        el.textContent = val >= 1000 ? Math.round(val / 1000) + 'K+' : val;
      }
    });

    var instructorsGrid = document.getElementById('instructors-grid');
    if (instructorsGrid && data.instructors && data.instructors.length) {
      instructorsGrid.innerHTML = data.instructors.map(renderInstructorCard).join('');
    } else if (instructorsGrid) {
      instructorsGrid.innerHTML = '<div class="col-span-full text-center py-8"><p style="color: var(--on-surface-variant)">No instructors yet.</p></div>';
    }

    renderTestimonialMarquee(data.testimonials);

    var blogSection = document.getElementById('blog-section');
    if (blogSection && data.recentBlogPosts && data.recentBlogPosts.length) {
      blogSection.innerHTML = data.recentBlogPosts.map(renderBlogCard).join('');
    } else if (blogSection) {
      blogSection.innerHTML = '<div class="col-span-full text-center py-8"><p style="color: var(--on-surface-variant)">No posts yet.</p></div>';
    }
  }).catch(function () {
    var courseGrid = document.getElementById('course-grid');
    if (courseGrid) courseGrid.innerHTML = '<div class="col-span-full text-center py-8"><p style="color: var(--on-surface-variant)">Failed to load courses.</p></div>';
  });
}

function checkCompletionPrompt() {
  var completedCourse = localStorage.getItem('justCompletedCourse');
  if (completedCourse && typeof openAuthModal === 'function') {
    localStorage.removeItem('justCompletedCourse');
    if (localStorage.getItem('token')) {
      showReviewPopup(completedCourse);
    }
  }
}

function showReviewPopup(courseId) {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'flex';
  overlay.innerHTML = '<div class="modal-backdrop"></div>'
    + '<div class="modal-container" style="max-width: 24rem">'
    + '<div class="modal-header"><button class="modal-close" id="review-popup-close" type="button"><span class="material-symbols-outlined">close</span></button></div>'
    + '<div class="modal-body">'
    + '<div class="auth-header" style="margin-bottom: 1rem">'
    + '<h2 style="font-size: 1.375rem">Congratulations!</h2>'
    + '<p>You completed this course. Would you like to share your experience?</p>'
    + '</div>'
    + '<div class="form-group">'
    + '<label>Rating</label>'
    + '<div class="flex gap-2" id="review-rating" style="font-size: 2rem; color: var(--tertiary); cursor: pointer">'
    + Array(5).fill(0).map(function (_, i) { return '<span class="star" data-val="' + (i + 1) + '" style="transition: transform 0.1s">&#9733;</span>'; }).join('')
    + '</div>'
    + '</div>'
    + '<div class="form-group">'
    + '<label for="review-comment">Your Comment</label>'
    + '<textarea class="form-input" id="review-comment" rows="3" placeholder="What did you enjoy most?" style="resize: vertical; min-height: 80px"></textarea>'
    + '</div>'
    + '<label class="checkbox-label" style="margin-bottom: 1rem; font-size: 0.8rem">'
    + '<input type="checkbox" id="review-consent"/> I consent to feature my review on the website.'
    + '</label>'
    + '<div id="review-error" class="form-error" style="display:none; margin-bottom: 0.75rem"></div>'
    + '<button class="btn-submit" id="review-submit-btn" type="button">Submit Review</button>'
    + '</div>'
    + '</div>';
  document.body.appendChild(overlay);
  document.body.classList.add('modal-open');

  var selectedRating = 0;
  var stars = overlay.querySelectorAll('.star');
  stars.forEach(function (s) {
    s.addEventListener('mouseenter', function () {
      var val = parseInt(s.getAttribute('data-val'));
      stars.forEach(function (st, i) { st.style.transform = i < val ? 'scale(1.2)' : ''; });
    });
    s.addEventListener('mouseleave', function () {
      stars.forEach(function (st) { st.style.transform = ''; });
    });
    s.addEventListener('click', function () {
      selectedRating = parseInt(s.getAttribute('data-val'));
      stars.forEach(function (st, i) { st.style.color = i < selectedRating ? '' : 'var(--outline-variant)'; });
    });
  });

  overlay.querySelector('.modal-backdrop').addEventListener('click', function () { overlay.remove(); document.body.classList.remove('modal-open'); });
  overlay.querySelector('#review-popup-close').addEventListener('click', function () { overlay.remove(); document.body.classList.remove('modal-open'); });

  overlay.querySelector('#review-submit-btn').addEventListener('click', function () {
    var comment = overlay.querySelector('#review-comment').value.trim();
    var consent = overlay.querySelector('#review-consent').checked;
    var errorEl = overlay.querySelector('#review-error');

    if (!selectedRating) {
      errorEl.textContent = 'Please select a rating.';
      errorEl.style.display = 'block';
      return;
    }

    ReviewsAPI.submit(courseId, { rating: selectedRating, comment: comment, consentToFeature: consent })
      .then(function () {
        overlay.remove();
        document.body.classList.remove('modal-open');
      })
      .catch(function (err) {
        errorEl.textContent = (err && err.error && err.error.message) || 'Failed to submit.';
        errorEl.style.display = 'block';
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

function initLandingPage() {
  var header = document.querySelector('.fixed-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }
  updateAuthUI();
  wireAuthRequiredActions();
  loadLandingData();
  checkCompletionPrompt();
}

document.addEventListener('DOMContentLoaded', initLandingPage);
document.addEventListener('components-loaded', initLandingPage);
