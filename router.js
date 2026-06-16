const express = require('express');
const User = require('./models/user.js');
const Book = require('./models/book.js');
const BookReview = require('./models/bookreview.js');
const BookBorrowing = require('./models/bookborrowing.js');
const Library = require('./models/library.js');
const BooksInLibraries = require('./models/booksinlibraries.js');
const router = express.Router();
const Op = require('sequelize').Op;

/* ── Auth ── */

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ where: { username, password } })
        .then(user => {
            if (!user) return res.json({ success: false });
            res.cookie('user_id', user.id);
            res.cookie('user_role', user.role);
            res.json({ user_id: user.id, user_role: user.role, success: true });
        })
        .catch(err => res.json({ success: false, error: err.message }));
});

router.post('/auth/recover', (req, res) => {
    const { email } = req.body;
    if (!email) return res.json({ error: 'Email required' });
    User.findOne({ where: { email } })
        .then(user => {
            if (!user) return res.json({ found: false });
            res.json({ found: true, username: user.username });
        })
        .catch(err => res.json({ error: err.message }));
});

router.post('/auth/reset-password', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false });
    User.update({ password }, { where: { email } })
        .then(([n]) => res.json({ success: n > 0 }))
        .catch(err => res.json({ success: false, error: err.message }));
});

router.post('/login/guest', (req, res) => {
    res.cookie('user_role', 'guest');
    res.json({ success: true });
});

router.post('/register', (req, res) => {
    const { username, password, firstname, lastname, email, age, gender, address, phone, university, student_type } = req.body;
    User.create({ username, password, firstname, lastname, email, age, gender, address, phone, university, student_type, role: 'student' })
        .then(user => res.json({ success: true, user_id: user.id }))
        .catch(err => res.json({ success: false, error: err.message }));
});

router.get('/logout', (req, res) => {
    res.clearCookie('user_id');
    res.clearCookie('user_role');
    res.json({ success: true });
});

/* ── Users ── */

router.get('/user/list', (req, res) => {
    User.findAll({ attributes: { exclude: ['password'] } })
        .then(users => res.json(users));
});

router.delete('/user/delete', (req, res) => {
    const { user_id } = req.body;
    User.destroy({ where: { id: user_id } })
        .then(() => res.json({ success: true }))
        .catch(err => res.json({ success: false, error: err.message }));
});

router.put('/user/:id/update', (req, res) => {
    const { id } = req.params;
    const allowed = ['role', 'firstname', 'lastname', 'email'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    User.update(updates, { where: { id } })
        .then(() => res.json({ success: true }))
        .catch(err => res.json({ success: false, error: err.message }));
});

router.get('/profile/info', (req, res) => {
    const user_id = req.query.user_id || req.cookies.user_id;
    User.findOne({ where: { id: user_id }, attributes: { exclude: ['password'] } })
        .then(user => res.json(user))
        .catch(err => res.json({ error: err.message }));
});

router.put('/profile/settings/:user_id', (req, res) => {
    const { user_id } = req.params;
    const allowed = ['firstname','lastname','email','password','age','gender','address','phone','university','student_type','photo'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined && (f === 'photo' || req.body[f] !== '')) updates[f] = req.body[f]; });
    User.update(updates, { where: { id: user_id } })
        .then(() => res.json({ success: true }))
        .catch(err => res.json({ success: false, error: err.message }));
});

/* ── Books ── */

router.get('/library/books', (req, res) => {
    const { title, authors, genre, fromYear, toYear, fromPages, toPages } = req.query;
    const where = {};
    if (title) where.title = { [Op.like]: '%' + title + '%' };
    if (authors) where.authors = { [Op.like]: '%' + authors + '%' };
    if (genre) where.genre = genre;
    if (fromYear || toYear) {
        where.publicationyear = {};
        if (fromYear) where.publicationyear[Op.gte] = parseInt(fromYear);
        if (toYear)   where.publicationyear[Op.lte] = parseInt(toYear);
    }
    if (fromPages || toPages) {
        where.pages = {};
        if (fromPages) where.pages[Op.gte] = parseInt(fromPages);
        if (toPages)   where.pages[Op.lte] = parseInt(toPages);
    }
    Book.findAll({ where })
        .then(books => res.json(books))
        .catch(err => res.json({ error: err.message }));
});

