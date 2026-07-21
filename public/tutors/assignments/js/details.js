(function () {
  'use strict';

  var assignmentId = null;

  function init() {
    if (!document.getElementById('details-content')) return;
    assignmentId = extractId();
    if (!assignmentId) { showError(); return; }
    loadAssignment();
    wireButtons();
  }

  function extractId() {
    var m = window.location.pathname.match(/\/tutor\/assignments\/([a-f0-9-]+)\/details/i);
    return m ? m[1] : null;
  }

  function loadAssignment() {
    api.get('/tutor/assignments/' + assignmentId + '/edit').then(function (r) {
      var data = r.data;
      if (!data) { showError(); return; }
      renderAssignment(data);
    }).catch(function () {
      showError();
    });
  }

  function renderAssignment(a) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('details-content').style.display = '';

    document.title = 'LearnBridge - ' + a.title;

    // Breadcrumb
    renderBreadcrumb(a);

    // Badges
    renderBadges(a);

    // Title & description
    document.getElementById('assignment-title').textContent = a.title;
    document.getElementById('assignment-desc').textContent = a.description || '';

    // Overview meta
    renderMeta(a);

    // Instructions
    renderInstructions(a);

    // Deliverables
    renderDeliverables(a);

    // Rubric
    renderRubric(a);

    // Resources
    renderResources(a);

    // Sidebar info
    renderInfo(a);

    // Submission info
    renderSubmissionInfo(a);

    // File types
    renderFileTypes(a);
  }

  function renderBreadcrumb(a) {
    var el = document.getElementById('breadcrumb');
    if (!el) return;
    var html = '<a href="/tutor/assignments">Assignments</a>';
    if (a.course) html += ' <span class="material-symbols-outlined" style="font-size:0.75rem;vertical-align:middle">chevron_right</span> <a href="#">' + escHtml(a.course.title) + '</a>';
    html += ' <span class="material-symbols-outlined" style="font-size:0.75rem;vertical-align:middle">chevron_right</span> <span>' + escHtml(a.title) + '</span>';
    el.innerHTML = html;
  }

  function renderBadges(a) {
    var el = document.getElementById('badge-row');
    if (!el) return;
    el.innerHTML =
      '<span class="badge type">' + capitalize(a.type || 'essay') + '</span>' +
      '<span class="badge difficulty ' + (a.difficulty || 'intermediate') + '">' + capitalize(a.difficulty || 'intermediate') + '</span>' +
      '<span class="badge status ' + (a.status || 'draft') + '">' + (a.status || 'draft') + '</span>';
  }

  function renderMeta(a) {
    var el = document.getElementById('overview-meta');
    if (!el) return;
    var html = '';
    if (a.totalPoints != null) {
      html += '<div class="meta-item"><span class="material-symbols-outlined">fact_check</span>Points: <strong>' + a.totalPoints + '</strong></div>';
    }
    if (a.dueDate) {
      html += '<div class="meta-item"><span class="material-symbols-outlined">event</span>Due: <strong>' + formatDate(a.dueDate) + '</strong></div>';
    }
    if (a.estimatedTime) {
      html += '<div class="meta-item"><span class="material-symbols-outlined">timer</span>Est. time: <strong>' + a.estimatedTime + ' min</strong></div>';
    }
    if (a.attemptsAllowed != null) {
      html += '<div class="meta-item"><span class="material-symbols-outlined">replay</span>Attempts: <strong>' + a.attemptsAllowed + '</strong></div>';
    }
    if (a.submissionType) {
      html += '<div class="meta-item"><span class="material-symbols-outlined">upload_file</span>Type: <strong>' + capitalize(a.submissionType) + '</strong></div>';
    }
    if (a.module) {
      html += '<div class="meta-item"><span class="material-symbols-outlined">folder</span>Module: <strong>' + escHtml(a.module.title) + '</strong></div>';
    }
    el.innerHTML = html;
  }

  function renderInstructions(a) {
    var el = document.getElementById('instructions-body');
    if (!el) return;
    var content = a.instructions || a.description || '';
    if (!content) {
      document.getElementById('instructions-section').style.display = 'none';
      return;
    }
    el.innerHTML = content.replace(/\n/g, '<br>');
    if (a.proTip) {
      el.innerHTML += '<div class="pro-tip" style="margin-top:1rem;padding:0.75rem;background:var(--primary-fixed);border-radius:0.5rem;font-size:0.8125rem"><strong>Pro Tip:</strong> ' + escHtml(a.proTip) + '</div>';
    }
  }

  function renderDeliverables(a) {
    var el = document.getElementById('deliverables-list');
    if (!el) return;
    var deliverables = [];
    if (a.keyDeliverables && Array.isArray(a.keyDeliverables)) {
      deliverables = a.keyDeliverables;
    } else if (a.keyDeliverables && typeof a.keyDeliverables === 'string') {
      try { deliverables = JSON.parse(a.keyDeliverables); } catch (_) { deliverables = [a.keyDeliverables]; }
    }
    if (!deliverables.length) {
      document.getElementById('deliverables-section').style.display = 'none';
      return;
    }
    el.innerHTML = deliverables.map(function (d) {
      return '<li><span class="material-symbols-outlined">check_circle</span><span>' + escHtml(d) + '</span></li>';
    }).join('');
  }

  function renderRubric(a) {
    var el = document.getElementById('rubric-table');
    if (!el) return;
    var criteria = a.rubricCriteria || [];
    if (!criteria.length) {
      document.getElementById('rubric-section').style.display = 'none';
      return;
    }
    document.getElementById('rubric-section').style.display = '';
    var html = '<thead><tr><th>Criterion</th><th>Description</th><th>Max Score</th></tr></thead><tbody>';
    var total = 0;
    criteria.forEach(function (c) {
      html += '<tr><td><strong>' + escHtml(c.title) + '</strong></td><td style="color:var(--on-surface-variant)">' + escHtml(c.description || '') + '</td><td>' + c.maxScore + '</td></tr>';
      total += c.maxScore || 0;
    });
    html += '</tbody>';
    el.innerHTML = html;
    document.getElementById('rubric-total').textContent = total;
  }

  function renderResources(a) {
    var el = document.getElementById('resources-list');
    if (!el) return;
    var resources = a.resources || [];
    if (!resources.length) {
      el.innerHTML = '<div class="empty-list">No resources attached.</div>';
      return;
    }
    el.innerHTML = resources.map(function (r) {
      var icon = r.type === 'pdf' ? 'picture_as_pdf' : r.type === 'video' ? 'videocam' : r.type === 'link' ? 'link' : 'description';
      return '<div class="resource-item">' +
        '<span class="material-symbols-outlined">' + icon + '</span>' +
        '<span class="resource-name">' + escHtml(r.title) + '</span>' +
        (r.description ? '<span class="resource-desc">' + escHtml(r.description) + '</span>' : '') +
        (r.url ? '<a href="' + escAttr(r.url) + '" target="_blank" class="resource-link">Open</a>' : '') +
      '</div>';
    }).join('');
  }

  function renderInfo(a) {
    var el = document.getElementById('info-rows');
    if (!el) return;
    var html = '';
    html += '<div class="info-row"><span class="info-label">Status</span><span class="info-value">' + capitalize(a.status || 'draft') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">Course</span><span class="info-value">' + (a.course ? escHtml(a.course.title) : '-') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">Type</span><span class="info-value">' + capitalize(a.type || 'essay') + '</span></div>';
    html += '<div class="info-row"><span class="info-label">Difficulty</span><span class="info-value">' + capitalize(a.difficulty || 'intermediate') + '</span></div>';

    if (a.dueDate) {
      var due = new Date(a.dueDate);
      var now = new Date();
      var daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      var cls = daysLeft <= 3 ? 'due-soon' : daysLeft <= 14 ? 'due-later' : '';
      html += '<div class="info-row"><span class="info-label">Due Date</span><span class="info-value ' + cls + '">' + formatDate(a.dueDate) + '</span></div>';
    }

    el.innerHTML = html;
  }

  function renderSubmissionInfo(a) {
    var el = document.getElementById('submission-info-rows');
    if (!el) return;
    if (!a.submissionType) { document.getElementById('submission-info').style.display = 'none'; return; }
    document.getElementById('submission-info').style.display = '';
    var html = '';
    html += '<div class="info-row"><span class="info-label">Submission Type</span><span class="info-value">' + capitalize(a.submissionType) + '</span></div>';
    html += '<div class="info-row"><span class="info-label">Attempts</span><span class="info-value">' + (a.attemptsAllowed || 1) + '</span></div>';
    if (a.lateSubmissionPolicy) {
      html += '<div class="info-row"><span class="info-label">Late Policy</span><span class="info-value">' + escHtml(a.lateSubmissionPolicy) + '</span></div>';
    }
    el.innerHTML = html;
  }

  function renderFileTypes(a) {
    var typesEl = document.getElementById('file-types');
    var sizeEl = document.getElementById('max-size');
    if (!typesEl) return;
    var req = a.requirement;
    if (!req || (!req.fileTypes && !req.maxFileSizeMb)) {
      document.getElementById('files-card').style.display = 'none';
      return;
    }
    document.getElementById('files-card').style.display = '';

    var types = req.fileTypes;
    if (types && Array.isArray(types)) {
      typesEl.innerHTML = types.map(function (t) { return '<span class="file-type-badge">' + escHtml(t) + '</span>'; }).join('');
    } else {
      typesEl.innerHTML = '<span class="text-sm" style="color:var(--on-surface-variant)">Any format</span>';
    }
    if (req.maxFileSizeMb) {
      sizeEl.textContent = 'Max size: ' + req.maxFileSizeMb + ' MB';
    }
  }

  function wireButtons() {
    var editBtn = document.getElementById('edit-btn');
    if (editBtn) editBtn.onclick = function () {
      window.location.href = '/tutor/assignments/builder/' + assignmentId;
    };

    var previewBtn = document.getElementById('preview-btn');
    if (previewBtn) previewBtn.onclick = function () {
      window.open('/assignments/' + assignmentId + '/student', '_blank');
    };
  }

  function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = '';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
