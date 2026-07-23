var ChatApp = (function () {
  var state = {
    activeTab: 'messages',
    currentThreadId: null,
    currentType: null,
    userId: null,
    fileAttachment: null,
    pollingTimer: null,
  };

  function getUserId() {
    try {
      var token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      var p = JSON.parse(atob(token.split('.')[1]));
      state.userId = p.sub;
    } catch(e) {}
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function formatTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    var now = new Date();
    var opts = { hour: 'numeric', minute: '2-digit' };
    if (d.toDateString() !== now.toDateString()) {
      opts.month = 'short';
      opts.day = 'numeric';
    }
    return d.toLocaleTimeString('en-US', opts);
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function getFileIcon(type) {
    if (!type) return 'insert_drive_file';
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('audio/')) return 'audiotrack';
    if (type.startsWith('video/')) return 'videocam';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('zip') || type.includes('rar') || type.includes('gzip')) return 'folder_zip';
    return 'description';
  }

  function switchTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-tab') === tab); });
    document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.toggle('active', c.id === 'tab-' + tab); });
    closeChatView();
    if (tab === 'messages') loadThreads();
    else loadDiscussions();
  }

  function loadThreads(search) {
    var url = '/messages/threads?limit=50';
    if (search) url += '&search=' + encodeURIComponent(search);
    api.get(url).then(function(res) {
      var container = document.getElementById('threads-container');
      if (!res || !res.data || !res.data.items || !res.data.items.length) {
        container.innerHTML = '<div class="empty-state" style="height:auto;padding:2rem"><span class="material-symbols-outlined icon">mail</span><p style="font-size:0.875rem">No conversations yet.</p><p style="font-size:0.75rem;color:var(--on-surface-variant)">Go to a profile and click Message to start one.</p></div>';
        return;
      }
      container.innerHTML = res.data.items.map(function(t) {
        var isUnread = t.lastMessage && !t.lastMessage.readAt && t.lastMessage.senderId !== state.userId;
        var otherUser = t.participant || {};
        var initial = (otherUser.fullName || '?').charAt(0).toUpperCase();
        return '<div class="conversation-item' + (isUnread ? ' unread' : '') + (t.id === state.currentThreadId && state.currentType === 'message' ? ' active' : '') + '" data-id="' + t.id + '" data-type="message">'
          + '<div class="avatar">' + (otherUser.avatarUrl ? '<img src="' + escapeHtml(otherUser.avatarUrl) + '" alt=""/>' : '<span>' + initial + '</span>') + '</div>'
          + '<div style="flex:1;min-width:0">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<span class="text-sm font-bold' + (isUnread ? '' : '') + '">' + escapeHtml(otherUser.fullName || 'Unknown') + '</span>'
          + (isUnread ? '<span class="unread-dot"></span>' : '')
          + '</div>'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<span class="text-xs" style="color:var(--on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px">' + escapeHtml(t.lastMessage ? t.lastMessage.body : (t.subject || 'No messages')) + '</span>'
          + '<span class="text-[10px]" style="color:var(--outline);flex-shrink:0">' + formatTime(t.lastMessageAt) + '</span>'
          + '</div></div></div>';
      }).join('');
      container.querySelectorAll('.conversation-item').forEach(function(el) {
        el.addEventListener('click', function() { openConversation(el.getAttribute('data-id'), el.getAttribute('data-type')); });
      });
    }).catch(function() {});
  }

  function loadDiscussions(search) {
    var url = '/discussions/threads?limit=50';
    if (search) url += '&q=' + encodeURIComponent(search);
    api.get(url).then(function(res) {
      var container = document.getElementById('discussions-container');
      if (!res || !res.data || !res.data.items || !res.data.items.length) {
        container.innerHTML = '<div class="empty-state" style="height:auto;padding:2rem"><span class="material-symbols-outlined icon">forum</span><p style="font-size:0.875rem">No discussions yet.</p><p style="font-size:0.75rem;color:var(--on-surface-variant)">Be the first to start a discussion!</p></div>';
        return;
      }
      container.innerHTML = res.data.items.map(function(t) {
        var author = t.user || {};
        var initial = (author.fullName || '?').charAt(0).toUpperCase();
        return '<div class="conversation-item' + (t.id === state.currentThreadId && state.currentType === 'discussion' ? ' active' : '') + '" data-id="' + t.id + '" data-type="discussion">'
          + '<div class="avatar">' + (author.avatarUrl ? '<img src="' + escapeHtml(author.avatarUrl) + '" alt=""/>' : '<span>' + initial + '</span>') + '</div>'
          + '<div style="flex:1;min-width:0">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<span class="text-sm font-bold">' + escapeHtml(t.title || 'Untitled') + '</span>'
          + '<span class="chat-type-badge">Discussion</span>'
          + '</div>'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
          + '<span class="text-xs" style="color:var(--on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px">' + escapeHtml((t.body || '').substring(0, 80)) + '</span>'
          + '<span class="text-[10px]" style="color:var(--outline);flex-shrink:0">' + (t.replyCount || 0) + ' replies</span>'
          + '</div></div></div>';
      }).join('');
      container.querySelectorAll('.conversation-item').forEach(function(el) {
        el.addEventListener('click', function() { openConversation(el.getAttribute('data-id'), el.getAttribute('data-type')); });
      });
    }).catch(function() {});
  }

  function openConversation(id, type) {
    state.currentThreadId = id;
    state.currentType = type;
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('chat-view').style.display = 'flex';

    document.querySelectorAll('.conversation-item').forEach(function(el) {
      el.classList.toggle('active', el.getAttribute('data-id') === id && el.getAttribute('data-type') === type);
    });

    if (type === 'message') {
      api.get('/messages/threads/' + id + '?limit=100').then(function(res) {
        if (!res || !res.data) return;
        renderMessageView(res.data);
        api.post('/messages/threads/' + id + '/read').catch(function(){});
        if (state.activeTab === 'messages') loadThreads(document.getElementById('search-input').value);
      }).catch(function() {});
    } else {
      api.get('/discussions/threads/' + id + '?limit=100').then(function(res) {
        if (!res || !res.data) return;
        renderDiscussionView(res.data);
      }).catch(function() {});
    }

    if (window.innerWidth <= 768) {
      document.getElementById('side-panel').classList.add('mobile-hide');
    }
  }

  function renderMessageView(data) {
    var thread = data.thread || {};
    var msgs = data.items || [];
    var otherUser = thread.userAId === state.userId ? thread.userB : thread.userA;
    if (!otherUser) otherUser = {};
    var initial = (otherUser.fullName || '?').charAt(0).toUpperCase();

    document.getElementById('chat-avatar').innerHTML = otherUser.avatarUrl ? '<img src="' + escapeHtml(otherUser.avatarUrl) + '" alt=""/>' : '<span>' + initial + '</span>';
    document.getElementById('chat-name').textContent = otherUser.fullName || 'Unknown';
    document.getElementById('chat-subtitle').innerHTML = '<span class="chat-type-badge">Message</span>' + (thread.subject ? ' &middot; ' + escapeHtml(thread.subject) : '');

    var container = document.getElementById('chat-messages');
    container.innerHTML = '';
    msgs.forEach(function(m) { container.appendChild(renderMessage(m, 'message')); });
    container.scrollTop = container.scrollHeight;
    document.getElementById('chat-input-area').style.display = '';
  }

  function renderDiscussionView(data) {
    var thread = data.thread || data;
    var replies = data.replies || data.items || [];
    var author = thread.user || {};
    var initial = (author.fullName || '?').charAt(0).toUpperCase();
    var title = thread.title || 'Discussion';

    document.getElementById('chat-avatar').innerHTML = author.avatarUrl ? '<img src="' + escapeHtml(author.avatarUrl) + '" alt=""/>' : '<span>' + initial + '</span>';
    document.getElementById('chat-name').textContent = title;
    document.getElementById('chat-subtitle').innerHTML = '<span class="chat-type-badge">Discussion</span> &middot; by ' + escapeHtml(author.fullName || 'Unknown');

    var container = document.getElementById('chat-messages');
    container.innerHTML = '';
    var firstMsg = renderMessage({ senderId: thread.UserId, body: thread.body, createdAt: thread.createdAt, flagged: thread.flagged }, 'discussion');
    firstMsg.classList.add('msg');
    container.appendChild(firstMsg);
    replies.forEach(function(r) { container.appendChild(renderMessage(r, 'discussion')); });
    container.scrollTop = container.scrollHeight;

    document.getElementById('chat-input-area').style.display = '';
  }

  function renderMessage(m, type) {
    var div = document.createElement('div');
    var isSent = type === 'message' && m.senderId === state.userId;
    var isFlagged = m.flagged;
    div.className = 'msg ' + (isSent ? 'sent' : 'received') + (isFlagged ? ' flagged' : '');

    var html = '';
    if (type === 'discussion' && m.senderId) {
      var senderName = m.sender ? m.sender.fullName : (m.senderId === state.userId ? 'You' : 'Someone');
      html += '<div class="text-xs font-bold" style="margin-bottom:0.25rem">' + escapeHtml(senderName) + '</div>';
    }
    html += '<div class="text-sm">' + escapeHtml(m.body) + '</div>';

    if (m.attachmentUrl) {
      var attachHtml = '';
      if (m.attachmentType && m.attachmentType.startsWith('image/')) {
        attachHtml = '<div class="attachment-preview"><img src="' + escapeHtml(m.attachmentUrl) + '" alt="attachment" onclick="window.open(\'' + escapeHtml(m.attachmentUrl) + '\')"/></div>';
      } else if (m.attachmentType && m.attachmentType.startsWith('audio/')) {
        attachHtml = '<div class="attachment-preview"><audio controls src="' + escapeHtml(m.attachmentUrl) + '" preload="metadata" style="width:100%">Your browser does not support audio.</audio></div>';
      } else {
        attachHtml = '<div class="attachment-preview"><div class="file-card" onclick="window.open(\'' + escapeHtml(m.attachmentUrl) + '\')"><span class="material-symbols-outlined icon">' + getFileIcon(m.attachmentType) + '</span><div style="flex:1;min-width:0"><p style="font-size:0.8rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(m.attachmentName || 'File') + '</p><p style="font-size:0.7rem;opacity:0.7">Click to download</p></div><span class="material-symbols-outlined" style="font-size:1.25rem">download</span></div></div>';
      }
      html += attachHtml;
    }

    if (isFlagged && !isSent) {
      html += '<div class="flagged-badge"><span class="material-symbols-outlined" style="font-size:0.75rem">flag</span> Flagged</div>';
    }
    html += '<div class="msg-time">' + formatTime(m.createdAt) + '</div>';
    div.innerHTML = html;
    return div;
  }

  function sendChatMessage() {
    var input = document.getElementById('message-input');
    var text = input.value.trim();
    if (!text && !state.fileAttachment) return;
    if (!state.currentThreadId || !state.currentType) return;

    var sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = true;

    if (state.currentType === 'message') {
      var payload = { body: text };
      if (state.fileAttachment) {
        payload.attachmentUrl = state.fileAttachment.url;
        payload.attachmentType = state.fileAttachment.type;
        payload.attachmentName = state.fileAttachment.name;
      }
      api.post('/messages/threads/' + state.currentThreadId + '/messages', payload)
        .then(function() {
          input.value = '';
          input.style.height = 'auto';
          clearFileAttachment();
          sendBtn.disabled = false;
          input.focus();
          openConversation(state.currentThreadId, state.currentType);
        })
        .catch(function(err) {
          sendBtn.disabled = false;
          alert((err && err.error && err.error.message) || 'Failed to send');
        });
    } else {
      api.post('/discussions/threads/' + state.currentThreadId + '/replies', { body: text })
        .then(function() {
          input.value = '';
          input.style.height = 'auto';
          sendBtn.disabled = false;
          input.focus();
          openConversation(state.currentThreadId, state.currentType);
        })
        .catch(function(err) {
          sendBtn.disabled = false;
          alert((err && err.error && err.error.message) || 'Failed to reply');
        });
    }
  }

  function closeChatView() {
    state.currentThreadId = null;
    state.currentType = null;
    document.getElementById('empty-state').style.display = '';
    document.getElementById('chat-view').style.display = 'none';
    document.getElementById('side-panel').classList.remove('mobile-hide');
    document.querySelectorAll('.conversation-item').forEach(function(el) { el.classList.remove('active'); });
  }

  function onFileSelected(input) {
    var file = input.files[0];
    if (!file) return;
    var maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) { alert('File too large (max 50MB)'); input.value = ''; return; }
    var allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/gzip'];
    if (!allowed.includes(file.type)) { alert('File type not supported'); input.value = ''; return; }

    var formData = new FormData();
    formData.append('file', file);
    api.upload('/messages/upload', formData).then(function(res) {
      if (res && res.data) {
        state.fileAttachment = { url: res.data.url, type: res.data.type, name: res.data.name, category: res.data.category };
        document.getElementById('file-name').textContent = file.name + ' (' + formatFileSize(file.size) + ')';
        document.getElementById('file-preview').style.display = '';
        document.getElementById('message-input').focus();
      }
      input.value = '';
    }).catch(function(err) {
      alert((err && err.error && err.error.message) || 'Upload failed');
      input.value = '';
    });
  }

  function clearFileAttachment() {
    state.fileAttachment = null;
    document.getElementById('file-preview').style.display = 'none';
    document.getElementById('file-name').textContent = '';
  }

  function init() {
    getUserId();
    if (!state.userId) return;

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { switchTab(btn.getAttribute('data-tab')); });
    });

    loadThreads();

    document.getElementById('search-input').addEventListener('input', function() {
      clearTimeout(this._timer);
      var self = this;
      this._timer = setTimeout(function() {
        if (state.activeTab === 'messages') loadThreads(self.value);
        else loadDiscussions(self.value);
      }, 300);
    });

    document.getElementById('send-btn').addEventListener('click', sendChatMessage);
    document.getElementById('message-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
    });

    state.pollingTimer = setInterval(function() {
      if (state.currentType === 'message') {
        loadThreads(document.getElementById('search-input').value);
      }
    }, 5000);
  }

  return { init: init, closeChatView: closeChatView, sendChatMessage: sendChatMessage, onFileSelected: onFileSelected, clearFileAttachment: clearFileAttachment, autoResize: autoResize };
})();

document.addEventListener('components-loaded', function() {
  var token = localStorage.getItem('token');
  if (!token) { window.location.href = '/login'; return; }
  ChatApp.init();
});