router.post('/library/books/create', (req, res) => {
    const { title, description, isbn, authors, genre, pages, publicationyear, url, photo } = req.body;
    Book.create({ title, description, isbn, authors, genre, pages, publicationyear, url, photo })
        .then(book => res.json({ success: true, book }))
        .catch(err => res.json({ success: false, error: err.message }));
});

/* ── Reviews ── */

router.post('/library/books/review/create', (req, res) => {
    if (req.cookies.user_role === 'guest' || !req.cookies.user_id) {
        return res.json({ message: 'Guests cannot review books!', success: false });
    }
    const { book_id, content, reviewscore } = req.body;
    const user_id = req.cookies.user_id;
    BookBorrowing.findOne({ where: { user_id, book_id, status: 'successEnd' } })
        .then(borrowing => {
            if (!borrowing) {
                return res.json({ success: false, message: 'You can only review a book after completing a borrowing.' });
            }
            BookReview.create({ user_id, book_id, content, reviewscore })
                .then(review => res.json({ success: true, review }))
                .catch(err => res.json({ success: false, error: err.message }));
        })
        .catch(err => res.json({ success: false, error: err.message }));
});

router.get('/library/books/review/book/:book_id', (req, res) => {
    const book_id = req.params.book_id;
    BookReview.findAll({
        where: { book_id },
        include: [{ model: User, as: 'user', attributes: ['username'] }]
    })
    .then(reviews => res.json(reviews))
    .catch(() => BookReview.findAll({ where: { book_id } }).then(r => res.json(r)));
});

/* ── Borrowings (student) ── */

router.get('/library/books/borrowed', (req, res) => {
    const user_id = req.cookies.user_id;
    if (!user_id) return res.json([]);
    BookBorrowing.findAll({
        where: { user_id },
        include: [{ model: Book, as: 'book', attributes: ['title','authors','isbn','photo'] }],
        order: [['createdAt', 'DESC']]
    })
    .then(borrowings => {
        const result = borrowings.map(b => ({
            id: b.id,
            status: b.status,
            fromDate: b.fromDate,
            toDate: b.toDate,
            library_id: b.library_id,
            createdAt: b.createdAt,
            title: b.book ? b.book.title : '—',
            authors: b.book ? b.book.authors : '—',
            isbn: b.book ? b.book.isbn : '—',
            photo: b.book ? b.book.photo : null,
            book_id: b.book_id
        }));
        res.json(result);
    })
    .catch(err => res.json({ error: err.message }));
});

router.post('/library/books/borrow/:book_id', (req, res) => {
    const { book_id } = req.params;
    const user_id = req.cookies.user_id;
    const { library_id } = req.body;

    if (!user_id) return res.json({ success: false, message: 'Not logged in' });

    BookBorrowing.findOne({
        where: { user_id, book_id, status: { [Op.in]: ['requested', 'borrowed'] } }
    }).then(existing => {
        if (existing) return res.json({ success: false, message: 'You already have an active request for this book.' });

        const fromDate = new Date();
        const toDate = new Date(fromDate);
        toDate.setMonth(toDate.getMonth() + 1);

        const borrowData = { book_id, user_id, status: 'requested', fromDate, toDate };
        if (library_id) borrowData.library_id = library_id;

        BookBorrowing.create(borrowData)
            .then(bb => {
                if (library_id) {
                    BooksInLibraries.update(
                        { available: false },
                        { where: { book_id, library_id, available: true } }
                    ).catch(() => {});
                }
                res.json({ success: true, borrowing: bb });
            })
            .catch(err => res.json({ success: false, error: err.message }));
    });
});

