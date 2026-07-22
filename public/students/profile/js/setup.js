(function () {
  'use strict';

  var currentStep = 1;
  var photoDataUrl = null;

  var $ = function (id) { return document.getElementById(id); };

  function init() {
    wirePhotoUpload();
    wireInterestChips();
    wireButtons();
    updateStepUI();
    loadCurrentUser();
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); finishSetup(); }
    });
  }

  function loadCurrentUser() {
    var token = localStorage.getItem('token');
    if (!token) return;
    try {
      var payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.fullName && $('f-setup-name')) $('f-setup-name').value = payload.fullName;
    } catch (_) {}
    api.get('/users/me').then(function (r) {
      var u = r.data || {};
      if (u.fullName && $('f-setup-name') && !$('f-setup-name').value) $('f-setup-name').value = u.fullName;
      if (u.bio && $('f-setup-bio')) $('f-setup-bio').value = u.bio;
      if (u.avatarUrl && $('photo-preview')) {
        photoDataUrl = u.avatarUrl;
        $('photo-preview').style.backgroundImage = 'url(' + u.avatarUrl + ')';
        $('photo-preview').classList.add('has-image');
      }
      if (u.skills && Array.isArray(u.skills) && $('f-setup-skills')) $('f-setup-skills').value = u.skills.join(', ');
      if (u.phoneNumber && $('f-setup-phone')) $('f-setup-phone').value = u.phoneNumber;
      if (u.location && $('f-setup-location')) $('f-setup-location').value = u.location;
      if (u.UserInterests && Array.isArray(u.UserInterests)) {
        u.UserInterests.forEach(function (int) {
          var chip = document.querySelector('.interest-chip[data-value="' + int.name + '"]');
          if (chip) chip.classList.add('selected');
        });
      }
    }).catch(function () {});
  }

  function wirePhotoUpload() {
    var area = $('photo-upload-area');
    var input = $('photo-input');
    if (!area || !input) return;
    area.onclick = function () { input.click(); };
    input.onchange = function () {
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        photoDataUrl = e.target.result;
        $('photo-preview').style.backgroundImage = 'url(' + photoDataUrl + ')';
        $('photo-preview').classList.add('has-image');
      };
      reader.readAsDataURL(file);
    };
  }

  function wireInterestChips() {
    document.querySelectorAll('.interest-chip').forEach(function (chip) {
      chip.onclick = function () {
        this.classList.toggle('selected');
      };
    });
  }

  function wireButtons() {
    $('setup-next-btn').onclick = function () {
      if (currentStep < 3) goToStep(currentStep + 1);
    };
    $('setup-prev-btn').onclick = function () {
      if (currentStep > 1) goToStep(currentStep - 1);
    };
    $('setup-finish-btn').onclick = finishSetup;
    $('setup-skip-btn').onclick = skipSetup;
  }

  function goToStep(step) {
    if (step < 1 || step > 3) return;
    document.querySelectorAll('.setup-step').forEach(function (el) { el.style.display = 'none'; });
    var el = $('setup-step-' + step);
    if (el) el.style.display = 'block';
    currentStep = step;
    updateStepUI();
  }

  function updateStepUI() {
    document.querySelectorAll('.ss-step').forEach(function (el) {
      var s = parseInt(el.dataset.step, 10);
      el.classList.toggle('active', s === currentStep);
      el.classList.toggle('completed', s < currentStep);
    });
    $('setup-prev-btn').style.display = currentStep > 1 ? 'flex' : 'none';
    $('setup-next-btn').style.display = currentStep < 3 ? 'flex' : 'none';
    $('setup-finish-btn').style.display = currentStep === 3 ? 'flex' : 'none';
  }

  function collectData() {
    var interests = [];
    document.querySelectorAll('.interest-chip.selected').forEach(function (chip) {
      interests.push(chip.dataset.value);
    });
    var skillsVal = $('f-setup-skills') ? $('f-setup-skills').value.trim() : '';
    var skills = skillsVal ? skillsVal.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
    return {
      fullName: $('f-setup-name') ? $('f-setup-name').value.trim() : '',
      bio: $('f-setup-bio') ? $('f-setup-bio').value.trim() : '',
      avatarUrl: photoDataUrl || null,
      phoneNumber: $('f-setup-phone') ? $('f-setup-phone').value.trim() : '',
      location: $('f-setup-location') ? $('f-setup-location').value.trim() : '',
      skills: skills,
      interests: interests,
    };
  }

  function finishSetup() {
    var data = collectData();
    var btn = $('setup-finish-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined">hourglass_top</span> Saving...';

    var chain = Promise.resolve();

    if (data.bio || data.skills.length || data.avatarUrl) {
      chain = chain.then(function () {
        return api.put('/users/me/profile', {
          bio: data.bio || undefined,
          skills: data.skills.length ? data.skills : undefined,
          avatarUrl: data.avatarUrl || undefined,
        });
      });
    }

    if (data.interests.length) {
      chain = chain.then(function () {
        return api.put('/users/me/interests', { interests: data.interests });
      });
    }

    chain.then(function () {
      localStorage.removeItem('needsProfileSetup');
      btn.innerHTML = '<span class="material-symbols-outlined">check</span> Done!';
      setTimeout(function () {
        var token = localStorage.getItem('token');
        if (token) {
          try {
            var payload = JSON.parse(atob(token.split('.')[1]));
            var role = payload.role || '';
            var urls = { learner: '/courses/recommendations', tutor: '/tutor', admin: '/admin', super_admin: '/superadmin' };
            window.location.href = urls[role] || '/courses/recommendations';
          } catch (_) {
            window.location.href = '/courses/recommendations';
          }
        } else {
          window.location.href = '/courses/recommendations';
        }
      }, 800);
    }).catch(function () {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined">check</span> Complete Profile';
      alert('Failed to save profile. Please try again.');
    });
  }

  function skipSetup() {
    localStorage.removeItem('needsProfileSetup');
    var token = localStorage.getItem('token');
    if (token) {
      try {
        var payload = JSON.parse(atob(token.split('.')[1]));
        var role = payload.role || '';
        var urls = { learner: '/courses/recommendations', tutor: '/tutor', admin: '/admin', super_admin: '/superadmin' };
        window.location.href = urls[role] || '/courses/recommendations';
      } catch (_) {
        window.location.href = '/courses/recommendations';
      }
    } else {
      window.location.href = '/courses/recommendations';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
