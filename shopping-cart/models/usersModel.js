  
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database( __dirname + '/users.db',
    function(err) {
        if ( !err ) {
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password TEXT,
                FName TEXT,
                LName TEXT,
                Email TEXT,
                admin INTEGER,
                cartItem INTEGER
            )`);
            console.log('opened users.db');
        }
    });

module.exports = db;