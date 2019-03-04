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


module.exports = router;