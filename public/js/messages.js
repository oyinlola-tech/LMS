function escapeHtml(t) { var d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML; }

function formatTime(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  var now = new Date();
  var opts = { hour: 'numeric', minute: '2-digit' };
  if (d.toDateString() !== now.toDateString()) {
    (opts as any).month = 'short';
    (opts as any).day = 'numeric';
  }
  return d.toLocaleTimeString('en-US', opts);
}

var currentThreadId = null;
var userId = null;
var pollingInterval = null;

function getUserId() {
  try { var p = JSON.parse(atob(localStorage.getItem('token').split('.')[1])); userId = p.sub; } catch(e) {}
}

function loadThreads(search) {
  var url = '/messages/threads?limit=50';
  if (search) url += '&search=' + encodeURIComponent(search);
  api.get(url).then(function(res) {
    var container = document.getElementById('threads-container');
    if (!res || !res.data || !res.data.items || !res.data.items.length) {
      container.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--on-surface-variant)"><p>No conversations yet.</p><p class="text-xs mt-2">Go to a profile and click Message to start one.</p></div>';
      return;
    }
    var html = '';
    res.data.items.forEach(function(t) {
      var isUnread = t.lastMessage && !t.lastMessage.readAt && t.lastMessage.senderId !== userId;
      html += '<div class="thread-item' + (isUnread ? ' unread' : '') + (t.id === currentThreadId ? ' active' : '') + '" data-thread-id="' + t.id + '">'
        + '<div class="thread-avatar" style="background-image:url(' + (t.participant.avatarUrl || '/img/placeholder.svg') + ')"></div>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span class="text-sm font-bold' + (isUnread ? '' : '') + '">' + escapeHtml(t.participant.fullName) + '</span>'
        + (isUnread ? '<span class="unread-dot"></span>' : '')
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<span class="text-xs" style="color:var(--on-surface-variant);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px">' + escapeHtml(t.lastMessage ? t.lastMessage.body : (t.subject || 'No messages')) + '</span>'
        + '<span class="text-[10px]" style="color:var(--outline);flex-shrink:0">' + formatTime(t.lastMessageAt) + '</span>'
        + '</div>'
        + '</div></div>';
    });
    container.innerHTML = html;

    container.querySelectorAll('.thread-item').forEach(function(el) {
      el.addEventListener('click', function() {
        openThread(el.getAttribute('data-thread-id'));
      });
    });
  }).catch(function() {});
}

function openThread(threadId) {
  currentThreadId = threadId;
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('chat-view').style.display = 'flex';

  document.querySelectorAll('.thread-item').forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-thread-id') === threadId);
  });

  api.get('/messages/threads/' + threadId + '?limit=100').then(function(res) {
    if (!res || !res.data) return;
    var data = res.data;
    var thread = data.thread;
    var msgs = data.items || [];

    var otherUser = thread.userAId === userId ? thread.userB : thread.userA;
    var header = document.getElementById('chat-header');
    header.innerHTML = '<div class="thread-avatar" style="background-image:url(' + (otherUser.avatarUrl || '/img/placeholder.svg') + ')"></div>'
      + '<div><p class="font-bold text-sm">' + escapeHtml(otherUser.fullName) + '</p>'
      + (thread.subject ? '<p class="text-xs" style="color:var(--on-surface-variant)">' + escapeHtml(thread.subject) + '</p>' : '')
      + '</div>';

    var container = document.getElementById('chat-messages');
    container.innerHTML = '';
    msgs.forEach(function(m) {
      container.appendChild(renderMessage(m));
    });
    container.scrollTop = container.scrollHeight;

    api.post('/messages/threads/' + threadId + '/read').catch(function(){});
    loadThreads();
  }).catch(function() {});
}

function renderMessage(m) {
  var div = document.createElement('div');
  var isSent = m.senderId === userId;
  div.className = 'msg ' + (isSent ? 'sent' : 'received');
  div.innerHTML = '<div class="text-sm">' + escapeHtml(m.body) + '</div>'
    + '<div class="msg-time">' + formatTime(m.createdAt) + '</div>';
  return div;
}

function sendMessage() {
  var input = document.getElementById('message-input');
  var text = input.value.trim();
  if (!text || !currentThreadId) return;
  input.disabled = true;

  api.post('/messages/threads/' + currentThreadId + '/messages', { body: text })
    .then(function() {
      input.value = '';
      input.disabled = false;
      input.focus();
      openThread(currentThreadId);
    })
    .catch(function(err) {
      input.disabled = false;
      alert((err && err.error && err.error.message) || 'Failed to send');
    });
}

function updateAuthUI() {
  var token = localStorage.getItem('token');
  if (!token) { window.location.href = '/login'; return; }
  getUserId();
  loadThreads();

  var loginBtn = document.getElementById('header-login');
  var joinBtn = document.getElementById('header-join');
  var profileBtn = document.getElementById('header-profile');
  var logoutBtn = document.getElementById('header-logout');
  if (token && profileBtn && logoutBtn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (joinBtn) joinBtn.style.display = 'none';
    profileBtn.style.display = 'flex';
    logoutBtn.style.display = 'flex';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
});

document.addEventListener('components-loaded', function() {
  var headerProfile = document.getElementById('header-profile');
  if (headerProfile) {
    var token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
  }

  document.getElementById('search-input').addEventListener('input', function() {
    clearTimeout(this._timer);
    var self = this;
    this._timer = setTimeout(function() { loadThreads(self.value); }, 300);
  });

  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('message-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
  });

  pollingInterval = setInterval(function() {
    loadThreads(document.getElementById('search-input').value);
  }, 5000);
});