router.put('/library/books/borrow/:id/return', (req, res) => {
    const { id } = req.params;
    const user_id = req.cookies.user_id;
    BookBorrowing.findOne({ where: { id, user_id, status: 'borrowed' } })
        .then(bb => {
            if (!bb) return res.json({ success: false, message: 'Borrowing not found or not in borrowed state' });
            bb.status = 'returned';
            bb.save().then(() => res.json({ success: true }));
        })
        .catch(err => res.json({ success: false, error: err.message }));
});

/* ── Borrowings (librarian/admin management) ── */

router.get('/borrowings/all', (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator' && role !== 'librarian') {
        return res.json({ success: false, message: 'Access denied' });
    }
    const user_id = req.cookies.user_id;

    if (role === 'librarian') {
        Library.findOne({ where: { librarian_id: user_id } })
            .then(lib => {
                if (!lib) return res.json([]);
                BookBorrowing.findAll({
                    where: { library_id: lib.id },
                    include: [
                        { model: Book, as: 'book', attributes: ['title','authors','isbn'] },
                        { model: User, as: 'user', attributes: ['username','firstname','lastname','email'] }
                    ],
                    order: [['createdAt', 'DESC']]
                }).then(borrowings => res.json(borrowings));
            });
    } else {
        BookBorrowing.findAll({
            include: [
                { model: Book, as: 'book', attributes: ['title','authors','isbn'] },
                { model: User, as: 'user', attributes: ['username','firstname','lastname','email'] }
            ],
            order: [['createdAt', 'DESC']]
        }).then(borrowings => res.json(borrowings));
    }
});

router.put('/borrowings/:id/approve', (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator' && role !== 'librarian') {
        return res.json({ success: false, message: 'Access denied' });
    }
    const { id } = req.params;
    BookBorrowing.findByPk(id)
        .then(bb => {
            if (!bb) return res.json({ success: false, message: 'Not found' });
            if (bb.status !== 'requested') return res.json({ success: false, message: 'Can only approve requested borrowings' });
            bb.status = 'borrowed';
            bb.save().then(() => res.json({ success: true }));
        })
        .catch(err => res.json({ success: false, error: err.message }));
});

router.put('/borrowings/:id/confirm-return', (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator' && role !== 'librarian') {
        return res.json({ success: false, message: 'Access denied' });
    }
    const { id } = req.params;
    BookBorrowing.findByPk(id)
        .then(bb => {
            if (!bb) return res.json({ success: false, message: 'Not found' });
            if (bb.status !== 'returned') return res.json({ success: false, message: 'Can only confirm returned borrowings' });
            bb.status = 'successEnd';
            bb.save().then(() => {
                if (bb.library_id) {
                    BooksInLibraries.update(
                        { available: true },
                        { where: { book_id: bb.book_id, library_id: bb.library_id, available: false } }
                    ).catch(() => {});
                }
                res.json({ success: true });
            });
        })
        .catch(err => res.json({ success: false, error: err.message }));
});

router.put('/borrowings/:id/reject', (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator' && role !== 'librarian') {
        return res.json({ success: false, message: 'Access denied' });
    }
    const { id } = req.params;
    BookBorrowing.findByPk(id)
        .then(bb => {
            if (!bb) return res.json({ success: false, message: 'Not found' });
            if (bb.status !== 'requested') return res.json({ success: false, message: 'Can only reject requested borrowings' });
            bb.destroy().then(() => res.json({ success: true }));
        })
        .catch(err => res.json({ success: false, error: err.message }));
});

/* ── Libraries ── */

router.get('/libraries', (req, res) => {
    Library.findAll()
        .then(libs => res.json(libs))
        .catch(err => res.json({ error: err.message }));
});

router.post('/libraries/create', (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator') return res.json({ success: false, message: 'Admin only' });
    const { name, address, lat, lon, librarian_id } = req.body;
    Library.create({ name, address, lat, lon, librarian_id })
        .then(lib => res.json({ success: true, library: lib }))
        .catch(err => res.json({ success: false, error: err.message }));
});

