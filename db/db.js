//db.js
const sqlite3 = require('sqlite3');


const db = new sqlite3.Database('credentials.db', (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('Connected to the access database.')
});

module.exports = db;
