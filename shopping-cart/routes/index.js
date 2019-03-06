var express = require('express');
var router = express.Router();
var db = require('../models/productModel');

/* GET home page. */
router.get('/', function (req, res, next) {
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

router.get('/shoppingcart', function(req, res, next) {
  res.render('shop/shoppingcart', {
    title: 'Shopping-cart',
  });
});

router.get('/checkout', function(req, res, next) {
  res.render('shop/checkout', {
    title: 'Check Out',
  });
});

router.get('/paysuccessfully', function(req, res, next) {
  res.render('shop/paysuccessfully', {
    title: 'Payment'
  });
})


module.exports = router;