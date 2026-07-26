var TimelineApp = (function () {
  var state = {
    currentPage: 1,
    totalPages: 1,
    selectedImage: null,
  };

  function getCheckmarkHtml(u) {
    if (!u || !u.isVerified) return '';
    var cls = u.checkmarkType === 'blue' ? 'blue' : 'black';
    return '<span class="checkmark ' + cls + '">' + (cls === 'blue' ? '\u2713' : '\u2726') + '</span>';
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var now = new Date();
    var opts = { month: 'short', day: 'numeric' };
    if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
    return d.toLocaleDateString('en-US', opts);
  }

  async function loadTimeline() {
    try {
      var res = await Shared.api.get('/timeline?page=' + state.currentPage + '&limit=20');
      var data = res.data || {};
      state.totalPages = data.totalPages || 1;
      var posts = data.items || [];
      var container = document.getElementById('timeline-posts');
      if (state.currentPage === 1) container.innerHTML = '';
      if (!posts.length && state.currentPage === 1) {
        container.innerHTML = '<div class="card" style="padding:2rem;text-align:center;color:var(--on-surface-variant)"><span class="material-symbols-outlined icon" style="font-size:3rem;display:block;margin-bottom:1rem">article</span><p>No posts yet. Follow users to see their posts!</p></div>';
        return;
      }
      posts.forEach(function (post) {
        var author = post.author || {};
        var div = document.createElement('div');
        div.className = 'post-card';
        div.innerHTML =
          '<div class="post-header">' +
          '<div class="post-avatar" style="background-image:url(' + escapeHtml(author.avatarUrl || '') + ')">' + (author.avatarUrl ? '' : escapeHtml(author.fullName?.[0] || '?')) + '</div>' +
          '<div>' +
          '<p style="font-weight:600;font-size:0.875rem">' + escapeHtml(author.fullName || 'Unknown') + getCheckmarkHtml(author) + '</p>' +
          '<p style="font-size:0.75rem;color:var(--on-surface-variant)">' + formatDate(post.createdAt) + '</p>' +
          '</div>' +
          '<div style="margin-left:auto;font-size:0.75rem;color:var(--on-surface-variant)">' + escapeHtml(author.role || '') + '</div>' +
          '</div>' +
          (post.imageUrl ? '<img src="' + escapeHtml(post.imageUrl) + '" class="post-image" alt="Post image"/>' : '') +
          '<div class="post-body">' + escapeHtml(post.body) + '</div>' +
          '<div class="post-actions">' +
          '<span class="post-action ' + (post.isLiked ? 'active' : '') + '" onclick="TimelineApp.toggleLike(\'' + post.id + '\')">' +
          '<span class="material-symbols-outlined" style="font-size:1.1rem">' + (post.isLiked ? 'favorite' : 'favorite_border') + '</span> ' + (post.likeCount || 0) +
          '</span>' +
          '<span class="post-action" onclick="TimelineApp.showComments(\'' + post.id + '\')">' +
          '<span class="material-symbols-outlined" style="font-size:1.1rem">comment</span> ' + (post.commentCount || 0) +
          '</span>' +
          '<span class="post-action ' + (post.isBookmarked ? 'active' : '') + '" onclick="TimelineApp.toggleBookmark(\'' + post.id + '\')">' +
          '<span class="material-symbols-outlined" style="font-size:1.1rem">' + (post.isBookmarked ? 'bookmark' : 'bookmark_border') + '</span>' +
          '</span>' +
          '<span class="post-action" onclick="TimelineApp.reportPost(\'' + post.id + '\')">' +
          '<span class="material-symbols-outlined" style="font-size:1.1rem">flag</span>' +
          '</span>' +
          '</div>' +
          '<div id="comments-' + post.id + '" style="display:none;margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--outline-variant)"></div>';
        container.appendChild(div);
      });
      var loadMoreBtn = document.getElementById('load-more-btn');
      if (loadMoreBtn) loadMoreBtn.style.display = state.currentPage < state.totalPages ? 'block' : 'none';
    } catch (e) {
      console.error('Failed to load timeline', e);
      var container = document.getElementById('timeline-posts');
      if (container) container.innerHTML = '<div class="card" style="padding:2rem;text-align:center;color:var(--error)">Failed to load timeline</div>';
    }
  }

  async function loadRecommendedUsers() {
    var container = document.getElementById('recommended-users');
    if (!container) return;
    try {
      var res = await Shared.api.get('/timeline/recommended-users?limit=5');
      var users = res.data?.items || [];
      if (!users.length) { container.style.display = 'none'; return; }
      container.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">' +
        '<h2 style="font-size:1rem;font-weight:600">People you may know</h2>' +
        '<a href="/search" style="font-size:0.8125rem;color:var(--primary)">View all</a>' +
        '</div>' +
        users.map(function (u) {
          return '<div class="recommended-user">' +
            '<div class="post-avatar" style="width:36px;height:36px;background-image:url(' + escapeHtml(u.avatarUrl || '') + ')">' + (u.avatarUrl ? '' : escapeHtml(u.fullName?.[0] || '?')) + '</div>' +
            '<div style="flex:1;min-width:0">' +
            '<p style="font-weight:600;font-size:0.8125rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(u.fullName) + getCheckmarkHtml(u) + '</p>' +
            '<p style="font-size:0.75rem;color:var(--on-surface-variant)">' + escapeHtml(u.role || '') + '</p>' +
            '</div>' +
            '<button class="btn-primary text-sm" style="flex-shrink:0" onclick="TimelineApp.followUser(\'' + u.id + '\')">Follow</button>' +
            '</div>';
        }).join('');
    } catch (e) {
      if (container) container.style.display = 'none';
    }
  }

  async function loadRecommendedCourses() {
    var container = document.getElementById('recommended-courses');
    if (!container) return;
    try {
      var res = await Shared.api.get('/timeline/recommended-courses');
      var courses = res.data || [];
      if (!courses.length) { container.style.display = 'none'; return; }
      container.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">' +
        '<h2 style="font-size:1rem;font-weight:600">Recommended Courses</h2>' +
        '<a href="/courses" style="font-size:0.8125rem;color:var(--primary)">Browse all</a>' +
        '</div>' +
        '<div style="display:flex;gap:0.75rem;overflow-x:auto;padding-bottom:0.5rem">' +
        courses.map(function (c) {
          return '<div class="card" style="flex-shrink:0;width:200px;padding:0;overflow:hidden;cursor:pointer" onclick="window.location.href=\'/course/' + c.id + '\'">' +
            (c.thumbnail ? '<img src="' + escapeHtml(c.thumbnail) + '" style="width:100%;height:100px;object-fit:cover" alt=""/>' : '<div style="width:100%;height:100px;background:var(--primary-container);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="font-size:2rem;color:var(--on-primary-container)">school</span></div>') +
            '<div style="padding:0.75rem">' +
            '<p style="font-size:0.8125rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(c.title || '') + '</p>' +
            '<p style="font-size:0.75rem;color:var(--on-surface-variant)">' + escapeHtml(c.category || '') + '</p>' +
            '</div></div>';
        }).join('') +
        '</div>';
    } catch (e) {
      if (container) container.style.display = 'none';
    }
  }

  return {
    init: async function () {
      await Shared.auth.requireAuth();
      state.currentPage = 1;
      state.selectedImage = null;
      loadTimeline();
      loadRecommendedUsers();
      loadRecommendedCourses();

      var loadMoreBtn = document.getElementById('load-more-btn');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
          if (state.currentPage < state.totalPages) {
            state.currentPage++;
            loadTimeline();
          }
        });
      }
    },
    loadTimeline: loadTimeline,
    loadRecommendedUsers: loadRecommendedUsers,
    loadRecommendedCourses: loadRecommendedCourses,
    toggleLike: async function (postId) {
      try { await Shared.api.post('/timeline/' + postId + '/like'); loadTimeline(); } catch (e) { }
    },
    toggleBookmark: async function (postId) {
      try { await Shared.api.post('/timeline/' + postId + '/bookmark'); loadTimeline(); } catch (e) { }
    },
    followUser: async function (id) {
      try {
        await Shared.api.post('/api/follow/' + id + '/follow');
        loadRecommendedUsers();
      } catch (e) { alert('Failed to follow'); }
    },
    reportPost: async function (postId) {
      var reason = prompt('Reason for report:');
      if (!reason) return;
      try {
        await Shared.api.post('/timeline/' + postId + '/report', { postId: postId, reason: reason });
        alert('Reported. Our team will review it.');
      } catch (e) { alert('Failed to report'); }
    },
    showComments: async function (postId) {
      var container = document.getElementById('comments-' + postId);
      if (!container) return;
      if (container.style.display !== 'none') { container.style.display = 'none'; return; }
      container.style.display = 'block';
      try {
        var res = await Shared.api.get('/timeline/' + postId + '/comments');
        var comments = res.data?.items || [];
        container.innerHTML = comments.map(function (c) {
          return '<div style="padding:0.5rem 0;border-bottom:1px solid var(--outline-variant)">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">' +
            '<strong style="font-size:0.8125rem">' + escapeHtml(c.commenter?.fullName || 'Unknown') + '</strong>' +
            '<span style="font-size:0.6875rem;color:var(--on-surface-variant)">' + formatDate(c.createdAt) + '</span>' +
            '</div>' +
            '<p style="font-size:0.875rem">' + escapeHtml(c.body) + '</p>' +
            '<div style="display:flex;gap:0.75rem;margin-top:0.375rem">' +
            '<span class="post-action ' + (c.isLiked ? 'active' : '') + '" style="font-size:0.75rem;padding:0.125rem 0.375rem" onclick="TimelineApp.toggleCommentLike(\'' + c.id + '\', \'' + postId + '\')">' +
            '<span class="material-symbols-outlined" style="font-size:0.875rem">' + (c.isLiked ? 'favorite' : 'favorite_border') + '</span> ' + (c.likeCount || 0) +
            '</span>' +
            '<span class="post-action" style="font-size:0.75rem;padding:0.125rem 0.375rem" onclick="TimelineApp.reportComment(\'' + c.id + '\', \'' + postId + '\')">Report</span>' +
            '</div></div>';
        }).join('');
        container.innerHTML +=
          '<div style="display:flex;gap:0.5rem;margin-top:0.75rem">' +
          '<input type="text" id="comment-input-' + postId + '" placeholder="Write a comment..." style="flex:1;padding:0.5rem 0.75rem;border-radius:0.375rem;border:1px solid var(--outline-variant);background:var(--surface-container-low);color:var(--on-surface);font-size:0.8125rem"/>' +
          '<button class="btn-primary text-sm" onclick="TimelineApp.addComment(\'' + postId + '\')">Send</button>' +
          '</div>';
      } catch (e) {
        container.innerHTML = '<p style="font-size:0.8125rem;color:var(--error)">Failed to load comments</p>';
      }
    },
    addComment: async function (postId) {
      var input = document.getElementById('comment-input-' + postId);
      if (!input) return;
      var body = input.value.trim();
      if (!body) return;
      try {
        await Shared.api.post('/timeline/' + postId + '/comment', { body: body });
        input.value = '';
        this.showComments(postId);
      } catch (e) { alert('Failed to comment'); }
    },
    toggleCommentLike: async function (commentId, postId) {
      try {
        await Shared.api.post('/timeline/comments/' + commentId + '/like');
        this.showComments(postId);
      } catch (e) { }
    },
    reportComment: async function (commentId, postId) {
      var reason = prompt('Reason for report:');
      if (!reason) return;
      try {
        await Shared.api.post('/timeline/' + postId + '/report', { commentId: commentId, reason: reason });
        alert('Reported');
      } catch (e) { alert('Failed to report'); }
    },
    createPost: async function () {
      var bodyInput = document.getElementById('post-body');
      if (!bodyInput) return;
      var body = bodyInput.value.trim();
      if (!body) { alert('Please write something'); return; }
      var imageUrl = null;
      if (state.selectedImage) {
        var formData = new FormData();
        formData.append('file', state.selectedImage);
        try {
          var uploadRes = await Shared.api.upload('/uploads', formData);
          imageUrl = uploadRes.data?.url || null;
        } catch (e) { alert('Failed to upload image'); return; }
      }
      try {
        await Shared.api.post('/timeline', { body: body, imageUrl: imageUrl });
        bodyInput.value = '';
        state.selectedImage = null;
        var imageName = document.getElementById('image-name');
        if (imageName) imageName.textContent = '';
        state.currentPage = 1;
        loadTimeline();
      } catch (e) { alert('Failed to create post'); }
    },
    handleImageSelect: function (input) {
      var file = input.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) { alert('Image too large (max 10MB)'); return; }
        state.selectedImage = file;
        var imageName = document.getElementById('image-name');
        if (imageName) imageName.textContent = file.name;
      }
    },
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  TimelineApp.init();
});
