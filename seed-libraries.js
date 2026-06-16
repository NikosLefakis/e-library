/**
 * Seed script — creates test libraries in Crete and assigns books to them.
 * Run from the project root: node seed-libraries.js
 */

const db = require('./database/db');
const User = require('./models/user');
const Book = require('./models/book');
const Library = require('./models/library');
const BooksInLibraries = require('./models/booksinlibraries');

const libraries = [
  {
    name: 'University of Crete — Heraklion Library',
    address: 'Voutes, 700 13 Heraklion, Crete',
    lat: 35.3387,
    lon: 25.1342,
  },
  {
    name: 'Technical University of Crete — Chania Library',
    address: 'Akrotiri, 731 00 Chania, Crete',
    lat: 35.5138,
    lon: 24.0193,
  },
  {
    name: 'Hellenic Mediterranean University — Rethymno Library',
    address: 'Rethymno, 741 00 Crete',
    lat: 35.3667,
    lon: 24.4667,
  },
  {
    name: 'University of Crete — Rethymno Campus Library',
    address: 'Gallos, 741 00 Rethymno, Crete',
    lat: 35.3739,
    lon: 24.4710,
  },
];

async function seed() {
  try {
    await db.sync({ alter: true });
    console.log('✓ Database synced');

    // Find the librarian user (if any exists) to assign to first library
    const librarian = await User.findOne({ where: { role: 'librarian' } });

    for (const libData of libraries) {
      const [lib, created] = await Library.findOrCreate({
        where: { name: libData.name },
        defaults: {
          ...libData,
          librarian_id: librarian ? librarian.id : null
        }
      });
      console.log(`${created ? '✓ Created' : '· Exists'} library: ${lib.name}`);
    }

    // Assign all books to first library
    const allBooks = await Book.findAll();
    const firstLib = await Library.findOne();

    if (firstLib && allBooks.length > 0) {
      for (const book of allBooks) {
        const [, created] = await BooksInLibraries.findOrCreate({
          where: { book_id: book.id, library_id: firstLib.id },
          defaults: { available: true }
        });
        if (created) console.log(`  ✓ Added "${book.title}" to ${firstLib.name}`);
      }
    } else {
      console.log('  · No books to assign (add books first via the app)');
    }

    console.log('\n✅ Library seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
