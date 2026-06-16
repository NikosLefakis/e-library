const db   = require('./database/db');
const Book = require('./models/book');

const covers = [
  { isbn: '9780132350884', photo: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg' },
  { isbn: '9780201616224', photo: 'https://covers.openlibrary.org/b/isbn/9780201616224-L.jpg' },
  { isbn: '9780262033848', photo: 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg' },
  { isbn: '9780201633610', photo: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg' },
  { isbn: '9780201896831', photo: 'https://covers.openlibrary.org/b/isbn/9780201896831-L.jpg' },
  { isbn: '9781491904244', photo: 'https://covers.openlibrary.org/b/isbn/9781491904244-L.jpg' },
  { isbn: '9781593279509', photo: 'https://covers.openlibrary.org/b/isbn/9781593279509-L.jpg' },
  { isbn: '9780262510875', photo: 'https://covers.openlibrary.org/b/isbn/9780262510875-L.jpg' },
  { isbn: '9781118063330', photo: 'https://covers.openlibrary.org/b/isbn/9781118063330-L.jpg' },
  { isbn: '9780132126953', photo: 'https://covers.openlibrary.org/b/isbn/9780132126953-L.jpg' },
  { isbn: '9780073523323', photo: 'https://covers.openlibrary.org/b/isbn/9780073523323-L.jpg' },
  { isbn: '9780136042594', photo: 'https://covers.openlibrary.org/b/isbn/9780136042594-L.jpg' },
  { isbn: '9780262035613', photo: 'https://covers.openlibrary.org/b/isbn/9780262035613-L.jpg' },
  { isbn: '9780201835953', photo: 'https://covers.openlibrary.org/b/isbn/9780201835953-L.jpg' },
  { isbn: '9780201485677', photo: 'https://covers.openlibrary.org/b/isbn/9780201485677-L.jpg' },
  { isbn: '9780735619678', photo: 'https://covers.openlibrary.org/b/isbn/9780735619678-L.jpg' },
  { isbn: '9780321486813', photo: 'https://covers.openlibrary.org/b/isbn/9780321486813-L.jpg' },
  { isbn: '9780073383095', photo: 'https://covers.openlibrary.org/b/isbn/9780073383095-L.jpg' },
  { isbn: '9780321982384', photo: 'https://covers.openlibrary.org/b/isbn/9780321982384-L.jpg' },
  { isbn: '9781593279288', photo: 'https://covers.openlibrary.org/b/isbn/9781593279288-L.jpg' },
];

async function run() {
  await db.sync();
  let updated = 0;
  for (const { isbn, photo } of covers) {
    const [n] = await Book.update({ photo }, { where: { isbn } });
    if (n > 0) { console.log(`✓ ${isbn}`); updated++; }
    else        { console.log(`– ${isbn} (not found)`); }
  }
  console.log(`\nDone! Updated ${updated} books.`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
