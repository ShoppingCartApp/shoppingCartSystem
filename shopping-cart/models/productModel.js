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
                    price FLOAT
                )`);
                console.log('opened products.db');
                for (let i = 0; i < products_info.length; i++ ) {
                    db.run('INSERT INTO products(name,imagePath,description,rating,price) VALUES(?,?,?,?,?)', 
                        [products_info[i].name, products_info[i].image, products_info[i].description, products_info[i].rating, products_info[i].price], 
                        (err) => {
                            if (err) {
                                return console.log(err.message);
                            }
                            console.log('Adding data into products table', products_info[i], i);
                        }
                    );
                }
            });
        }
    });


module.exports = db;