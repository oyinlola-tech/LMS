(function () {
  'use strict';

  var assignmentId = null;
  var submissionId = null;

  function init() {
    if (!document.getElementById('review-content')) return;
    assignmentId = extractAssignmentId();
    submissionId = extractSubmissionId();
    if (!assignmentId) { showError(); return; }
    loadReview();
  }

  function extractAssignmentId() {
    var m = window.location.pathname.match(/\/tutor\/assignments\/([a-f0-9-]+)\/review/i);
    return m ? m[1] : null;
  }

  function extractSubmissionId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('submissionId') || null;
  }

  function loadReview() {
    var path = submissionId
      ? '/assignments/' + assignmentId + '/submissions/' + submissionId
      : '/assignments/' + assignmentId + '/submissions/me';

    api.get(path).then(function (r) {
      var data = r.data;
      if (!data) { showError(); return; }
      renderReview(data);
    }).catch(function () { showError(); });
  }

  function renderReview(data) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('review-content').style.display = '';

    var breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb) {
      breadcrumb.innerHTML = '<a href="/tutor/assignments">Assignments</a>' +
        ' <span class="material-symbols-outlined" style="font-size:0.75rem;vertical-align:middle">chevron_right</span> ' +
        '<a href="/tutor/assignments/' + assignmentId + '/details">Details</a>' +
        ' <span class="material-symbols-outlined" style="font-size:0.75rem;vertical-align:middle">chevron_right</span> Review';
    }

    renderGrade(data);
    renderRubric(data);
    renderFiles(data);
    renderFeedback(data);
    renderTimeline(data);
    renderResubmit(data);
  }

  function renderGrade(data) {
    var card = document.getElementById('grade-card');
    var display = document.getElementById('grade-display');
    if (!card || !display) return;

    if (data.score == null && data.status !== 'graded') {
      card.style.display = 'none';
      return;
    }

    card.style.display = '';
    var score = data.score || 0;
    var total = data.totalPoints || data.maxScore || 100;
    var pct = total > 0 ? Math.round((score / total) * 100) : 0;
    var passed = pct >= 50;
    var gradeClass = passed ? 'grade-passed' : 'grade-failed';

    display.innerHTML =
      '<div class="grade-score ' + gradeClass + '">' + score + '/' + total + '</div>' +
      '<div class="grade-label">' + pct + '% - ' + (passed ? 'Passed' : 'Needs Improvement') + '</div>' +
      '<div class="grade-label" style="margin-top:0.5rem">Status: ' + capitalize(data.status || 'submitted') + '</div>';
  }

  function renderRubric(data) {
    var table = document.getElementById('rubric-table');
    if (!table) return;
    var rubric = data.rubricBreakdown || data.rubric || [];
    if (!rubric.length) {
      document.getElementById('rubric-card').style.display = 'none';
      return;
    }
    document.getElementById('rubric-card').style.display = '';
    var html = '<thead><tr><th>Criterion</th><th>Score</th><th>Max</th><th>Comment</th></tr></thead><tbody>';
    rubric.forEach(function (r) {
      html += '<tr><td><strong>' + escHtml(r.title || r.criterion) + '</strong></td>' +
        '<td>' + (r.score != null ? r.score : '-') + '</td>' +
        '<td>' + (r.maxScore || r.max || '-') + '</td>' +
        '<td style="color:var(--on-surface-variant)">' + escHtml(r.comment || '') + '</td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }

  function renderFiles(data) {
    var container = document.getElementById('submitted-files');
    if (!container) return;
    var files = data.files || [];
    if (!files.length) {
      container.innerHTML = '<div class="text-sm" style="color:var(--on-surface-variant);padding:1rem 0;text-align:center">No files submitted.</div>';
      return;
    }
    container.innerHTML = files.map(function (f) {
      var icon = f.type && f.type.includes('pdf') ? 'picture_as_pdf' : f.type && f.type.includes('image') ? 'image' : 'description';
      return '<div class="submitted-file">' +
        '<span class="material-symbols-outlined">' + icon + '</span>' +
        '<span class="file-name">' + escHtml(f.name || f.fileName || 'File') + '</span>' +
        (f.url ? '<a href="' + f.url + '" target="_blank" class="file-download"><span class="material-symbols-outlined">download</span></a>' : '') +
      '</div>';
    }).join('');
  }

  function renderFeedback(data) {
    var card = document.getElementById('feedback-card');
    var content = document.getElementById('feedback-content');
    if (!card || !content) return;

    if (!data.feedback) {
      card.style.display = 'none';
      return;
    }
    card.style.display = '';
    var fb = data.feedback;
    content.innerHTML =
      (fb.instructorName ? '<div class="feedback-author">' + escHtml(fb.instructorName) + '</div>' : '') +
      '<div>' + escHtml(fb.comment || fb.text || '') + '</div>' +
      (fb.createdAt ? '<div class="feedback-date">' + formatDate(fb.createdAt) + '</div>' : '');
  }

  function renderTimeline(data) {
    var container = document.getElementById('timeline');
    if (!container) return;
    var events = data.timeline || [];
    if (!events.length) {
      events = [{ date: data.submittedAt || data.createdAt, event: 'Submitted' }];
      if (data.gradedAt) events.push({ date: data.gradedAt, event: 'Graded' });
      if (data.resubmittedAt) events.push({ date: data.resubmittedAt, event: 'Resubmitted' });
    }
    if (!events.length) {
      container.innerHTML = '<div class="text-sm" style="color:var(--on-surface-variant)">No timeline data.</div>';
      return;
    }
    container.innerHTML = events.map(function (e) {
      return '<div class="timeline-item">' +
        '<span class="timeline-date">' + formatDate(e.date) + '</span>' +
        '<span class="timeline-event">' + escHtml(e.event || e.status || 'Update') + '</span>' +
      '</div>';
    }).join('');
  }

  function renderResubmit(data) {
    var card = document.getElementById('resubmit-card');
    var btn = document.getElementById('resubmit-btn');
    if (!card || !btn) return;
    if (data.canResubmit || (data.status !== 'graded' && data.status !== 'submitted')) {
      card.style.display = '';
      btn.onclick = function () {
        window.location.href = '/tutor/assignments/' + assignmentId + '/submission';
      };
    }
  }

  function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = '';
  }

  function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
