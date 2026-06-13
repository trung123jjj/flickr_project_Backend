// Run: node src/scripts/fix-avatars.js
// Resets broken avatar URLs to the default

require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');

const MONGO_URI = process.env.MONGO_URI;
const DEFAULT_AVATAR = 'https://static.thenounproject.com/png/anonymous-avatar-icon-2631891-512.png';

async function urlExists(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    }).on('error', () => resolve(false));
  });
}

async function main() {
  await mongoose.connect(MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

  const users = await User.find({});
  let fixed = 0;

  for (const user of users) {
    if (!user.avatar_url || user.avatar_url === DEFAULT_AVATAR) continue;
    const exists = await urlExists(user.avatar_url);
    if (!exists) {
      await User.updateOne({ _id: user._id }, { $set: { avatar_url: DEFAULT_AVATAR } });
      console.log(`Fixed: ${user.username} — ${user.avatar_url} (404)`);
      fixed++;
    }
  }

  console.log(`Done. Fixed ${fixed} broken avatars.`);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
