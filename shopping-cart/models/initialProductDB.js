for (let i = 0; i < products_info.length; i++ ) {
    db.run('INSERT INTO products(name,imagePath,description,rating,price) VALUES(?,?,?,?,?)', 
        [products_info[i].name, products_info[i].image, products_info[i].description, products_info[i].rating, products_info[i].price], 
        (err) => {
            if (err) {
                return console.log(err.message);
            }
        }
    );
}