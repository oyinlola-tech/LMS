(function () {
  'use strict';

  /* ===== State ===== */
  var state = {
    assignmentId: null,
    isNew: true,
    currentStep: 1,
    data: {
      title: 'Untitled Assignment',
      description: '',
      instructions: '',
      type: 'essay',
      difficulty: 'intermediate',
      totalPoints: 100,
      estimatedTime: 60,
      attemptsAllowed: 1,
      submissionType: 'file',
      dueDate: '',
      lateSubmissionPolicy: '',
      coreObjective: '',
      proTip: '',
      keyDeliverables: [],
      downloadAssetsUrl: '',
      moduleNumber: 0,
      CourseId: '',
      moduleId: '',
      fileTypes: ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg', 'mp4', 'csv', 'txt', 'py', 'js', 'html'],
      maxFileSizeMb: 10,
      requirementsNotes: '',
      resources: [],
    },
    dirty: false,
    saving: false,
    courses: [],
    modules: [],
    lastSaved: null,
  };

  /* ===== DOM Refs ===== */
  var $ = function (id) { return document.getElementById(id); };

  /* ===== Init ===== */
  function init() {
    var pathParts = window.location.pathname.split('/');
    state.assignmentId = pathParts[5]; // /tutor/assignments/builder/:id
    var stepMatch = window.location.pathname.match(/\/step\/(\d+)/);
    state.currentStep = stepMatch ? parseInt(stepMatch[1], 10) : 1;

    loadCourses().then(function () {
      if (state.assignmentId && state.assignmentId !== 'new') {
        state.isNew = false;
        return loadAssignment(state.assignmentId);
      }
    }).then(function () {
      renderStep(state.currentStep);
      renderSidebar();
      renderAssignmentTitle();
      updateStepIndicator();
      updateProgress();
      updateButtons();
      wireEvents();
      setupDropzone();
    });
  }

  /* ===== API Calls ===== */
  function loadCourses() {
    return api.get('/tutor/assignments/courses').then(function (r) {
      state.courses = r.data || [];
      populateCourses();
      return state.courses;
    }).catch(function () {});
  }

  function loadModules(courseId) {
    if (!courseId) { state.modules = []; populateModules(); return; }
    return api.get('/tutor/assignments/courses/' + courseId + '/modules').then(function (r) {
      state.modules = r.data || [];
      populateModules();
    }).catch(function () { state.modules = []; populateModules(); });
  }

  function loadAssignment(id) {
    return api.get('/tutor/assignments/' + id + '/edit').then(function (r) {
      var d = r.data || {};
      state.data.title = d.title || 'Untitled Assignment';
      state.data.description = d.description || '';
      state.data.instructions = d.instructions || '';
      state.data.type = d.type || 'essay';
      state.data.difficulty = d.difficulty || 'intermediate';
      state.data.totalPoints = d.totalPoints || 100;
      state.data.estimatedTime = d.estimatedTime || 60;
      state.data.attemptsAllowed = d.attemptsAllowed || 1;
      state.data.submissionType = d.submissionType || 'file';
      state.data.dueDate = d.dueDate ? d.dueDate.substring(0, 16) : '';
      state.data.lateSubmissionPolicy = d.lateSubmissionPolicy || '';
      state.data.coreObjective = d.coreObjective || '';
      state.data.proTip = d.proTip || '';
      state.data.keyDeliverables = d.keyDeliverables || [];
      state.data.CourseId = d.CourseId || '';
      state.data.moduleId = d.moduleId || '';
      state.data.fileTypes = (d.requirement && d.requirement.fileTypes) || ['pdf','doc','docx','zip','png','jpg','jpeg','mp4','csv','txt','py','js','html'];
      state.data.maxFileSizeMb = (d.requirement && d.requirement.maxFileSizeMb) || 10;
      state.data.requirementsNotes = (d.requirement && d.requirement.notes) || '';
      state.data.resources = d.resources || [];
      state.lastSaved = new Date();
      if (d.course) { $('f-course').value = d.course.id; loadModules(d.course.id); }
      if (d.module) { setTimeout(function () { $('f-module').value = d.module.id; }, 100); }
      var badge = $('builder-status-badge');
      if (badge) {
        badge.textContent = d.status || 'draft';
        badge.className = 'builder-status-badge ' + (d.status === 'published' ? 'published' : 'draft');
      }
      return d;
    }).catch(function () {});
  }

  function saveDraftToServer() {
    if (state.saving || state.isNew) return Promise.resolve();
    state.saving = true;
    updateDraftIndicator('Saving...', '#f59e0b');
    return api.put('/tutor/assignments/' + state.assignmentId + '/save-draft', {
      details: collectStep1Data(),
      submissionConfig: collectStep2Data(),
    }).then(function () {
      state.lastSaved = new Date();
      state.dirty = false;
      updateDraftIndicator('Saved', '#059669');
      state.saving = false;
    }).catch(function () {
      updateDraftIndicator('Save failed', '#dc2626');
      state.saving = false;
    });
  }

  function createAssignment() {
    var data = collectStep1Data();
    if (!data.title || data.title === 'Untitled Assignment') data.title = 'Untitled Assignment';
    return api.post('/tutor/assignments/create', data).then(function (r) {
      state.assignmentId = r.data.id;
      state.isNew = false;
      var newUrl = '/tutor/assignments/builder/' + state.assignmentId + '/step/' + state.currentStep;
      window.history.replaceState(null, '', newUrl);
      updateDraftIndicator('Saved', '#059669');
      state.lastSaved = new Date();
      state.dirty = false;
      return r;
    });
  }

  /* ===== Collect Form Data ===== */
  function collectStep1Data() {
    var deliverables = [];
    document.querySelectorAll('.deliverable-item input').forEach(function (inp) {
      if (inp.value.trim()) deliverables.push(inp.value.trim());
    });
    return {
      title: $('f-title') ? $('f-title').value.trim() : state.data.title,
      description: $('editor-description') ? $('editor-description').innerHTML : '',
      instructions: $('editor-instructions') ? $('editor-instructions').innerHTML : '',
      type: $('f-type') ? $('f-type').value : 'essay',
      difficulty: $('f-difficulty') ? $('f-difficulty').value : 'intermediate',
      totalPoints: parseInt($('f-total-points') ? $('f-total-points').value : 100) || 100,
      estimatedTime: parseInt($('f-estimated-time') ? $('f-estimated-time').value : 60) || null,
      attemptsAllowed: parseInt($('f-attempts') ? $('f-attempts').value : 1) || 1,
      dueDate: $('f-due-date') ? $('f-due-date').value || null : null,
      lateSubmissionPolicy: $('f-late-policy') ? $('f-late-policy').value : '',
      coreObjective: $('f-core-objective') ? $('f-core-objective').value.trim() : '',
      proTip: $('f-pro-tip') ? $('f-pro-tip').value.trim() : '',
      keyDeliverables: deliverables.length ? deliverables : null,
      CourseId: $('f-course') ? $('f-course').value : '',
      moduleId: $('f-module') ? $('f-module').value : '',
    };
  }

  function collectStep2Data() {
    var fileTypes = [];
    document.querySelectorAll('#file-type-grid input:checked').forEach(function (cb) {
      fileTypes.push(cb.value);
    });
    return {
      submissionType: $('f-submission-type') ? $('f-submission-type').value : 'file',
      attemptsAllowed: parseInt($('f-attempts') ? $('f-attempts').value : 1) || 1,
      lateSubmissionPolicy: $('f-late-policy') ? $('f-late-policy').value : '',
      fileTypes: fileTypes,
      maxFileSizeMb: parseFloat($('f-max-file-size') ? $('f-max-file-size').value : 10) || 10,
      notes: $('f-requirements-notes') ? $('f-requirements-notes').value.trim() : '',
    };
  }

  /* ===== Render Step ===== */
  function renderStep(step) {
    document.querySelectorAll('.builder-step').forEach(function (el) { el.style.display = 'none'; });
    var stepEl = $('step-' + step);
    if (stepEl) stepEl.style.display = 'block';
    state.currentStep = step;
    updateStepIndicator();
    updateProgress();
    updateButtons();
    renderSidebar();
    if (step === 1) populateFormStep1();
    if (step === 2) populateFormStep2();
    if (step === 3) renderResourcesList();
    if (step === 4) renderReview();
  }

  /* ===== Populate Forms ===== */
  function populateFormStep1() {
    var d = state.data;
    setVal('f-title', d.title);
    setVal('f-course', d.CourseId);
    setVal('f-module', d.moduleId);
    setVal('f-type', d.type);
    setVal('f-difficulty', d.difficulty);
    setVal('f-total-points', d.totalPoints);
    setVal('f-estimated-time', d.estimatedTime);
    setVal('f-core-objective', d.coreObjective);
    setVal('f-due-date', d.dueDate);
    setVal('f-pro-tip', d.proTip);
    if ($('editor-description')) $('editor-description').innerHTML = d.description || '';
    if ($('editor-instructions')) $('editor-instructions').innerHTML = d.instructions || '';
    renderDeliverables(d.keyDeliverables || []);
  }

  function populateFormStep2() {
    var d = state.data;
    setVal('f-submission-type', d.submissionType);
    setVal('f-attempts', d.attemptsAllowed);
    setVal('f-max-file-size', d.maxFileSizeMb);
    setVal('f-late-policy', d.lateSubmissionPolicy || '');
    setVal('f-requirements-notes', d.requirementsNotes || '');
    document.querySelectorAll('#file-type-grid input').forEach(function (cb) {
      cb.checked = (d.fileTypes || []).indexOf(cb.value) > -1;
    });
  }

  function setVal(id, val) {
    var el = $(id);
    if (!el) return;
    if (el.tagName === 'DIV') { el.textContent = val || ''; return; }
    if (el.type === 'datetime-local' && val) {
      el.value = val.substring(0, 16);
    } else {
      el.value = val != null ? val : '';
    }
  }

  /* ===== Deliverables ===== */
  function renderDeliverables(items) {
    var list = $('deliverables-list');
    if (!list) return;
    list.innerHTML = '';
    (items || []).forEach(function (item) {
      addDeliverableRow(item);
    });
  }

  function addDeliverableRow(val) {
    var list = $('deliverables-list');
    if (!list) return;
    var div = document.createElement('div');
    div.className = 'deliverable-item';
    div.innerHTML = '<input type="text" class="form-input" value="' + escapeHtml(val || '') + '" placeholder="e.g. Submit a 2-page PDF"/>'
      + '<button type="button" class="deliverable-remove">&times;</button>';
    div.querySelector('.deliverable-remove').onclick = function () { div.remove(); markDirty(); };
    div.querySelector('input').oninput = markDirty;
    list.appendChild(div);
  }

  /* ===== Resources ===== */
  function renderResourcesList() {
    var list = $('resources-list');
    if (!list) return;
    var resources = state.data.resources || [];
    if (!resources.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">&#x1F4C1;</div>No resources added yet</div>';
      return;
    }
    list.innerHTML = '';
    resources.forEach(function (r, i) {
      var icon = r.type === 'link' ? 'link' : r.type === 'video' ? 'play_circle' : 'description';
      var iconClass = r.type === 'link' ? 'link' : r.type === 'video' ? 'video' : 'file';
      var sizeStr = r.fileSize ? (r.fileSize / 1024 / 1024).toFixed(1) + ' MB' : '';
      var item = document.createElement('div');
      item.className = 'resource-item';
      item.innerHTML = '<div class="resource-icon ' + iconClass + '"><span class="material-symbols-outlined">' + icon + '</span></div>'
        + '<div class="resource-info"><div class="ri-title">' + escapeHtml(r.title) + '</div>'
        + '<div class="ri-meta">' + (r.type || 'file') + (sizeStr ? ' \u00B7 ' + sizeStr : '') + '</div></div>'
        + '<button type="button" class="resource-remove" data-index="' + i + '">&times;</button>';
      item.querySelector('.resource-remove').onclick = function () {
        if (r.id) {
          api.delete('/tutor/assignments/' + state.assignmentId + '/resources/' + r.id).catch(function () {});
        }
        state.data.resources.splice(i, 1);
        renderResourcesList();
        updateResourceStats();
        markDirty();
      };
      list.appendChild(item);
    });
    updateResourceStats();
  }

  function updateResourceStats() {
    var resources = state.data.resources || [];
    var count = resources.length;
    var totalSize = resources.reduce(function (sum, r) { return sum + (r.fileSize || 0); }, 0);
    var countEl = $('resource-count');
    var sizeEl = $('resource-total-size');
    if (countEl) countEl.textContent = count + ' file' + (count !== 1 ? 's' : '');
    if (sizeEl) sizeEl.textContent = (totalSize / 1024 / 1024).toFixed(1) + ' MB total';
  }

  /* ===== Dropzone ===== */
  function setupDropzone() {
    var dz = $('resource-dropzone');
    var input = $('resource-file-input');
    if (!dz || !input) return;
    dz.onclick = function () { input.click(); };
    dz.ondragover = function (e) { e.preventDefault(); dz.classList.add('drag-over'); };
    dz.ondragleave = function () { dz.classList.remove('drag-over'); };
    dz.ondrop = function (e) {
      e.preventDefault();
      dz.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    };
    input.onchange = function () {
      handleFiles(input.files);
      input.value = '';
    };
  }

  function handleFiles(files) {
    if (!files || !files.length) return;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (!state.assignmentId || state.isNew) {
        state.data.resources.push({
          title: file.name,
          type: 'file',
          fileSize: file.size,
          url: URL.createObjectURL(file),
        });
        renderResourcesList();
        markDirty();
        continue;
      }
      var sizeMb = file.size / 1024 / 1024;
      state.data.resources.push({
        title: file.name,
        type: 'file',
        fileSize: file.size,
        url: URL.createObjectURL(file),
      });
      renderResourcesList();
      markDirty();
    }
  }

  /* ===== Review ===== */
  function renderReview() {
    var d = state.data;
    renderReviewGrid('review-details', [
      { label: 'Title', value: d.title },
      { label: 'Type', value: d.type },
      { label: 'Difficulty', value: d.difficulty },
      { label: 'Max Score', value: d.totalPoints },
      { label: 'Est. Time', value: d.estimatedTime ? d.estimatedTime + ' min' : 'Not set' },
      { label: 'Due Date', value: d.dueDate ? new Date(d.dueDate).toLocaleString() : 'Not set' },
      { label: 'Course', value: getCourseName(d.CourseId) },
      { label: 'Module', value: getModuleName(d.moduleId) },
      { label: 'Core Objective', value: d.coreObjective || 'Not set' },
      { label: 'Pro Tip', value: d.proTip || 'Not set' },
    ]);
    var descEl = $('review-description');
    if (descEl) descEl.innerHTML = d.description || '<em>No description</em>';
    var instrEl = $('review-instructions');
    if (instrEl) instrEl.innerHTML = d.instructions || '<em>No instructions</em>';
    renderReviewGrid('review-submission', [
      { label: 'Submission Type', value: d.submissionType },
      { label: 'Attempts Allowed', value: d.attemptsAllowed },
      { label: 'Late Policy', value: d.lateSubmissionPolicy || 'Not set' },
      { label: 'Max Upload Size', value: d.maxFileSizeMb + ' MB' },
      { label: 'File Types', value: (d.fileTypes || []).join(', ') || 'Any' },
    ]);
    var resEl = $('review-resources');
    if (resEl) {
      var resources = state.data.resources || [];
      if (resources.length) {
        resEl.innerHTML = resources.map(function (r) {
          return '<div class="review-resource-item"><span class="material-symbols-outlined">description</span>' + escapeHtml(r.title) + '</div>';
        }).join('');
      } else {
        resEl.innerHTML = '<em>No resources</em>';
      }
    }
    validateReview();
  }

  function renderReviewGrid(id, items) {
    var el = $(id);
    if (!el) return;
    el.innerHTML = items.map(function (item) {
      return '<div class="rg-item"><div class="rg-label">' + item.label + '</div><div class="rg-value">' + escapeHtml(String(item.value)) + '</div></div>';
    }).join('');
  }

  function validateReview() {
    var warnings = $('validation-warnings');
    if (!warnings) return;
    var d = state.data;
    var issues = [];
    if (!d.title || d.title === 'Untitled Assignment') issues.push('Missing assignment title');
    if (!d.CourseId) issues.push('No course selected');
    if (!d.instructions || d.instructions === '<br>') issues.push('Missing instructions');
    if (!d.dueDate) issues.push('No due date set');
    if (!d.submissionType) issues.push('No submission type selected');
    if (issues.length) {
      warnings.innerHTML = issues.map(function (msg) {
        return '<div class="validation-warning"><span class="material-symbols-outlined">warning</span>' + msg + '</div>';
      }).join('');
    } else {
      warnings.innerHTML = '<div class="validation-pass"><span class="material-symbols-outlined">check_circle</span>All checks passed. Ready to publish!</div>';
    }
    return issues;
  }

  /* ===== Sidebar ===== */
  function renderSidebar() {
    var sb = $('builder-sidebar');
    if (!sb) return;
    var html = '';
    var step = state.currentStep;
    var d = state.data;
    html += '<div class="sidebar-widget"><h4>Assignment Summary</h4>'
      + '<div class="sw-summary-item"><span class="sw-label">Title</span><span>' + escapeHtml(d.title || 'Untitled') + '</span></div>'
      + '<div class="sw-summary-item"><span class="sw-label">Course</span><span>' + escapeHtml(getCourseName(d.CourseId) || 'Not set') + '</span></div>'
      + '<div class="sw-summary-item"><span class="sw-label">Status</span><span>' + (state.isNew ? 'New' : 'Draft') + '</span></div>'
      + '<div class="sw-summary-item"><span class="sw-label">Resources</span><span>' + (d.resources || []).length + '</span></div>'
      + '</div>';

    if (step === 1) {
      html += '<div class="sidebar-widget"><h4>Completion Checklist</h4>'
        + checklistItem(d.title && d.title !== 'Untitled Assignment', 'Title set')
        + checklistItem(!!d.CourseId, 'Course selected')
        + checklistItem(!!d.instructions && d.instructions !== '<br>', 'Instructions written')
        + checklistItem(!!d.type, 'Type selected')
        + '</div>';
      html += '<div class="sidebar-widget"><h4>Teaching Tip</h4>'
        + '<div class="sw-tip">Clear instructions help students understand expectations. Include specific formatting requirements and submission guidelines.</div>'
        + '</div>';
    } else if (step === 2) {
      html += '<div class="sidebar-widget"><h4>Current Settings</h4>'
        + '<div class="sw-summary-item"><span class="sw-label">Type</span><span>' + escapeHtml(d.submissionType || 'Not set') + '</span></div>'
        + '<div class="sw-summary-item"><span class="sw-label">Attempts</span><span>' + (d.attemptsAllowed || 1) + '</span></div>'
        + '<div class="sw-summary-item"><span class="sw-label">Max Size</span><span>' + (d.maxFileSizeMb || 10) + ' MB</span></div>'
        + '<div class="sw-summary-item"><span class="sw-label">File Types</span><span>' + ((d.fileTypes || []).length || 'Any') + '</span></div>'
        + '</div>';
      html += '<div class="sidebar-widget"><h4>Teaching Tip</h4>'
        + '<div class="sw-tip">Limit file types to formats you can easily review. Set clear expectations about submission format in the instructions.</div>'
        + '</div>';
    } else if (step === 3) {
      html += '<div class="sidebar-widget"><h4>Upload Stats</h4>'
        + '<div class="sw-summary-item"><span class="sw-label">Files</span><span>' + (d.resources || []).length + '</span></div>'
        + '<div class="sw-summary-item"><span class="sw-label">Total Size</span><span>' + ((d.resources || []).reduce(function (s, r) { return s + (r.fileSize || 0); }, 0) / 1024 / 1024).toFixed(1) + ' MB</span></div>'
        + '</div>';
      html += '<div class="sidebar-widget"><h4>Teaching Tip</h4>'
        + '<div class="sw-tip">Provide starter templates or examples alongside your assignment. This reduces confusion and helps students get started faster.</div>'
        + '</div>';
    } else if (step === 4) {
      var issues = validateReview();
      html += '<div class="sidebar-widget"><h4>Publishing Checklist</h4>'
        + checklistItem(!issues.length, 'All validations passed')
        + checklistItem(!!d.title && d.title !== 'Untitled Assignment', 'Title set')
        + checklistItem(!!d.CourseId, 'Course selected')
        + checklistItem(!!d.instructions && d.instructions !== '<br>', 'Instructions written')
        + checklistItem(!!d.dueDate, 'Due date set')
        + '</div>';
    }
    sb.innerHTML = html;
  }

  function checklistItem(done, label) {
    var icon = done ? 'check_circle' : 'radio_button_unchecked';
    var cls = done ? 'done' : '';
    return '<div class="sw-checklist-item ' + cls + '"><span class="material-symbols-outlined check-icon">' + icon + '</span>' + label + '</div>';
  }

  /* ===== Helpers ===== */
  function getCourseName(id) {
    if (!id) return '';
    var c = state.courses.find(function (c) { return c.id === id; });
    return c ? c.title : '';
  }

  function getModuleName(id) {
    if (!id) return '';
    var m = state.modules.find(function (m) { return m.id === id; });
    return m ? m.title : '';
  }

  function populateCourses() {
    var sel = $('f-course');
    if (!sel) return;
    var val = sel.value;
    sel.innerHTML = '<option value="">Select course...</option>';
    state.courses.forEach(function (c) {
      sel.innerHTML += '<option value="' + c.id + '">' + escapeHtml(c.title) + '</option>';
    });
    sel.value = val;
  }

  function populateModules() {
    var sel = $('f-module');
    if (!sel) return;
    var val = sel.value;
    sel.innerHTML = '<option value="">Select module...</option>';
    state.modules.forEach(function (m) {
      sel.innerHTML += '<option value="' + m.id + '">' + escapeHtml(m.title) + '</option>';
    });
    sel.value = val;
  }

  function renderAssignmentTitle() {
    var el = $('assignment-title-display');
    if (el) el.textContent = state.data.title || 'Untitled Assignment';
  }

  function updateStepIndicator() {
    var step = state.currentStep;
    document.querySelectorAll('.step').forEach(function (el) {
      var s = parseInt(el.dataset.step, 10);
      el.classList.toggle('active', s === step);
      el.classList.toggle('completed', s < step);
    });
  }

  function updateProgress() {
    var pct = ((state.currentStep - 1) / 3) * 100;
    var fill = $('progress-fill');
    var text = $('progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = Math.round(pct) + '% complete';
  }

  function updateButtons() {
    var prev = $('btn-prev');
    var next = $('btn-next');
    var publish = $('btn-publish');
    var preview = $('btn-preview');
    if (prev) prev.style.display = state.currentStep > 1 ? 'flex' : 'none';
    if (next) next.style.display = state.currentStep < 4 ? 'flex' : 'none';
    if (publish) publish.style.display = state.currentStep === 4 ? 'flex' : 'none';
    if (preview) preview.style.display = state.currentStep === 4 ? 'flex' : 'none';
    var bc = $('bc-current');
    var labels = { 1: 'Step 1: Assignment Details', 2: 'Step 2: Submission Configuration', 3: 'Step 3: Resources & Attachments', 4: 'Step 4: Review & Publish' };
    if (bc) bc.textContent = labels[state.currentStep] || 'Assignment Builder';
  }

  function updateDraftIndicator(text, color) {
    var el = $('draft-text');
    if (el) {
      el.textContent = text;
      el.style.color = color || 'var(--on-surface-variant)';
    }
  }

  function markDirty() {
    state.dirty = true;
    updateDraftIndicator('Unsaved changes', '#d97706');
  }

  /* ===== Navigation ===== */
  function goToStep(step) {
    if (step < 1 || step > 4) return;
    var url = '/tutor/assignments/builder/' + (state.assignmentId || 'new') + '/step/' + step;
    window.history.pushState(null, '', url);
    renderStep(step);
  }

  /* ===== Wire Events ===== */
  function wireEvents() {
    // Course -> module cascade
    var courseSel = $('f-course');
    if (courseSel) {
      courseSel.onchange = function () {
        var cid = this.value;
        state.data.CourseId = cid;
        state.data.moduleId = '';
        if ($('f-module')) $('f-module').value = '';
        loadModules(cid);
        markDirty();
      };
    }

    // All inputs mark dirty
    document.querySelectorAll('#step-1 input, #step-1 select, #step-2 input, #step-2 select, #step-2 textarea').forEach(function (el) {
      el.oninput = markDirty;
      el.onchange = markDirty;
    });

    // Rich editors
    ['editor-description', 'editor-instructions'].forEach(function (id) {
      var el = $(id);
      if (el) el.oninput = markDirty;
    });

    // File type checkboxes
    document.querySelectorAll('#file-type-grid input').forEach(function (cb) {
      cb.onchange = markDirty;
    });

    // Buttons
    $('btn-next').onclick = function () {
      if (state.isNew && state.currentStep === 1) {
        saveStep1First().then(function () {
          goToStep(state.currentStep + 1);
        });
      } else {
        if (state.currentStep === 1) saveDraftToServer();
        goToStep(state.currentStep + 1);
      }
    };

    $('btn-prev').onclick = function () {
      goToStep(state.currentStep - 1);
    };

    $('btn-save-draft').onclick = function () {
      if (state.isNew) {
        saveStep1First();
      } else {
        saveDraftToServer();
      }
    };

    $('btn-publish').onclick = function () {
      if (state.isNew) {
        saveStep1First().then(function () {
          doPublish();
        });
      } else {
        saveDraftToServer().then(function () {
          doPublish();
        });
      }
    };

    // Step indicator click
    document.querySelectorAll('.step').forEach(function (el) {
      el.onclick = function () {
        var s = parseInt(this.dataset.step, 10);
        if (s <= state.currentStep) goToStep(s);
      };
    });

    // Add deliverable
    $('add-deliverable').onclick = function () {
      addDeliverableRow('');
      markDirty();
    };

    // Add link
    $('add-link-btn').onclick = function () {
      var title = $('f-link-title');
      var url = $('f-link-url');
      if (!title.value.trim() || !url.value.trim()) return;
      state.data.resources.push({
        title: title.value.trim(),
        type: 'link',
        url: url.value.trim(),
        fileSize: 0,
      });
      title.value = '';
      url.value = '';
      renderResourcesList();
      markDirty();
      if (!state.isNew) {
        api.post('/tutor/assignments/' + state.assignmentId + '/resources', {
          title: state.data.resources[state.data.resources.length - 1].title,
          type: 'link',
          url: state.data.resources[state.data.resources.length - 1].url,
        }).catch(function () {});
      }
    };

    // Auto-save every 30 seconds if dirty and not new
    setInterval(function () {
      if (state.dirty && !state.isNew && !state.saving) {
        saveDraftToServer();
      }
    }, 30000);

    // Keyboard shortcut
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (state.isNew) saveStep1First(); else saveDraftToServer();
      }
    });

    // Popstate
    window.addEventListener('popstate', function () {
      var stepMatch = window.location.pathname.match(/\/step\/(\d+)/);
      var step = stepMatch ? parseInt(stepMatch[1], 10) : 1;
      renderStep(step);
    });
  }

  function saveStep1First() {
    var data = collectStep1Data();
    updateDraftIndicator('Creating...', '#f59e0b');
    return api.post('/tutor/assignments/create', data).then(function (r) {
      state.assignmentId = r.data.id;
      state.isNew = false;
      var newUrl = '/tutor/assignments/builder/' + state.assignmentId + '/step/' + state.currentStep;
      window.history.replaceState(null, '', newUrl);
      updateDraftIndicator('Saved', '#059669');
      state.lastSaved = new Date();
      state.dirty = false;
      renderAssignmentTitle();
      return r;
    }).catch(function () {
      updateDraftIndicator('Save failed', '#dc2626');
    });
  }

  function doPublish() {
    updateDraftIndicator('Publishing...', '#f59e0b');
    api.post('/tutor/assignments/' + state.assignmentId + '/publish').then(function () {
      updateDraftIndicator('Published!', '#059669');
      var badge = $('builder-status-badge');
      if (badge) { badge.textContent = 'published'; badge.className = 'builder-status-badge published'; }
      setTimeout(function () {
        window.location.href = '/tutor/assignments';
      }, 1500);
    }).catch(function () {
      updateDraftIndicator('Publish failed', '#dc2626');
    });
  }

  /* ===== Escape HTML ===== */
  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
  }

  /* ===== Init on components-loaded ===== */
  document.addEventListener('components-loaded', init);
})();
