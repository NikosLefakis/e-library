function showAuth() {
  $('#auth-container').css('display', 'flex');
  $('#app-shell').hide();
}

function showApp() {
  $('#auth-container').hide();
  $('#app-shell').css('display', 'flex');

  const role   = getCookie('user_role') || 'guest';
  const userId = getCookie('user_id');

  $('#sb-role').text(role.charAt(0).toUpperCase() + role.slice(1));

  if (userId) {
    getProfileInfo().then(info => {
      if (!info) return;
      const name = [info.firstname, info.lastname].filter(Boolean).join(' ') || info.username || 'User';
      $('#sb-username').text(name);
      $('#sb-avatar').text(name.charAt(0).toUpperCase());
    }).catch(() => {});
    $('#nav-borrowed, #nav-profile').css('display', 'flex');
  } else {
    $('#sb-username').text('Guest');
    $('#sb-avatar').text('G');
  }

  if (role === 'administrator' || role === 'librarian') {
    $('#mgmt-label, #nav-addbook, #nav-libbooks, #nav-manageborrow').css('display', 'flex');
    $('#mgmt-label').css('display', 'block');
  }
  if (role === 'administrator') {
    $('#admin-label').css('display', 'block');
    $('#nav-users, #nav-libraries, #nav-stats').css('display', 'flex');
  }
}

function navigate(page) {
  $('.nav-item').removeClass('active');
  $('#nav-' + page).addClass('active');
  $('#app-load').html('<div class="spinner"></div>');
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
  if (routes[page]) $('#app-load').load(routes[page]);
}

function registerPageLoad() {
  $('#load').load('pages/authentication/register.html');
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

function logout() {
  document.cookie = 'user_id=;expires='   + new Date(0).toUTCString();
  document.cookie = 'user_role=;expires=' + new Date(0).toUTCString();
  showAuth();
  $('#load').load('pages/authentication/login.html');
}

$(document).ready(function() {
  if (getCookie('user_id') || getCookie('user_role') === 'guest') {
    showApp();
    navigate('books');
  } else {
    showAuth();
    $('#load').load('pages/authentication/login.html');
  }
});
