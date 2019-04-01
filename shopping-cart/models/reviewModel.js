const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database( __dirname + '/reviews.db',
    function(err) {
        if ( !err ) {
            db.serialize( function() {
                db.run(`
                    CREATE TABLE IF NOT EXISTS reviews (
                        review_id INTEGER PRIMARY KEY,
                        username TEXT,
                        product_id INTERGER,
                        product_name TEXT,
                        comment TEXT
                )`);
                console.log('opened reviews.db');
            });
        }
    });


module.exports = db;