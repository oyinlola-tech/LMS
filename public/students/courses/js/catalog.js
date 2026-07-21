(function () {
  'use strict';

  var state = {
    courses: [],
    featured: [],
    categories: [],
    page: 1,
    limit: 12,
    totalPages: 1,
    total: 0,
    search: '',
    difficulty: '',
    category: '',
    sort: 'newest',
    loading: false,
    wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
  };

  function init() {
    if (!document.getElementById('courses-grid')) return;
    loadCategories();
    loadFeatured();
    loadCourses();
    wireSearch();
    wireFilters();
    wireScrollToTop();

    document.addEventListener('components-loaded', function () {
      var pageEl = document.querySelector('[data-page]');
      if (pageEl) pageEl.dataset.page = 'courses';
    });
  }

  function apiGet(path) {
    return api.get(path).then(function (r) { return r.data; });
  }

  function loadCategories() {
    apiGet('/courses/categories').then(function (cats) {
      state.categories = cats || [];
      renderCategories();
    }).catch(function () {});
  }

  function loadFeatured() {
    apiGet('/courses/featured').then(function (data) {
      state.featured = Array.isArray(data) ? data : [];
      renderFeatured();
    }).catch(function () {});
  }

  function loadCourses() {
    if (state.loading) return;
    state.loading = true;
    var container = document.getElementById('courses-grid');
    if (state.page === 1) {
      container.innerHTML = '<div class="loading-placeholder">' +
        '<div class="skeleton-card" style="height:360px"></div>'.repeat(4) +
        '</div>';
    }

    var params = new URLSearchParams();
    params.set('page', String(state.page));
    params.set('limit', String(state.limit));
    if (state.search) params.set('q', state.search);
    if (state.difficulty) params.set('difficulty', state.difficulty);
    if (state.category) params.set('category', state.category);

    var url = '/courses?' + params.toString();
    apiGet(url).then(function (result) {
      state.courses = result.courses || [];
      state.total = result.total || 0;
      state.totalPages = result.totalPages || 1;
      renderCourses();
      renderPagination();
      updateResultsCount();
    }).catch(function () {
      container.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined empty-icon">error</span><h3>Failed to load courses</h3><p>Please try again later</p></div>';
    }).finally(function () {
      state.loading = false;
    });
  }

  function renderCategories() {
    var container = document.getElementById('category-filters');
    if (!container) return;
    var html = '<button class="category-chip' + (!state.category ? ' active' : '') + '" data-category="">All</button>';
    state.categories.forEach(function (cat) {
      var name = cat.name || cat;
      html += '<button class="category-chip' + (state.category === name ? ' active' : '') + '" data-category="' + escAttr(name) + '">' + escHtml(name) + '</button>';
    });
    container.innerHTML = html;
    container.querySelectorAll('.category-chip').forEach(function (btn) {
      btn.onclick = function () {
        state.category = this.dataset.category;
        state.page = 1;
        container.querySelectorAll('.category-chip').forEach(function (c) { c.classList.toggle('active', c === btn); });
        loadCourses();
      };
    });
  }

  function renderFeatured() {
    var container = document.getElementById('featured-grid');
    if (!container) return;
    if (!state.featured.length) {
      container.parentElement.style.display = 'none';
      return;
    }
    container.parentElement.style.display = '';
    container.innerHTML = state.featured.map(function (course) {
      return renderCourseCard(course, true);
    }).join('');
    wireCardButtons(container);
  }

  function renderCourses() {
    var container = document.getElementById('courses-grid');
    var empty = document.getElementById('empty-state');
    if (!container) return;
    if (!state.courses.length) {
      container.innerHTML = '';
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    container.innerHTML = state.courses.map(function (course) {
      return renderCourseCard(course, false);
    }).join('');
    wireCardButtons(container);
  }

  function renderCourseCard(course, isFeatured) {
    var w = state.wishlist;
    var inWishlist = w.indexOf(course.id) !== -1;
    var cats = Array.isArray(course.categories) ? course.categories : [];
    var category = cats.length ? cats[0] : '';
    var price = course.price != null ? course.price : 0;
    var isFree = price === 0;
    var hasDiscount = course.previousPrice != null && course.previousPrice > price;
    var progress = course.progressPercent || 0;
    var completed = course.isEnrolled && progress >= 100;
    var thumbnail = course.thumbnailUrl || '/img/placeholder.svg';
    var tutorName = course.tutor ? course.tutor.fullName : 'Instructor';
    var rating = course.avgRating || 0;
    var enrolledCount = course.enrolledCount || 0;
    var stars = rating > 0 ? renderStars(rating) : '';

    var badgesHtml = '';
    if (isFeatured) badgesHtml += '<span class="course-badge featured">Featured</span>';
    if (isFree) badgesHtml += '<span class="course-badge free">Free</span>';
    if (hasDiscount) badgesHtml += '<span class="course-badge bestseller">Sale</span>';

    var priceHtml = isFree
      ? '<span class="course-card-price free">Free</span>'
      : '<span class="course-card-price">' + formatPrice(price, course.currency) + '</span>';
    if (hasDiscount) {
      priceHtml += '<span class="price-old">' + formatPrice(course.previousPrice, course.currency) + '</span>';
      priceHtml = '<div>' + priceHtml + '</div>';
    }

    var btnHtml = course.isEnrolled
      ? '<button class="course-card-btn continue" data-id="' + course.id + '" data-action="continue">Continue</button>'
      : '<button class="course-card-btn enroll" data-id="' + course.id + '" data-action="enroll">Enroll</button>';

    var progressHtml = course.isEnrolled && !completed
      ? '<div class="course-card-progress"><div class="progress-bar-track"><div class="progress-bar-fill" style="width:' + progress + '%"></div></div><div class="progress-label">' + Math.round(progress) + '% complete</div></div>'
      : '';

    var completedClass = completed ? ' completed' : '';

    return '<div class="course-card' + completedClass + '">' +
      '<a href="/course/' + course.id + '" class="course-card-thumb" style="background-image:url(' + escAttr(thumbnail) + ')">' +
        '<div class="course-card-badges">' + badgesHtml + '</div>' +
        '<button class="course-card-wishlist' + (inWishlist ? ' active' : '') + '" data-id="' + course.id + '" data-action="wishlist" title="Wishlist">' +
          '<span class="material-symbols-outlined">favorite</span>' +
        '</button>' +
      '</a>' +
      '<div class="course-card-body">' +
        (category ? '<div class="course-card-category">' + escHtml(category) + '</div>' : '') +
        '<h3 class="course-card-title"><a href="/course/' + course.id + '">' + escHtml(course.title) + '</a></h3>' +
        '<div class="course-card-instructor">' + escHtml(tutorName) + '</div>' +
        '<div class="course-card-meta">' +
          '<span><span class="material-symbols-outlined">schedule</span>' + (course.totalHours || 0) + 'h</span>' +
          '<span><span class="material-symbols-outlined">menu_book</span>' + (course.totalLessons || 0) + ' lessons</span>' +
          '<span><span class="material-symbols-outlined">signal_cellular_alt</span>' + capitalize(course.difficulty || 'beginner') + '</span>' +
        '</div>' +
        (rating > 0 ? '<div class="course-card-rating">' + stars + '<span class="rating-value">' + rating.toFixed(1) + '</span><span class="rating-count">(' + enrolledCount + ')</span></div>' : '') +
        '<div class="course-card-footer">' + priceHtml + btnHtml + '</div>' +
      '</div>' +
      progressHtml +
    '</div>';
  }

  function renderStars(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.5;
    var s = '';
    for (var i = 0; i < full; i++) s += '<span class="material-symbols-outlined rating-stars">star</span>';
    if (half) s += '<span class="material-symbols-outlined rating-stars">star_half</span>';
    var empty = 5 - full - (half ? 1 : 0);
    for (var i = 0; i < empty; i++) s += '<span class="material-symbols-outlined rating-stars" style="font-variation-settings:' + "'FILL' 0" + '">star</span>';
    return s;
  }

  function wireCardButtons(container) {
    container.querySelectorAll('[data-action="enroll"]').forEach(function (btn) {
      btn.onclick = function () { enrollCourse(this.dataset.id); };
    });
    container.querySelectorAll('[data-action="continue"]').forEach(function (btn) {
      btn.onclick = function () { window.location.href = '/course/' + this.dataset.id; };
    });
    container.querySelectorAll('[data-action="wishlist"]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(this.dataset.id, this);
      };
    });
  }

  function enrollCourse(courseId) {
    var token = localStorage.getItem('token');
    if (!token) {
      if (window.openAuthModal) window.openAuthModal('register');
      return;
    }
    var btn = document.querySelector('[data-id="' + courseId + '"][data-action="enroll"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Enrolling...'; }
    api.post('/courses/' + courseId + '/enroll', {}).then(function () {
      if (btn) { btn.textContent = 'Continue'; btn.className = 'course-card-btn continue'; btn.dataset.action = 'continue'; }
      loadCourses();
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Enroll'; }
      alert('Failed to enroll. Please try again.');
    });
  }

  function toggleWishlist(courseId, btn) {
    var idx = state.wishlist.indexOf(courseId);
    if (idx === -1) {
      state.wishlist.push(courseId);
      if (btn) btn.classList.add('active');
    } else {
      state.wishlist.splice(idx, 1);
      if (btn) btn.classList.remove('active');
    }
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
  }

  function renderPagination() {
    var bar = document.getElementById('pagination-bar');
    if (!bar) return;
    if (state.totalPages <= 1) { bar.innerHTML = ''; return; }
    var html = '';
    html += '<button class="pagination-btn" data-page="' + (state.page - 1) + '"' + (state.page <= 1 ? ' disabled' : '') + '>Previous</button>';
    var start = Math.max(1, state.page - 2);
    var end = Math.min(state.totalPages, state.page + 2);
    if (start > 1) { html += '<button class="pagination-btn" data-page="1">1</button>'; if (start > 2) html += '<span class="pagination-info">...</span>'; }
    for (var p = start; p <= end; p++) {
      html += '<button class="pagination-btn' + (p === state.page ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
    }
    if (end < state.totalPages) { if (end < state.totalPages - 1) html += '<span class="pagination-info">...</span>'; html += '<button class="pagination-btn" data-page="' + state.totalPages + '">' + state.totalPages + '</button>'; }
    html += '<button class="pagination-btn" data-page="' + (state.page + 1) + '"' + (state.page >= state.totalPages ? ' disabled' : '') + '>Next</button>';
    bar.innerHTML = html;
    bar.querySelectorAll('.pagination-btn:not([disabled])').forEach(function (btn) {
      btn.onclick = function () {
        state.page = parseInt(this.dataset.page, 10);
        loadCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });
  }

  function updateResultsCount() {
    var el = document.getElementById('results-count');
    if (el) el.textContent = state.total + ' course' + (state.total !== 1 ? 's' : '') + ' found';
  }

  function wireSearch() {
    var input = document.getElementById('catalog-search');
    if (!input) return;
    var timer;
    input.oninput = function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.search = input.value.trim();
        state.page = 1;
        loadCourses();
      }, 400);
    };
  }

  function wireFilters() {
    var diff = document.getElementById('difficulty-filter');
    var sort = document.getElementById('sort-filter');
    if (diff) {
      diff.onchange = function () {
        state.difficulty = this.value;
        state.page = 1;
        loadCourses();
      };
    }
    if (sort) {
      sort.onchange = function () {
        state.sort = this.value;
        state.page = 1;
        sortCourses();
      };
    }
  }

  function sortCourses() {
    var sorted = state.courses.slice();
    switch (state.sort) {
      case 'popular': sorted.sort(function (a, b) { return (b.enrolledCount || 0) - (a.enrolledCount || 0); }); break;
      case 'rating': sorted.sort(function (a, b) { return (b.avgRating || 0) - (a.avgRating || 0); }); break;
      case 'price-low': sorted.sort(function (a, b) { return (a.price || 0) - (b.price || 0); }); break;
      case 'price-high': sorted.sort(function (a, b) { return (b.price || 0) - (a.price || 0); }); break;
      default: break;
    }
    state.courses = sorted;
    renderCourses();
  }

  function wireScrollToTop() {
    var fab = document.getElementById('scroll-top-btn');
    if (!fab) return;
    window.onscroll = function () {
      fab.classList.toggle('show', window.scrollY > 400);
    };
    fab.onclick = function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  function formatPrice(amount, currency) {
    var sym = currency === 'USD' ? '$' : currency === 'EUR' ? '\u20AC' : currency === 'GBP' ? '\u00A3' : (currency || '$');
    return sym + Number(amount).toFixed(2);
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
