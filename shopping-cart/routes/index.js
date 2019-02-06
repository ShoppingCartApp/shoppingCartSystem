var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'Home Page' });
});

router.get('/product', function(req, res, next) {
  res.render('shop/product', {title: 'Product Page'});
});

module.exports = router;
