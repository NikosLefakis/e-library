// ─── Page title / icon map for topbar ───────────────────────────────────────
const PAGE_TITLES = {
  books:        { title: 'Browse Books',       icon: 'fas fa-book' },
  borrowed:     { title: 'My Borrowings',      icon: 'fas fa-bookmark' },
  addbook:      { title: 'Add Book',           icon: 'fas fa-plus-circle' },
  users:        { title: 'Manage Users',       icon: 'fas fa-users' },
  stats:        { title: 'Statistics',         icon: 'fas fa-chart-pie' },
  libraries:    { title: 'Libraries',          icon: 'fas fa-building-columns' },
  manageborrow: { title: 'Manage Borrowings',  icon: 'fas fa-clipboard-list' },
  libbooks:     { title: 'My Library Books',   icon: 'fas fa-building-columns' },
  profile:      { title: 'My Profile',         icon: 'fas fa-user-circle' },
};

function updateTopbar(page) {
  const info = PAGE_TITLES[page] || { title: 'E-Library', icon: 'fas fa-home' };
  $('#topbar-title').text(info.title);
  $('#topbar-icon').html('<i class="' + info.icon + '"></i>');
}

function startClock() {
  function tick() {
    const now  = new Date();
    const time = now.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('el-GR', { weekday: 'short', day: 'numeric', month: 'short' });
    $('#topbar-time').text(date + '  ' + time);
  }
  tick();
  setInterval(tick, 30000);
}

// ─── Auth ────────────────────────────────────────────────────────────────────
function showAuth() {
  $('#auth-container').css('display', 'flex');
  $('#app-shell').hide();
  $('#app-footer').hide();
}

function showApp() {
  $('#auth-container').hide();
  $('#app-shell').css('display', 'flex');
  $('#app-footer').show();

  // Footer year
  $('#footer-year').text(new Date().getFullYear());

  // Reset all role-specific nav items first
  $('#nav-borrowed, #nav-profile').hide();
  $('#mgmt-label, #nav-addbook, #nav-libbooks, #nav-manageborrow').hide();
  $('#admin-label, #nav-users, #nav-libraries, #nav-stats').hide();
  $('#badge-pending').hide();

  const role   = getCookie('user_role') || 'guest';
  const userId = getCookie('user_id');

  $('#sb-role').text(role.charAt(0).toUpperCase() + role.slice(1));

  // Reset topbar user state
  $('#topbar-user-name').text('Guest');
  $('#topbar-avatar').text('G');

  if (userId) {
    getProfileInfo().then(info => {
      if (!info) return;
      const name = [info.firstname, info.lastname].filter(Boolean).join(' ') || info.username || 'User';
      $('#sb-username').text(name);

      // Sidebar avatar
      if (info.photo) {
        $('#sb-avatar').html('<img src="' + info.photo + '" style="width:38px;height:38px;border-radius:50%;object-fit:cover;display:block">');
      } else {
        $('#sb-avatar').text(name.charAt(0).toUpperCase());
      }

      // Topbar user pill
      $('#topbar-user-name').text(info.firstname || info.username || 'User');
      if (info.photo) {
        $('#topbar-avatar').html('<img src="' + info.photo + '">');
      } else {
        $('#topbar-avatar').text(name.charAt(0).toUpperCase());
      }
    }).catch(() => {});

    $('#nav-borrowed, #nav-profile').css('display', 'flex');
  } else {
    $('#sb-username').text('Guest');
    $('#sb-avatar').text('G');
  }

  if (role === 'librarian') {
    $('#mgmt-label').css('display', 'block');
    $('#nav-libbooks, #nav-manageborrow').css('display', 'flex');
  }
  if (role === 'administrator') {
    $('#mgmt-label').css('display', 'block');
    $('#nav-addbook, #nav-libbooks, #nav-manageborrow').css('display', 'flex');
    $('#admin-label').css('display', 'block');
    $('#nav-users, #nav-libraries, #nav-stats').css('display', 'flex');
    loadPendingBadge();
  }

  startClock();
}

// ─── Routes & navigation ─────────────────────────────────────────────────────
const routes = {
  books:        'pages/book/list/list_book.html',
  borrowed:     'pages/book/list/list_borrowed_books.html',
  addbook:      'pages/book/forms/create_book_form.html',
  users:        'pages/administrator/list_users.html',
  stats:        'pages/administrator/statistics.html',
  libraries:    'pages/administrator/list_libraries.html',
  manageborrow: 'pages/librarian/manage_borrowings.html',
  libbooks:     'pages/librarian/manage_books.html',
  profile:      'pages/user/profile.html',
};

function navigate(page) {
  if (!routes[page]) return;
  window.location.hash = page;
  $('.nav-item').removeClass('active');
  $('#nav-' + page).addClass('active');
  $('#app-load').html('<div class="spinner"></div>');
  $('#app-load').load(routes[page]);
  updateTopbar(page);
}

function registerPageLoad() {
  $('#load').load('pages/authentication/register.html');
}

// ─── Modals & toasts ─────────────────────────────────────────────────────────
function confirmDialog({ title, message, type = 'warning', okText = 'Confirm', cancelText = 'Cancel', onOk }) {
  const colors = { warning: '#f59e0b', danger: '#ef4444', info: '#3b82f6' };
  const icons  = { warning: 'fa-exclamation-triangle', danger: 'fa-trash-alt', info: 'fa-question-circle' };
  const color  = colors[type] || colors.warning;
  $('#confirm-icon').css({ background: color + '18', color }).html('<i class="fas ' + (icons[type] || icons.warning) + '"></i>');
  $('#confirm-title').text(title || 'Are you sure?');
  $('#confirm-msg').text(message || '');
  $('#confirm-ok').text(okText).css({ background: color });
  $('#confirm-cancel').text(cancelText);
  $('#confirm-overlay').css('display', 'flex');
  $('#confirm-ok').off('click').on('click', function() {
    $('#confirm-overlay').hide();
    if (onOk) onOk();
  });
  $('#confirm-cancel').off('click').on('click', function() {
    $('#confirm-overlay').hide();
  });
}

function openModal(title, html) {
  $('#modal-title').text(title);
  $('#modal-body').html(html);
  $('#modal-overlay').css('display', 'flex');
}
function closeModal() {
  $('#modal-overlay').hide();
  $('#modal-body').html('');
}

function toast(msg, type) {
  type = type || 'success';
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle' };
  const el = $('<div class="toast t-' + type + '"><i class="fas ' + icons[type] + ' t-icon"></i><span>' + msg + '</span></div>');
  $('#toast-box').append(el);
  setTimeout(() => el.fadeOut(300, function(){ $(this).remove(); }), 3500);
}

function loadPendingBadge() {
  getAllBorrowings().then(data => {
    if (!data || data.error) return;
    const count = data.filter(b => b.status === 'requested').length;
    const badge = document.getElementById('badge-pending');
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }).catch(() => {});
}

function logout() {
  document.cookie = 'user_id=;expires='   + new Date(0).toUTCString();
  document.cookie = 'user_role=;expires=' + new Date(0).toUTCString();
  showAuth();
  $('#load').load('pages/authentication/login.html');
}

// ─── Boot ────────────────────────────────────────────────────────────────────
$(document).ready(function() {
  if (getCookie('user_id') || getCookie('user_role') === 'guest') {
    showApp();
    const hash = window.location.hash.replace('#', '');
    navigate(routes[hash] ? hash : 'books');
  } else {
    showAuth();
    $('#load').load('pages/authentication/login.html');
  }
});
