const db   = require('./database/db');
const Book = require('./models/book');
const BooksInLibraries = require('./models/booksinlibraries');
const Library = require('./models/library');

const ol = isbn => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const books = [
  { title: 'Clean Code', authors: 'Robert C. Martin', isbn: '9780132350884', genre: 'Programming', pages: 464, publicationyear: 2008, description: 'A handbook of agile software craftsmanship.', photo: ol('9780132350884') },
  { title: 'The Pragmatic Programmer', authors: 'Andrew Hunt, David Thomas', isbn: '9780201616224', genre: 'Programming', pages: 352, publicationyear: 1999, description: 'From journeyman to master.', photo: ol('9780201616224') },
  { title: 'Introduction to Algorithms', authors: 'Cormen, Leiserson, Rivest, Stein', isbn: '9780262033848', genre: 'Computer Science', pages: 1292, publicationyear: 2009, description: 'The classic algorithms textbook.', photo: ol('9780262033848') },
  { title: 'Design Patterns', authors: 'Gang of Four', isbn: '9780201633610', genre: 'Programming', pages: 395, publicationyear: 1994, description: 'Elements of reusable object-oriented software.', photo: ol('9780201633610') },
  { title: 'The Art of Computer Programming', authors: 'Donald E. Knuth', isbn: '9780201896831', genre: 'Computer Science', pages: 672, publicationyear: 1997, description: 'Fundamental algorithms by Knuth.', photo: ol('9780201896831') },
  { title: "You Don't Know JS", authors: 'Kyle Simpson', isbn: '9781491904244', genre: 'Programming', pages: 278, publicationyear: 2015, description: 'Deep dive into JavaScript.', photo: ol('9781491904244') },
  { title: 'Eloquent JavaScript', authors: 'Marijn Haverbeke', isbn: '9781593279509', genre: 'Programming', pages: 472, publicationyear: 2018, description: 'A modern introduction to programming with JavaScript.', photo: ol('9781593279509') },
  { title: 'Structure and Interpretation of Computer Programs', authors: 'Abelson, Sussman', isbn: '9780262510875', genre: 'Computer Science', pages: 657, publicationyear: 1996, description: 'Classic MIT intro to CS.', photo: ol('9780262510875') },
  { title: 'Operating System Concepts', authors: 'Silberschatz, Galvin, Gagne', isbn: '9781118063330', genre: 'Systems', pages: 944, publicationyear: 2012, description: 'The dinosaur book on operating systems.', photo: ol('9781118063330') },
  { title: 'Computer Networks', authors: 'Andrew S. Tanenbaum', isbn: '9780132126953', genre: 'Networking', pages: 960, publicationyear: 2010, description: 'A top-down approach to networking.', photo: ol('9780132126953') },
  { title: 'Database System Concepts', authors: 'Silberschatz, Korth, Sudarshan', isbn: '9780073523323', genre: 'Databases', pages: 1376, publicationyear: 2010, description: 'The standard database textbook.', photo: ol('9780073523323') },
  { title: 'Artificial Intelligence: A Modern Approach', authors: 'Russell, Norvig', isbn: '9780136042594', genre: 'Artificial Intelligence', pages: 1132, publicationyear: 2010, description: 'The most widely used AI textbook.', photo: ol('9780136042594') },
  { title: 'Deep Learning', authors: 'Goodfellow, Bengio, Courville', isbn: '9780262035613', genre: 'Artificial Intelligence', pages: 800, publicationyear: 2016, description: 'Comprehensive deep learning textbook.', photo: ol('9780262035613') },
  { title: 'The Mythical Man-Month', authors: 'Frederick P. Brooks Jr.', isbn: '9780201835953', genre: 'Software Engineering', pages: 336, publicationyear: 1995, description: 'Essays on software engineering.', photo: ol('9780201835953') },
  { title: 'Refactoring', authors: 'Martin Fowler', isbn: '9780201485677', genre: 'Programming', pages: 431, publicationyear: 1999, description: 'Improving the design of existing code.', photo: ol('9780201485677') },
  { title: 'Code Complete', authors: 'Steve McConnell', isbn: '9780735619678', genre: 'Programming', pages: 960, publicationyear: 2004, description: 'A practical handbook of software construction.', photo: ol('9780735619678') },
  { title: 'Compilers: Principles, Techniques and Tools', authors: 'Aho, Lam, Sethi, Ullman', isbn: '9780321486813', genre: 'Computer Science', pages: 1038, publicationyear: 2006, description: 'The Dragon Book on compilers.', photo: ol('9780321486813') },
  { title: 'Discrete Mathematics and Its Applications', authors: 'Kenneth H. Rosen', isbn: '9780073383095', genre: 'Mathematics', pages: 960, publicationyear: 2011, description: 'Discrete math for computer science students.', photo: ol('9780073383095') },
  { title: 'Linear Algebra and Its Applications', authors: 'David C. Lay', isbn: '9780321982384', genre: 'Mathematics', pages: 576, publicationyear: 2015, description: 'A modern introduction to linear algebra.', photo: ol('9780321982384') },
  { title: 'Python Crash Course', authors: 'Eric Matthes', isbn: '9781593279288', genre: 'Programming', pages: 544, publicationyear: 2019, description: 'A hands-on, project-based introduction to Python.', photo: ol('9781593279288') },
];

// Which books go to which library (by index in libraries array)
// Library 0: University of Crete — Heraklion (all books)
// Library 1: Technical University of Crete — Chania (first 12)
// Library 2: Hellenic Mediterranean University — Rethymno (books 5-16)
// Library 3: University of Crete — Rethymno Campus (last 12)
const DISTRIBUTION = [
  { libIndex: 0, bookIndices: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19] },
  { libIndex: 1, bookIndices: [0,1,2,3,4,5,6,7,8,9,10,11] },
  { libIndex: 2, bookIndices: [5,6,7,8,9,10,11,12,13,14,15,16] },
  { libIndex: 3, bookIndices: [8,9,10,11,12,13,14,15,16,17,18,19] },
];

async function seed() {
  await db.sync();

  const libraries = await Library.findAll({ order: [['id', 'ASC']] });
  if (!libraries.length) {
    console.log('No libraries found. Run node seed-libraries.js first.');
    process.exit(1);
  }

  // Create/update books
  let bookCreated = 0;
  const bookMap = {};
  for (const b of books) {
    const [book, wasCreated] = await Book.findOrCreate({
      where: { isbn: b.isbn },
      defaults: { ...b, available: true }
    });
    if (!wasCreated && !book.photo) {
      await book.update({ photo: b.photo });
    }
    bookMap[b.isbn] = book;
    if (wasCreated) bookCreated++;
  }
  console.log(`✓ Books: ${bookCreated} created, ${books.length - bookCreated} already exist.`);

  // Distribute to libraries
  let assigned = 0;
  for (const { libIndex, bookIndices } of DISTRIBUTION) {
    const lib = libraries[libIndex];
    if (!lib) continue;
    for (const bi of bookIndices) {
      const b = books[bi];
      const book = bookMap[b.isbn];
      if (!book) continue;
      const [, wasCreated] = await BooksInLibraries.findOrCreate({
        where: { book_id: book.id, library_id: lib.id },
        defaults: { available: true }
      });
      if (wasCreated) assigned++;
    }
    console.log(`✓ Library "${lib.name}": ${bookIndices.length} books assigned.`);
  }

  console.log(`\n✅ Done! ${bookCreated} new books, ${assigned} new library assignments.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
