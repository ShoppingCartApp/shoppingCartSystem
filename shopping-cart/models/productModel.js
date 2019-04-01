const sqlite3 = require('sqlite3').verbose();
var products_info = require('../shared/products');

const db = new sqlite3.Database( __dirname + '/products.db',
    function(err) {
        if ( !err ) {
            db.serialize( function() {
                db.run(`
                    CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY,
                    name TEXT,
                    imagePath TEXT,
                    description TEXT,
                    rating INTEGER,
                    rating_num INTEGER,
                    price FLOAT,
                    star_5 INTEGER,
                    star_4 INTEGER,
                    star_3 INTEGER,
                    star_2 INTEGER,
                    star_1 INTEGER
                )`);
                console.log('opened products.db');
            });
        }
    });


module.exports = db;