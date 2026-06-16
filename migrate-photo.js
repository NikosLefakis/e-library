const db = require('./database/db');

async function migrate() {
  await db.sync();
  try {
    await db.query("ALTER TABLE users ADD COLUMN photo TEXT;");
    console.log("Added 'photo' column to users table.");
  } catch (e) {
    if (e.message && e.message.includes('duplicate column')) {
      console.log("Column 'photo' already exists, skipping.");
    } else {
      console.error(e.message);
    }
  }
  process.exit(0);
}

migrate();
