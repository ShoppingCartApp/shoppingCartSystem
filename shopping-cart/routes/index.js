var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
var db = require('../models/productModel');
var cartdb = require('../models/cart');
var reviewdb = require('../models/reviewModel');

/* GET home page. */
router.get('/products', function (req, res, next) {
  db.all('SELECT * FROM products', [], function (err, rows) {
    if (!err) {
      res.type('.html'); // set content type to html
      res.render('shop/index', {
        title: 'Home Page',
        products: rows
      });
    }
  });
});

router.get('/product/:id', function (req, res, next) {
  let id = parseInt(req.params.id);
  db.get('SELECT * FROM products WHERE id=?', [id], function (err, row) {
    if (!err) {
      req.session.product = id;
      res.type('.html'); // set content type to html
      res.render('shop/product', {
        title: 'Product Page',
        product: row
      });
    }
  });
});

router.post('/rating', jsonParser, function (req, res, next) {
  let obj = req.body;
  console.log(obj);
  db.serialize(function () {
    db.get('SELECT * FROM products WHERE name=?', [obj.pname], function (err, row) {
      let rating_num = row.rating_num + 1;
      let currentRating = Math.floor((obj.rating + row.rating*rating_num) / rating_num);
      console.log(row.rating);
      console.log(" Current Rating:", currentRating);
      db.run('UPDATE products SET rating_num=? WHERE name=?', [rating_num, obj.pname], function(err, row) {
        console.log("rating num:", rating_num);
      });
      db.run('UPDATE products SET rating=? WHERE name=?', [currentRating, obj.pname], function (err, row) {
        res.send();
      });
    });
  });
});

/** 
router.post('/review', jsonParser, function(req, res, next) {
  let comment = req.body;
  console.log(comment);
  reviewdb.serialize(function() {
    reviewdb.run('INSERT INTO reviews(username, product_id, comment) VALUES(?,?,?)', 
      [req.session.user.username, req.session.product, comment]);
    reviewdb.get('SELECT last_insert_rowid()', [], function (err, row) {
      if(!err) {
        console.log(row);
        res.redirect('/product/:id');
      }
    });
  });

});
*/

router.get('/shoppingcart', function (req, res, next) {
  let totalPrice = 0;
  cartdb.all('SELECT * FROM cart WHERE username=?', [req.session.user.username], function (err, rows) {
    if (!err) {
      for (let i = 0; i < rows.length; i++) {
        totalPrice += rows[i].product_price * rows[i].product_qty;
        totalPrice = Math.round(totalPrice * 100) / 100;
      }
      res.type('.html'); // set content type to html
      res.render('shop/shoppingcart', {
        title: 'Shopping-cart',
        products: rows,
        totalPrice: totalPrice
      });
    }
  });
});

router.post('/deleteSingleProduct',jsonParser, function (req, res, next) {
  console.log(req.session.user);
  let pname = req.body;
  console.log("recieved",pname);
  cartdb.run(`DELETE FROM cart WHERE username=? AND product_name=?`, [req.session.user.username, pname.pname], function (err) {
    if (!err) {
      res.send({url: '/shoppingcart'});
    }
    else {
      console.log(err);
    }
    console.log("delete", pname);
  });
});

router.post('/updateQty', jsonParser, function(req, res, next) {
  let qty = req.body.qty;
  let pname = req.body.pname;
  let cartid = parseInt(req.body.cartid);
  console.log(qty, pname, cartid);
  cartdb.run('UPDATE cart SET product_qty=? WHERE item_id=?', [qty, cartid], function(err, row) {
    if(!err) {
      res.send({url: '/shoppingcart'});
    }
    else {
      console.log(err);
    }
    console.log("Update to", qty);
  });
});

router.post('/add-to-cart/:id', jsonParser, function (req, res) {
  let id = parseInt(req.params.id);
  const product = req.body;
  cartdb.serialize(function () {
    cartdb.run('INSERT INTO cart(username, product_id, product_name, product_price, product_image, product_description, product_qty) VALUES(?,?,?,?,?,?,?)',
      [req.session.user.username, product.pid, product.productName, product.productPrice, product.image, product.description, product.qty]);
    cartdb.get('SELECT last_insert_rowid()', [], function (err, row) {
      if (!err) {
        console.log(row);
        let id = row['last_insert_rowid()'];
        let p = {
          id: id
        };
        req.session.totalQty += 1;
        res.send(p);
      }
    });
  });
});

router.get('/checkout', jsonParser, function (req, res, next) {
  let totalPrice = 0;
  cartdb.all('SELECT * FROM cart WHERE username=?', [req.session.user.username], function (err, rows) {
    if (!err) {
      req.session.bought = rows;
      for (let i = 0; i < rows.length; i++) {
        totalPrice += rows[i].product_price * rows[i].product_qty;
        totalPrice = Math.round(totalPrice * 100) / 100;
      }
      res.render('shop/checkout', {
        title: 'Check Out',
        items: rows,
        user: req.session.user,
        totalPrice: totalPrice
      });
    }
  });
});

router.delete('/checkoutsuccessfully', jsonParser, function (req, res, next) {
  cartdb.run(`DELETE FROM cart WHERE username=?`, [req.session.user.username], function (err) {
    if (!err) {
      console.log("deleted");
      res.render('shop/thankyou', {
        title: 'Check out successfully',
        status: "deleted cart items"
      });
    }
  });
});

router.get('/thankyou', function (req, res, next) {
  res.render('shop/thankyou', {
    title: 'Thank you',
    items: req.session.bought,
    user: req.session.user.username
  });
});

module.exports = router;