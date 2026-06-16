const db   = require('./database/db.js');
const User = require('./models/user.js');

db.sync().then(() => {
  return User.findOrCreate({
    where: { username: 'admin' },
    defaults: { password: 'admin123', role: 'administrator' }
  });
}).then(([user, created]) => {
  if (created) {
    console.log('✅ Admin user created!');
  } else {
    console.log('ℹ️  Admin user already exists.');
  }
  console.log('   Username : admin');
  console.log('   Password : admin123');
  console.log('   Role     : administrator');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
