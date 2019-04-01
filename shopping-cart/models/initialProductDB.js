for (let i = 0; i < products_info.length; i++ ) {
    db.run('INSERT INTO products(name,imagePath,description,rating,rating_num, price,star_5,star_4,star_3,star_2,star_1) VALUES(?,?,?,?,?,?,?,?,?,?,?)', 
        [products_info[i].name, products_info[i].image, products_info[i].description, 
            products_info[i].rating, products_info[i].rating_num, products_info[i].price,
            products_info[i].star_5, products_info[i].star_4, products_info[i].star_3, products_info[i].star_2, products_info[i].star_1], 
        (err) => {
            if (err) {
                return console.log(err.message);
            }
        }
    );
}