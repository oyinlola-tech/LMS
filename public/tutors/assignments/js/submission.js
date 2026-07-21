(function () {
  'use strict';

  var assignmentId = null;
  var uploadedFiles = [];
  var isSubmitting = false;

  function init() {
    if (!document.getElementById('submission-content')) return;
    assignmentId = extractId();
    if (!assignmentId) { showError(); return; }
    loadAssignment();
    wireDropzone();
    wireButtons();
  }

  function extractId() {
    var m = window.location.pathname.match(/\/tutor\/assignments\/([a-f0-9-]+)\/submission/i);
    return m ? m[1] : null;
  }

  function loadAssignment() {
    api.get('/tutor/assignments/' + assignmentId + '/edit').then(function (r) {
      var data = r.data;
      if (!data) { showError(); return; }
      renderInfo(data);
    }).catch(function () { showError(); });
  }

  function renderInfo(a) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('submission-content').style.display = '';

    var breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb) {
      breadcrumb.innerHTML = '<a href="/tutor/assignments">Assignments</a>' +
        ' <span class="material-symbols-outlined" style="font-size:0.75rem;vertical-align:middle">chevron_right</span> ' +
        '<a href="/tutor/assignments/' + a.id + '/details">' + escHtml(a.title) + '</a>' +
        ' <span class="material-symbols-outlined" style="font-size:0.75rem;vertical-align:middle">chevron_right</span> Submit';
    }

    var infoRows = document.getElementById('info-rows');
    if (infoRows) {
      infoRows.innerHTML =
        '<div class="info-row"><span class="info-label">Assignment</span><span class="info-value">' + escHtml(a.title) + '</span></div>' +
        '<div class="info-row"><span class="info-label">Type</span><span class="info-value">' + capitalize(a.type || 'essay') + '</span></div>' +
        '<div class="info-row"><span class="info-label">Points</span><span class="info-value">' + (a.totalPoints || '-') + '</span></div>' +
        (a.dueDate ? '<div class="info-row"><span class="info-label">Due</span><span class="info-value">' + formatDate(a.dueDate) + '</span></div>' : '') +
        '<div class="info-row"><span class="info-label">Attempts</span><span class="info-value">' + (a.attemptsAllowed || 1) + '</span></div>';
    }

    var reqContent = document.getElementById('requirements-content');
    if (reqContent) {
      var req = a.requirement;
      var html = '';
      if (req) {
        if (req.fileTypes && Array.isArray(req.fileTypes)) {
          html += '<strong>Allowed formats:</strong> ' + req.fileTypes.join(', ');
        }
        if (req.maxFileSizeMb) {
          html += '<br><strong>Max size:</strong> ' + req.maxFileSizeMb + ' MB';
        }
        if (req.notes) {
          html += '<br><br><strong>Notes:</strong><br>' + escHtml(req.notes);
        }
      }
      if (a.lateSubmissionPolicy) {
        html += '<br><br><strong>Late policy:</strong><br>' + escHtml(a.lateSubmissionPolicy);
      }
      reqContent.innerHTML = html || 'No specific requirements.';
      document.getElementById('dropzone-hint').textContent = req && req.fileTypes ? 'Allowed: ' + req.fileTypes.join(', ') + ' | Max: ' + (req.maxFileSizeMb || 10) + ' MB' : '';
    }
  }

  function wireDropzone() {
    var dz = document.getElementById('dropzone');
    var input = document.getElementById('file-input');
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
    for (var i = 0; i < files.length; i++) {
      uploadedFiles.push(files[i]);
    }
    renderFiles();
  }

  function renderFiles() {
    var container = document.getElementById('files-list');
    var section = document.getElementById('uploaded-files');
    if (!container || !section) return;

    if (!uploadedFiles.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';

    container.innerHTML = uploadedFiles.map(function (f, idx) {
      var size = f.size > 1024 * 1024 ? (f.size / (1024 * 1024)).toFixed(1) + ' MB' : (f.size / 1024).toFixed(1) + ' KB';
      var icon = f.type.includes('pdf') ? 'picture_as_pdf' : f.type.includes('image') ? 'image' : f.type.includes('video') ? 'videocam' : f.type.includes('zip') ? 'folder_zip' : 'description';
      return '<div class="file-item">' +
        '<span class="material-symbols-outlined">' + icon + '</span>' +
        '<span class="file-name">' + escHtml(f.name) + '</span>' +
        '<span class="file-size">' + size + '</span>' +
        '<button class="file-remove" data-idx="' + idx + '"><span class="material-symbols-outlined">close</span></button>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.file-remove').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(this.dataset.idx, 10);
        uploadedFiles.splice(idx, 1);
        renderFiles();
      };
    });
  }

  function wireButtons() {
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.onclick = submitAssignment;

    var draftBtn = document.getElementById('save-draft-btn');
    if (draftBtn) draftBtn.onclick = saveDraft;
  }

  function submitAssignment() {
    if (isSubmitting) return;
    if (!uploadedFiles.length) {
      alert('Please upload at least one file.');
      return;
    }
    isSubmitting = true;
    var btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined">hourglass_top</span> Submitting...';

    var progress = document.getElementById('upload-progress');
    var fill = document.getElementById('progress-fill');
    var text = document.getElementById('progress-text');
    progress.style.display = 'flex';

    var fd = new FormData();
    uploadedFiles.forEach(function (f) { fd.append('files', f); });
    var notes = document.getElementById('submission-notes');
    if (notes && notes.value.trim()) fd.append('notes', notes.value.trim());

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/assignments/' + assignmentId + '/submit-upload');
    var token = localStorage.getItem('token');
    if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        var pct = Math.round((e.loaded / e.total) * 100);
        fill.style.width = pct + '%';
        text.textContent = pct + '%';
      }
    };

    xhr.onload = function () {
      progress.style.display = 'none';
      if (xhr.status >= 200 && xhr.status < 300) {
        btn.innerHTML = '<span class="material-symbols-outlined">check</span> Submitted!';
        setTimeout(function () {
          window.location.href = '/tutor/assignments/' + assignmentId + '/details';
        }, 1000);
      } else {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">send</span> Submit Assignment';
        alert('Submission failed. Please try again.');
      }
      isSubmitting = false;
    };

    xhr.onerror = function () {
      progress.style.display = 'none';
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined">send</span> Submit Assignment';
      alert('Network error. Please try again.');
      isSubmitting = false;
    };

    xhr.send(fd);
  }

  function saveDraft() {
    var notes = document.getElementById('submission-notes');
    if (notes) localStorage.setItem('submission_draft_' + assignmentId, notes.value);
    alert('Draft saved locally.');
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
