var express = require('express');
var router = express.Router();

router.get('/product', function(req, res, next) {
    res.render('shop/product', {title: 'Product Page'});
  });
  
module.exports = router;