router.put('/libraries/:id', (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator') return res.json({ success: false, message: 'Admin only' });
    const { id } = req.params;
    const { name, address, lat, lon, librarian_id } = req.body;
    Library.update({ name, address, lat, lon, librarian_id }, { where: { id } })
        .then(() => res.json({ success: true }))
        .catch(err => res.json({ success: false, error: err.message }));
});

/* ── Books in Libraries ── */

router.get('/libraries/book/:book_id', (req, res) => {
    const { book_id } = req.params;
    BooksInLibraries.findAll({
        where: { book_id },
        include: [{ model: Library, as: 'library' }]
    })
    .then(rows => res.json(rows))
    .catch(err => res.json({ error: err.message }));
});

router.get('/libraries/:library_id/books', (req, res) => {
    const { library_id } = req.params;
    BooksInLibraries.findAll({
        where: { library_id },
        include: [{ model: Book, as: 'book' }]
    })
    .then(rows => res.json(rows))
    .catch(err => res.json({ error: err.message }));
});

router.post('/libraries/:library_id/books/add', (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator' && role !== 'librarian') {
        return res.json({ success: false, message: 'Access denied' });
    }
    const { library_id } = req.params;
    const { book_id } = req.body;
    BooksInLibraries.findOrCreate({
        where: { book_id, library_id },
        defaults: { available: true }
    })
    .then(([row, created]) => res.json({ success: true, created }))
    .catch(err => res.json({ success: false, error: err.message }));
});

router.delete('/libraries/:library_id/books/:book_id', (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator' && role !== 'librarian') {
        return res.json({ success: false, message: 'Access denied' });
    }
    const { library_id, book_id } = req.params;
    BooksInLibraries.destroy({ where: { library_id, book_id } })
        .then(() => res.json({ success: true }))
        .catch(err => res.json({ success: false, error: err.message }));
});

router.put('/libraries/:library_id/books/:book_id/availability', (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator' && role !== 'librarian') {
        return res.json({ success: false, message: 'Access denied' });
    }
    const { library_id, book_id } = req.params;
    const { available } = req.body;
    BooksInLibraries.update({ available }, { where: { library_id, book_id } })
        .then(() => res.json({ success: true }))
        .catch(err => res.json({ success: false, error: err.message }));
});

/* ── Statistics ── */

router.get('/stats/overview', async (req, res) => {
    const role = req.cookies.user_role;
    if (role !== 'administrator') return res.json({ success: false, message: 'Admin only' });

    try {
        const totalBooks     = await Book.count();
        const totalUsers     = await User.count({ where: { role: 'student' } });
        const totalLibraries = await Library.count();
        const totalBorrowings = await BookBorrowing.count();

        const books = await Book.findAll({ attributes: ['genre'] });
        const genreMap = {};
        books.forEach(b => {
            const g = b.genre || 'Unknown';
            genreMap[g] = (genreMap[g] || 0) + 1;
        });
        const booksPerGenre = Object.entries(genreMap).map(([genre, count]) => ({ genre, count }));

        const bil = await BooksInLibraries.findAll({ include: [{ model: Library, as: 'library' }] });
        const libMap = {};
        bil.forEach(row => {
            const name = row.library ? row.library.name : 'Unknown';
            libMap[name] = (libMap[name] || 0) + 1;
        });
        const booksPerLibrary = Object.entries(libMap).map(([name, count]) => ({ name, count }));

        const studentTypes = await User.findAll({ where: { role: 'student' }, attributes: ['student_type'] });
        const typeMap = {};
        studentTypes.forEach(u => {
            const t = u.student_type || 'unspecified';
            typeMap[t] = (typeMap[t] || 0) + 1;
        });
        const studentsByType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

        res.json({ totalBooks, totalUsers, totalLibraries, totalBorrowings, booksPerGenre, booksPerLibrary, studentsByType });
    } catch (err) {
        res.json({ error: err.message });
    }
});

module.exports = router;
