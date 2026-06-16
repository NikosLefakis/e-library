const API_URL = "";   // relative — works on any host/port

function getCookie(name) {
  const val = decodeURIComponent(document.cookie);
  let result;
  val.split('; ').forEach(part => {
    if (part.indexOf(name + '=') === 0) result = part.substring(name.length + 1);
  });
  return result;
}

/* ── Auth ── */

async function login(formData) {
  const res  = await fetch(API_URL + '/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: formData
  });
  const data = await res.json();
  if (data.success) {
    document.cookie = 'user_id='   + data.user_id;
    document.cookie = 'user_role=' + data.user_role;
  }
  return data;
}

async function register(formData) {
  const res = await fetch(API_URL + '/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: formData
  });
  return res.json();
}

function guestLogin() {
  document.cookie = 'user_role=guest';
  showApp();
  navigate('books');
}

function logout() {
  document.cookie = 'user_id=;expires='   + new Date(0).toUTCString();
  document.cookie = 'user_role=;expires=' + new Date(0).toUTCString();
  showAuth();
  $('#load').load('pages/authentication/login.html');
}

/* ── Books ── */

async function listBooks(params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(API_URL + '/library/books' + qs);
  return res.json();
}

async function createBook(formData) {
  const res = await fetch(API_URL + '/library/books/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: formData
  });
  return res.json();
}

/* ── Borrowings ── */

async function listBorrowedBooks() {
  const res = await fetch(API_URL + '/library/books/borrowed');
  return res.json();
}

async function borrowBook(bookId, libraryId) {
  const body = {};
  if (libraryId) body.library_id = libraryId;
  const res = await fetch(API_URL + '/library/books/borrow/' + bookId, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return res.json();
}

async function returnBook(borrowingId) {
  const res = await fetch(API_URL + '/library/books/borrow/' + borrowingId + '/return', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

/* ── Reviews ── */

async function getBookReviews(bookId) {
  const res = await fetch(API_URL + '/library/books/review/book/' + bookId);
  return res.json();
}

async function createBookReview(bookId, content, score) {
  const res = await fetch(API_URL + '/library/books/review/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: bookId, content, reviewscore: score })
  });
  return res.json();
}

/* ── Users ── */

async function listUsers() {
  const res = await fetch(API_URL + '/user/list');
  return res.json();
}

function deleteUser(userId) {
  return fetch(API_URL + '/user/delete', {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
}

async function getProfileInfo() {
  const id = getCookie('user_id');
  if (!id) return null;
  const res = await fetch(API_URL + '/profile/info?user_id=' + id);
  return res.json();
}

async function updateProfile(userId, data) {
  const res = await fetch(API_URL + '/profile/settings/' + userId, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  return res.json();
}

/* ── Libraries ── */

async function listLibraries() {
  const res = await fetch(API_URL + '/libraries');
  return res.json();
}

async function createLibrary(data) {
  const res = await fetch(API_URL + '/libraries/create', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  return res.json();
}

async function getLibrariesForBook(bookId) {
  const res = await fetch(API_URL + '/libraries/book/' + bookId);
  return res.json();
}

async function getLibraryBooks(libraryId) {
  const res = await fetch(API_URL + '/libraries/' + libraryId + '/books');
  return res.json();
}

async function addBookToLibrary(libraryId, bookId) {
  const res = await fetch(API_URL + '/libraries/' + libraryId + '/books/add', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ book_id: bookId })
  });
  return res.json();
}

async function removeBookFromLibrary(libraryId, bookId) {
  const res = await fetch(API_URL + '/libraries/' + libraryId + '/books/' + bookId, {
    method: 'DELETE'
  });
  return res.json();
}

async function setBookAvailability(libraryId, bookId, available) {
  const res = await fetch(API_URL + '/libraries/' + libraryId + '/books/' + bookId + '/availability', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ available })
  });
  return res.json();
}

/* ── Borrowing management (librarian/admin) ── */

async function getAllBorrowings() {
  const res = await fetch(API_URL + '/borrowings/all');
  return res.json();
}

async function approveBorrowing(id) {
  const res = await fetch(API_URL + '/borrowings/' + id + '/approve', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

async function confirmReturn(id) {
  const res = await fetch(API_URL + '/borrowings/' + id + '/confirm-return', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

async function rejectBorrowing(id) {
  const res = await fetch(API_URL + '/borrowings/' + id + '/reject', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

/* ── Statistics ── */

async function getStats() {
  const res = await fetch(API_URL + '/stats/overview');
  return res.json();
}

/* ── Haversine distance (km) ── */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
