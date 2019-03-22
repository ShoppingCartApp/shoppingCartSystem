const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database( __dirname + '/cart.db',
    function(err) {
        if ( !err ) {
            db.serialize( function() {
                db.run(`
                    CREATE TABLE IF NOT EXISTS cart (
                        user_id INTEGER,
                        product_id INTERGER,
                        product_name TEXT,
                        product_image TEXT,
                        product_price REAL,
                        product_description TEXT,
                        product_qty INTEGER
                )`);
                console.log('opened cart.db');
            });
        }
    });


module.exports = db;