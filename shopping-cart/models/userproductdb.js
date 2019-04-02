const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database( __dirname + '/userproducts.db',
    function(err) {
        if ( !err ) {
            db.serialize( function() {
                db.run(`
                    CREATE TABLE IF NOT EXISTS userproducts (
                        username TEXT,
                        product_id INTERGER,
                        product_name TEXT,
                        product_image TEXT
                )`);
                console.log('opened userproducts.db');
            });
        }
    });


module.exports = db;