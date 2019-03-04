const sqlite3 = require('sqlite3').verbose();
var products_info = require('../shared/products');

const db = new sqlite3.Database( __dirname + '/products.db',
    function(err) {
        if ( !err ) {
            db.run(`
                CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                name TEXT,
                imagePath TEXT,
                description TEXT,
                rating INTEGER,
                price FLOAT
            )`);
            console.log('opened products.db');
        }
    });

for ( i = 0; i < products_info.length; i++ ) {
    db.run(`INSERT INTO products(name,imagePath,description,rating,price) VALUES(?,?,?,?,?)`, 
        [products_info.id, products_info.image, products_info.description, products_info.rating, products_info.price], 
        (err) => {
            if (err) {
                return console.log(err.message);
            }
            console.log('Adding data into products table');
        }
    );
}

module.exports = db;