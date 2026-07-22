(function () {
  'use strict';

  var state = {
    assignments: [],
    search: '',
    status: '',
    type: '',
    difficulty: '',
  };

  function init() {
    if (!document.getElementById('assignments-grid')) return;
    loadAssignments();
    wireSearch();
    wireFilters();
  }

  function loadAssignments() {
    document.getElementById('loading-state').style.display = '';
    document.getElementById('empty-state').style.display = 'none';

    api.get('/tutor/assignments/list').then(function (r) {
      var data = r.data || [];
      state.assignments = data;
      applyFilters();
    }).catch(function () {
      document.getElementById('loading-state').style.display = 'none';
      document.getElementById('assignments-grid').innerHTML =
        '<div class="empty-state"><span class="material-symbols-outlined" style="font-size:4rem;color:var(--error);margin-bottom:1rem">error</span>' +
        '<h3>Failed to load assignments</h3><p style="color:var(--on-surface-variant)">Please try again later.</p></div>';
    });
  }

  function applyFilters() {
    var filtered = state.assignments.filter(function (a) {
      if (state.search && !a.title.toLowerCase().includes(state.search.toLowerCase())) return false;
      if (state.status && a.status !== state.status) return false;
      if (state.type && a.type !== state.type) return false;
      if (state.difficulty && a.difficulty !== state.difficulty) return false;
      return true;
    });

    renderAssignments(filtered);
    updateSubtitle(filtered.length);
  }

  function renderAssignments(assignments) {
    document.getElementById('loading-state').style.display = 'none';
    var grid = document.getElementById('assignments-grid');
    var empty = document.getElementById('empty-state');

    if (!assignments.length) {
      while (grid.firstChild) grid.removeChild(grid.firstChild);
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    while (grid.firstChild) grid.removeChild(grid.firstChild);

    var fragment = document.createDocumentFragment();
    assignments.forEach(function (a) {
      var card = buildCardElement(a);
      fragment.appendChild(card);
    });
    grid.appendChild(fragment);

    Array.from(grid.children).forEach(function (card) {
      card.onclick = function (e) {
        if (e.target.closest('.card-action-btn') || e.target.closest('.menu-btn')) return;
        window.location.href = '/tutor/assignments/' + card.dataset.id + '/details';
      };
    });

    Array.from(grid.querySelectorAll('[data-action="edit"]')).forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        window.location.href = '/tutor/assignments/builder/' + btn.dataset.id;
      };
    });

    Array.from(grid.querySelectorAll('[data-action="preview"]')).forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        window.open('/assignments/' + btn.dataset.id + '/student', '_blank');
      };
    });
  }

  function buildCardElement(a) {
    var now = new Date();
    var due = a.dueDate ? new Date(a.dueDate) : null;
    var daysLeft = due ? Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    var dueClass = daysLeft != null ? (daysLeft <= 0 ? 'due-overdue' : daysLeft <= 3 ? 'due-warning' : 'due-safe') : '';
    var dueText = daysLeft != null ? (daysLeft <= 0 ? 'Overdue' : daysLeft + ' day' + (daysLeft > 1 ? 's' : '') + ' left') : 'No due date';

    var card = document.createElement('div');
    card.className = 'assignment-card';
    card.setAttribute('data-id', String(a.id));

    var top = document.createElement('div');
    top.className = 'assignment-card-top';
    var badges = document.createElement('div');
    badges.className = 'assignment-card-badges';

    var typeBadge = document.createElement('span');
    typeBadge.className = 'badge badge-type';
    typeBadge.textContent = capitalize(a.type || 'essay');
    badges.appendChild(typeBadge);

    var diffBadge = document.createElement('span');
    diffBadge.className = 'badge badge-difficulty ' + escHtml(a.difficulty || 'intermediate');
    diffBadge.textContent = capitalize(a.difficulty || 'intermediate');
    badges.appendChild(diffBadge);

    var statusBadge = document.createElement('span');
    statusBadge.className = 'badge badge-status ' + escHtml(a.status || 'draft');
    statusBadge.textContent = a.status || 'draft';
    badges.appendChild(statusBadge);
    top.appendChild(badges);
    card.appendChild(top);

    var title = document.createElement('h3');
    title.className = 'assignment-card-title';
    title.textContent = a.title || '';
    card.appendChild(title);

    if (a.course) {
      var courseDiv = document.createElement('div');
      courseDiv.className = 'assignment-card-course';
      courseDiv.textContent = a.course.title || '';
      card.appendChild(courseDiv);
    }

    var meta = document.createElement('div');
    meta.className = 'assignment-card-meta';
    if (a.totalPoints != null) {
      var pts = document.createElement('span');
      pts.innerHTML = '<span class="material-symbols-outlined">fact_check</span> ' + escHtml(String(a.totalPoints)) + ' pts';
      meta.appendChild(pts);
    }
    if (a.module) {
      var mod = document.createElement('span');
      mod.innerHTML = '<span class="material-symbols-outlined">folder</span> ' + escHtml(a.module.title);
      meta.appendChild(mod);
    }
    var dueSpan = document.createElement('span');
    dueSpan.className = dueClass;
    dueSpan.innerHTML = '<span class="material-symbols-outlined">event</span> ' + dueText;
    meta.appendChild(dueSpan);
    card.appendChild(meta);

    var footer = document.createElement('div');
    footer.className = 'assignment-card-footer';
    var footerLeft = document.createElement('div');
    footerLeft.className = 'card-footer-left';
    var subCount = document.createElement('span');
    subCount.className = 'submission-count';
    subCount.textContent = (a.submissionCount || 0) + ' submission' + ((a.submissionCount || 0) !== 1 ? 's' : '');
    footerLeft.appendChild(subCount);
    footer.appendChild(footerLeft);

    var footerRight = document.createElement('div');
    footerRight.className = 'card-footer-right';
    var editBtn = document.createElement('button');
    editBtn.className = 'card-action-btn';
    editBtn.setAttribute('data-action', 'edit');
    editBtn.setAttribute('data-id', String(a.id));
    editBtn.innerHTML = '<span class="material-symbols-outlined">edit</span> Edit';
    footerRight.appendChild(editBtn);

    var previewBtn = document.createElement('button');
    previewBtn.className = 'card-action-btn primary';
    previewBtn.setAttribute('data-action', 'preview');
    previewBtn.setAttribute('data-id', String(a.id));
    previewBtn.innerHTML = '<span class="material-symbols-outlined">visibility</span> Preview';
    footerRight.appendChild(previewBtn);
    footer.appendChild(footerRight);
    card.appendChild(footer);

    return card;
  }

  function renderCard(a) {
    var now = new Date();
    var due = a.dueDate ? new Date(a.dueDate) : null;
    var daysLeft = due ? Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    var dueClass = daysLeft != null ? (daysLeft <= 0 ? 'due-overdue' : daysLeft <= 3 ? 'due-warning' : 'due-safe') : '';
    var dueText = daysLeft != null ? (daysLeft <= 0 ? 'Overdue' : daysLeft + ' day' + (daysLeft > 1 ? 's' : '') + ' left') : 'No due date';

    var status = escHtml(a.status || 'draft');
    var statusHtml = '<span class="badge badge-status ' + status + '">' + status + '</span>';

    return '<div class="assignment-card" data-id="' + escHtml(a.id) + '">' +
      '<div class="assignment-card-top">' +
        '<div class="assignment-card-badges">' +
          '<span class="badge badge-type">' + escHtml(capitalize(a.type || 'essay')) + '</span>' +
          '<span class="badge badge-difficulty ' + escHtml(a.difficulty || 'intermediate') + '">' + escHtml(capitalize(a.difficulty || 'intermediate')) + '</span>' +
          statusHtml +
        '</div>' +
      '</div>' +
      '<h3 class="assignment-card-title">' + escHtml(a.title) + '</h3>' +
      (a.course ? '<div class="assignment-card-course">' + escHtml(a.course.title) + '</div>' : '') +
      '<div class="assignment-card-meta">' +
        (a.totalPoints != null ? '<span><span class="material-symbols-outlined">fact_check</span>' + escHtml(String(a.totalPoints)) + ' pts</span>' : '') +
        (a.module ? '<span><span class="material-symbols-outlined">folder</span>' + escHtml(a.module.title) + '</span>' : '') +
        '<span class="' + dueClass + '"><span class="material-symbols-outlined">event</span>' + dueText + '</span>' +
      '</div>' +
      '<div class="assignment-card-footer">' +
        '<div class="card-footer-left">' +
          '<span class="submission-count">' + (a.submissionCount || 0) + ' submission' + ((a.submissionCount || 0) !== 1 ? 's' : '') + '</span>' +
        '</div>' +
        '<div class="card-footer-right">' +
          '<button class="card-action-btn" data-action="edit" data-id="' + escHtml(a.id) + '"><span class="material-symbols-outlined">edit</span> Edit</button>' +
          '<button class="card-action-btn primary" data-action="preview" data-id="' + escHtml(a.id) + '"><span class="material-symbols-outlined">visibility</span> Preview</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function updateSubtitle(count) {
    var el = document.getElementById('list-subtitle');
    if (el) el.textContent = count + ' assignment' + (count !== 1 ? 's' : '');
  }

  function wireSearch() {
    var input = document.getElementById('search-input');
    if (!input) return;
    var timer;
    input.oninput = function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.search = input.value.trim();
        applyFilters();
      }, 300);
    };
  }

  function wireFilters() {
    ['status-filter', 'type-filter', 'difficulty-filter'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.onchange = function () {
        var key = id.split('-')[0];
        state[key] = this.value;
        applyFilters();
      };
    });
  }

  function escHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('components-loaded', init);
})();
