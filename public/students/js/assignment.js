(function () {
  var assignmentId = window.location.pathname.split('/')[2];
  var data = null;
  var uploadedFiles = [];
  var isSubmitting = false;

  /* ===== Helpers ===== */
  function $(id) { return document.getElementById(id); }
  function esc(t) { var d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; }

  /* ===== Init ===== */
  document.addEventListener('components-loaded', function () {
    if (!assignmentId) { showError('Invalid assignment'); return; }
    loadAssignment();
    wireLogout();
  });

  function wireLogout() {
    var btn = $('dash-logout-btn');
    if (btn && !btn._listener) { btn._listener = true; btn.addEventListener('click', function () { localStorage.removeItem('token'); window.location.href = '/'; }); }
  }

  /* ===== Load ===== */
  function loadAssignment() {
    api.get('/assignments/' + assignmentId + '/student-view').then(function (r) {
      data = r.data;
      $('assignment-skeleton').style.display = 'none';
      $('assignment-content').style.display = 'block';
      renderAll();
    }).catch(function (err) {
      $('assignment-skeleton').style.display = 'none';
      $('assignment-error').style.display = 'block';
      $('error-message').textContent = (err && err.data && (err.data.message || err.data.error)) || 'Failed to load assignment.';
    });
  }

  function showError(msg) {
    $('assignment-skeleton').style.display = 'none';
    $('assignment-error').style.display = 'block';
    $('error-message').textContent = msg;
  }

  /* ===== Render All ===== */
  function renderAll() {
    renderBreadcrumb();
    renderHeader();
    renderInstructions();
    renderUpload();
    renderTextEditor();
    renderChecklist();
    renderIntegrity();
    renderSummary();
    renderProgress();
    renderRubric();
    renderInfo();
    renderResources();
    renderTimeline();
    renderHistory();
    renderFeedback();
    wireActions();
    startCountdown();
  }

  /* ===== Breadcrumb ===== */
  function renderBreadcrumb() {
    var c = data.course, m = data.module;
    $('assignment-breadcrumb').innerHTML = '<a href="/courses/' + esc(c ? c.id : '') + '">' + esc(c ? c.title : 'Course') + '</a>'
      + ' <span>/</span> ' + esc(m ? m.title : 'Module')
      + ' <span>/</span> <span style="color:var(--on-surface)">' + esc(data.title) + '</span>';
  }

  /* ===== Header ===== */
  function renderHeader() {
    $('assignment-title').textContent = data.title;
    $('assignment-description').textContent = data.description || '';
    $('assignment-type-badge').textContent = data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : 'Assignment';
    $('assignment-type-badge').className = 'assignment-type-badge ' + (data.type || 'essay');

    $('assignment-status-badge').textContent = formatStatus(data.submission ? data.submission.status : 'not_submitted');
    $('assignment-status-badge').className = 'assignment-status-badge ' + (data.submission ? data.submission.status : 'not_submitted');

    $('assignment-difficulty-badge').textContent = data.difficulty ? data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1) : '';
    $('assignment-difficulty-badge').className = 'assignment-difficulty-badge ' + (data.difficulty || 'intermediate');

    var meta = '';
    if (data.course) meta += esc(data.course.title);
    if (data.module) meta += ' &middot; ' + esc(data.module.title);
    if (data.instructor) meta += ' &middot; ' + esc(data.instructor.fullName);
    $('assignment-meta').innerHTML = meta;

    var stats = '';
    if (data.totalPoints) stats += '<span class="stat"><span class="mat-icon material-symbols-outlined">stars</span> ' + data.totalPoints + ' pts</span>';
    if (data.estimatedTime) stats += '<span class="stat"><span class="mat-icon material-symbols-outlined">schedule</span> ' + data.estimatedTime + ' min</span>';
    if (data.dueDate) stats += '<span class="stat"><span class="mat-icon material-symbols-outlined">event</span> Due ' + formatDate(data.dueDate) + '</span>';
    if (data.attemptsAllowed > 1) stats += '<span class="stat"><span class="mat-icon material-symbols-outlined">replay</span> ' + data.attemptsRemaining + '/' + data.attemptsAllowed + ' attempts</span>';
    $('assignment-stats-row').innerHTML = stats;
  }

  /* ===== Instructions ===== */
  function renderInstructions() {
    var content = data.instructions || data.description || 'No instructions provided.';
    $('instructions-content').innerHTML = formatContent(content);
  }

  function formatContent(text) {
    if (!text) return '';
    var html = esc(text);
    html = html.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<\/p><p>/g, '</p>\n<p>');
    return html;
  }

  /* ===== Upload ===== */
  function renderUpload() {
    var req = data.requirement;
    var formats = req && req.fileTypes && req.fileTypes.length ? req.fileTypes.join(', ').toUpperCase() : 'PDF, DOC, DOCX, ZIP, Images';
    var maxSize = req && req.maxFileSizeMb ? req.maxFileSizeMb + ' MB' : '10 MB';
    $('accepted-formats').textContent = 'Accepted: ' + formats + ' &middot; Max: ' + maxSize;

    wireUpload();
  }

  function wireUpload() {
    var zone = $('upload-zone-inner');
    var input = $('file-input');
    var browseBtn = $('browse-btn');

    browseBtn.onclick = function (e) { e.stopPropagation(); input.click(); };
    zone.parentElement.onclick = function () { input.click(); };

    input.onchange = function () { handleFiles(input.files); input.value = ''; };

    var dropZone = $('upload-area');
    dropZone.addEventListener('dragover', function (e) { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', function (e) { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
  }

  function handleFiles(files) {
    var req = data.requirement;
    var allowed = req && req.fileTypes && req.fileTypes.length ? req.fileTypes.map(function (t) { return t.toLowerCase(); }) : null;
    var maxSize = req && req.maxFileSizeMb ? req.maxFileSizeMb * 1024 * 1024 : 10 * 1024 * 1024;

    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var ext = f.name.split('.').pop().toLowerCase();
      if (allowed && allowed.indexOf(ext) === -1) { alert('File type not allowed: .' + ext); continue; }
      if (f.size > maxSize) { alert('File too large: ' + f.name); continue; }
      uploadedFiles.push(f);
    }
    renderFileList();
    updateChecklist();
    updateProgress();
  }

  function renderFileList() {
    var list = $('file-list');
    if (!uploadedFiles.length) { list.innerHTML = ''; return; }
    list.innerHTML = uploadedFiles.map(function (f, i) {
      return '<div class="file-card">'
        + '<span class="file-icon material-symbols-outlined">description</span>'
        + '<div class="file-info"><div class="file-name">' + esc(f.name) + '</div><div class="file-size">' + formatSize(f.size) + '</div></div>'
        + '<button class="file-remove-btn" data-idx="' + i + '" title="Remove file"><span class="material-symbols-outlined" style="font-size:1.25rem">close</span></button>'
        + '</div>';
    }).join('');
    list.querySelectorAll('.file-remove-btn').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(this.getAttribute('data-idx'));
        uploadedFiles.splice(idx, 1);
        renderFileList();
        updateChecklist();
        updateProgress();
      };
    });
  }

  /* ===== Text Editor ===== */
  function renderTextEditor() {
    var section = $('text-submission-section');
    if (data.submissionType === 'file') { section.style.display = 'none'; return; }
    section.style.display = 'block';
    wireEditor();
  }

  function wireEditor() {
    var editor = $('text-editor');
    var toolbar = $('editor-toolbar');

    toolbar.querySelectorAll('button').forEach(function (btn) {
      btn.onclick = function () {
        var cmd = this.getAttribute('data-cmd');
        var val = this.getAttribute('data-value');
        if (cmd === 'createLink') {
          var url = prompt('Enter URL:');
          if (url) document.execCommand(cmd, false, url);
        } else if (cmd === 'formatBlock') {
          document.execCommand(cmd, false, val);
        } else {
          document.execCommand(cmd, false, null);
        }
        editor.focus();
        updateEditorStats();
      };
    });

    editor.addEventListener('input', function () {
      updateEditorStats();
      updateChecklist();
      updateProgress();
    });
    editor.addEventListener('keyup', updateEditorStats);
  }

  function updateEditorStats() {
    var editor = $('text-editor');
    var text = editor.textContent || '';
    var html = editor.innerHTML || '';

    $('char-count').textContent = text.length + ' characters';
    var words = text.trim() ? text.trim().split(/\s+/).length : 0;
    $('word-count').textContent = words + ' words';
  }

  /* ===== Checklist ===== */
  function renderChecklist() {
    var list = $('checklist-items');
    var items = [
      { id: 'files', label: 'Required files uploaded' },
      { id: 'text', label: 'Text response completed' },
      { id: 'integrity', label: 'Academic integrity confirmed' },
    ];
    if (data.submissionType === 'file') items = items.filter(function (i) { return i.id !== 'text'; });
    if (data.submissionType === 'text') items = items.filter(function (i) { return i.id !== 'files'; });

    list.innerHTML = items.map(function (i) {
      return '<div class="checklist-item" data-check="' + i.id + '"><span class="check-icon material-symbols-outlined">circle</span>' + esc(i.label) + '</div>';
    }).join('');
  }

  function updateChecklist() {
    var hasFiles = uploadedFiles.length > 0;
    var hasText = ($('text-editor').textContent || '').trim().length > 0;
    var hasIntegrity = $('integrity-check').checked;

    setCheck('files', data.submissionType === 'text' || hasFiles);
    setCheck('text', data.submissionType === 'file' || hasText);
    setCheck('integrity', hasIntegrity);

    var allDone = true;
    document.querySelectorAll('.checklist-item').forEach(function (el) {
      if (!el.classList.contains('done')) allDone = false;
    });
    $('submit-btn').disabled = !allDone || isSubmitting;
  }

  function setCheck(id, done) {
    var el = document.querySelector('.checklist-item[data-check="' + id + '"]');
    if (!el) return;
    if (done) {
      el.classList.add('done');
      el.querySelector('.check-icon').textContent = 'check_circle';
    } else {
      el.classList.remove('done');
      el.querySelector('.check-icon').textContent = 'circle';
    }
  }

  /* ===== Integrity ===== */
  function renderIntegrity() {
    $('integrity-text').textContent = 'By submitting this assignment, you confirm that all work submitted is your own original work, and you have not plagiarized or copied from any source without proper attribution.';
    $('integrity-label').textContent = 'I confirm that this submission is my own original work.';
    $('integrity-check').onchange = function () { updateChecklist(); updateProgress(); };
  }

  /* ===== Summary Sidebar ===== */
  function renderSummary() {
    var s = data.submission;
    var html = '';
    html += row('Status', formatStatus(s ? s.status : 'not_submitted'));
    html += row('Due Date', data.dueDate ? formatDate(data.dueDate) : 'No due date');
    html += row('Points', data.totalPoints ? data.totalPoints + ' pts' : '--');
    html += row('Attempts', data.attemptsUsed + '/' + data.attemptsAllowed);
    html += row('Time', data.estimatedTime ? data.estimatedTime + ' min' : '--');
    $('summary-table').innerHTML = html;
  }

  function row(label, value) {
    return '<div class="summary-row"><span class="label">' + esc(label) + '</span><span class="value">' + value + '</span></div>';
  }

  /* ===== Progress ===== */
  function renderProgress() {
    updateProgress();
  }

  function updateProgress() {
    var total = 0, done = 0;
    var steps = [];

    steps.push({ id: 'read', label: 'Instructions reviewed', done: true });
    steps.push({ id: 'upload', label: 'Files uploaded', done: uploadedFiles.length > 0 });
    if (data.submissionType !== 'file') {
      steps.push({ id: 'text', label: 'Text completed', done: ($('text-editor').textContent || '').trim().length > 0 });
    }
    steps.push({ id: 'confirm', label: 'Integrity confirmed', done: $('integrity-check').checked });

    total = steps.length;
    done = steps.filter(function (s) { return s.done; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;

    var circumference = 263.89;
    var offset = circumference - (pct / 100) * circumference;
    var ring = $('progress-ring-fg');
    if (ring) ring.style.strokeDashoffset = offset;
    $('progress-pct').textContent = pct + '%';

    $('progress-checklist').innerHTML = steps.map(function (s) {
      return '<li class="' + (s.done ? 'done' : '') + '"><span class="pci material-symbols-outlined">' + (s.done ? 'check_circle' : 'radio_button_unchecked') + '</span>' + esc(s.label) + '</li>';
    }).join('');
  }

  /* ===== Rubric ===== */
  function renderRubric() {
    var rubric = data.rubric;
    if (!rubric || !rubric.length) { $('rubric-section').style.display = 'none'; return; }
    $('rubric-section').style.display = 'block';
    $('rubric-list').innerHTML = rubric.map(function (r) {
      return '<div class="rubric-item">'
        + '<div class="rubric-title">' + esc(r.title) + '</div>'
        + (r.description ? '<div class="rubric-desc">' + esc(r.description) + '</div>' : '')
        + '<div class="rubric-meta"><span>Weight: ' + r.weight + '</span><span>Max: ' + (r.maxScore || '--') + ' pts</span></div>'
        + '</div>';
    }).join('');
  }

  /* ===== Info ===== */
  function renderInfo() {
    var i = data;
    var html = '';
    html += infoRow('Instructor', i.instructor ? esc(i.instructor.fullName) : '--');
    html += infoRow('Course', i.course ? esc(i.course.title) : '--');
    html += infoRow('Module', i.module ? esc(i.module.title) : '--');
    html += infoRow('Duration', i.estimatedTime ? i.estimatedTime + ' min' : '--');
    html += infoRow('Difficulty', i.difficulty ? i.difficulty.charAt(0).toUpperCase() + i.difficulty.slice(1) : '--');
    html += infoRow('Submission Type', i.submissionType ? i.submissionType.charAt(0).toUpperCase() + i.submissionType.slice(1) : '--');
    if (i.lateSubmissionPolicy) html += infoRow('Late Policy', esc(i.lateSubmissionPolicy));
    $('info-table').innerHTML = html;
  }

  function infoRow(label, value) {
    return '<div class="info-row"><span class="label">' + esc(label) + '</span><span class="value">' + value + '</span></div>';
  }

  /* ===== Resources ===== */
  function renderResources() {
    var resources = data.resources;
    if (!resources || !resources.length) { $('resources-section').style.display = 'none'; return; }
    $('resources-section').style.display = 'block';
    var icons = { file: 'download', video: 'play_circle', link: 'link', documentation: 'description' };
    $('resources-list').innerHTML = resources.map(function (r) {
      var icon = icons[r.type] || 'description';
      var sizeHtml = r.fileSize ? ' <span class="r-size">(' + formatSize(r.fileSize) + ')</span>' : '';
      if (r.url) {
        return '<div class="resource-item"><span class="ri material-symbols-outlined">' + icon + '</span><a href="' + esc(r.url) + '" target="_blank">' + esc(r.title) + '</a>' + sizeHtml + '</div>';
      }
      return '<div class="resource-item"><span class="ri material-symbols-outlined">' + icon + '</span><span>' + esc(r.title) + '</span>' + sizeHtml + '</div>';
    }).join('');
  }

  /* ===== Timeline ===== */
  function renderTimeline() {
    var tl = data.timeline || [];
    $('timeline-list').innerHTML = tl.map(function (t) {
      return '<div class="timeline-item' + (t.completed ? ' done' : '') + '">'
        + '<div class="tl-event">' + esc(t.event) + '</div>'
        + (t.date ? '<div class="tl-date">' + formatDate(t.date) + '</div>' : '')
        + '</div>';
    }).join('');
  }

  /* ===== History ===== */
  function renderHistory() {
    var attempts = data.previousAttempts;
    if (!attempts || !attempts.length) { $('history-section').style.display = 'none'; return; }
    $('history-section').style.display = 'block';
    $('history-list').innerHTML = attempts.map(function (a, i) {
      var scoreHtml = a.score !== null ? '<div class="hi-score">' + a.score + '</div>' : '<div class="hi-score" style="color:var(--on-surface-variant)">--</div>';
      return '<div class="history-item">'
        + scoreHtml
        + '<div class="hi-info"><div class="hi-status">Attempt ' + (i + 2) + ' &middot; ' + formatStatus(a.status) + '</div>'
        + '<div class="hi-date">' + formatDate(a.createdAt) + '</div></div>'
        + '<a href="' + esc(a.fileUrl) + '" class="hi-download" download>Download</a>'
        + '</div>';
    }).join('');
  }

  /* ===== Feedback ===== */
  function renderFeedback() {
    var s = data.submission;
    if (!s || s.status !== 'graded') { $('feedback-section').style.display = 'none'; return; }
    $('feedback-section').style.display = 'block';

    var html = '';
    if (s.score !== null) html += '<div class="feedback-score">' + s.score + '/' + (data.totalPoints || '--') + '</div>';
    if (s.feedback) html += '<div class="feedback-comment">' + esc(s.feedback) + '</div>';
    if (s.rubricRating) html += '<div class="feedback-rubric"><span class="badge" style="background:var(--primary-fixed);color:var(--on-primary-fixed)">' + esc(s.rubricRating) + '</span></div>';
    $('feedback-content').innerHTML = html || '<p class="text-sm" style="color:var(--on-surface-variant)">No detailed feedback available.</p>';
  }

  /* ===== Countdown ===== */
  var countdownInterval;

  function startCountdown() {
    if (!data.dueDate) { $('countdown-value').textContent = 'No deadline'; return; }
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  function updateCountdown() {
    var due = new Date(data.dueDate).getTime();
    var now = Date.now();
    var diff = due - now;
    var el = $('countdown-value');

    if (diff <= 0) { el.textContent = 'Past due'; el.className = 'countdown-value past'; return; }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    var text = '';
    if (days > 0) text += days + 'd ';
    text += hours + 'h ' + mins + 'm';
    el.textContent = text;
    el.className = 'countdown-value' + (days < 1 ? ' urgent' : '');
  }

  /* ===== Actions ===== */
  function wireActions() {
    $('save-draft-btn').onclick = function () { saveDraft(); };
    $('submit-btn').onclick = function () { submitAssignment(); };
    $('cancel-btn').onclick = function () { if (confirm('Discard changes?')) window.history.back(); };
  }

  function saveDraft() {
    // For now, saving draft locally
    var text = $('text-editor').innerHTML || '';
    try { localStorage.setItem('assignment_draft_' + assignmentId, text); $('auto-save-indicator').textContent = 'Draft saved'; } catch (e) {}
    setTimeout(function () { $('auto-save-indicator').textContent = ''; }, 2000);
  }

  function submitAssignment() {
    if (isSubmitting) return;
    isSubmitting = true;
    $('submit-btn').textContent = 'Submitting...';
    $('submit-btn').disabled = true;

    var formData = new FormData();
    if (uploadedFiles.length) {
      uploadedFiles.forEach(function (f) { formData.append('file', f); });
    }
    var text = $('text-editor').innerHTML || '';
    if (text.trim()) formData.append('submissionNotes', text);

    api.post('/assignments/' + assignmentId + '/submit-upload', formData).then(function (res) {
      $('submit-btn').textContent = 'Submitted';
      alert('Assignment submitted successfully!');
      loadAssignment();
    }).catch(function (err) {
      var msg = (err && err.data && (err.data.message || err.data.error)) || 'Submission failed. Please try again.';
      alert(msg);
      $('submit-btn').textContent = 'Submit Assignment';
      $('submit-btn').disabled = false;
      isSubmitting = false;
    });
  }

  /* ===== Formatters ===== */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return dateStr; }
  }

  function formatSize(bytes) {
    if (!bytes) return '';
    bytes = Number(bytes);
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function formatStatus(status) {
    var map = { submitted: 'Submitted', graded: 'Graded', not_submitted: 'Not Submitted', draft: 'Draft', needs_changes: 'Needs Changes' };
    return map[status] || status || 'Unknown';
  }

  /* ===== Auto-save ===== */
  setInterval(function () {
    var editor = $('text-editor');
    if (editor && editor.innerHTML.trim()) {
      try { localStorage.setItem('assignment_draft_' + assignmentId, editor.innerHTML); $('auto-save-indicator').textContent = 'Auto-saved'; } catch (e) {}
      setTimeout(function () { if ($('auto-save-indicator')) $('auto-save-indicator').textContent = ''; }, 2000);
    }
  }, 30000);

  window.addEventListener('beforeunload', function (e) {
    var editor = $('text-editor');
    if (editor && editor.innerHTML.trim()) {
      try { localStorage.setItem('assignment_draft_' + assignmentId, editor.innerHTML); } catch (ex) {}
    }
  });
})();