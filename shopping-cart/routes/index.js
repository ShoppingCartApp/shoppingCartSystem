var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
var db = require('../models/productModel');
var cartdb = require('../models/cart');
var userdb = require('../models/usersModel');
var Cart = require('../models/cart');
const sha256 = require('sha-256-js');

/* GET home page. */
router.get('/product/:user', function (req, res, next) {
  let u = req.params.user;
  db.all('SELECT * FROM products', [], function (err, rows) {
    if(!err) {
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
      res.type('.html'); // set content type to html
      res.render('shop/product', {
        title: 'Product Page',
        product: row
      });
    }
  });
});

router.get('/shoppingcart', function (req, res, next) {
  cartdb.all('SELECT * FROM cart', function (err, rows) {
    if (!err) {
      res.type('.html'); // set content type to html
      res.render('shop/shoppingcart', {
        title: 'Shopping-cart',
        products: rows
      });
      console.log(rows);
    }
  });
});

router.post('/add-to-cart/:id',  jsonParser,function(req, res) {
  let id = parseInt(req.params.id);
  const product = req.body;
  console.log(product);
  cartdb.serialize( function() {
    cartdb.run('INSERT INTO cart(product_id, product_name, product_price, product_image, product_description, product_qty) VALUES(?,?,?,?,?,?)', 
    [product.pid, product.productName, product.productPrice, product.image, product.description, product.qty]);
    cartdb.get('SELECT last_insert_rowid()', [], function(err,row) {
      if (!err) {
        console.log(row);
        let id = row['last_insert_rowid()'];
        let p = {id : id};
        res.send(p);
      }
    });
  });
});

router.get('/checkout', function (req, res, next) {
  cartdb.all('SELECT * FROM cart', function(err, rows) {
    if(!err) {
      res.render('shop/checkout', {
        title: 'Check Out',
        items: rows
      });
    }
  });
});

router.get('/thankyou', function (req, res, next) {
  cartdb.all('SELECT * FROM cart', function(err, rows) {
    if(!err) {
      res.render('shop/thankyou', {
        title: 'Thank you',
        items: rows
      });
    }
  });
});

router.get('/', function(req, res, next) {
  res.render('user/login', {
    title: "Login Page"
  });
});

router.get('/user/register', function(req, res, next) {
  res.render('user/register', {
    title: "Registration Page"
  });
}); 

router.get('/user/login/:id(\\d+)', function(req, res) {//currently not used in front end
  let id = parseInt(req.params.id); // XXX error checking
  db.get('SELECT * FROM users WHERE id=?',[id], function(err, row) {
      if (!err) {
          console.log( 'get', user );
          if ( row ) {
              res.send( row );
          }
          else {
              res.send( { id:id, notfound : true} );
          }
      }
      else {
          res.send( {id : id, error : err} );
      }
  } );
});
router.get('/user/profile', function(req,res,next){
  res.render('user/profile', {
    title: "Profile"
  });
}); 
router.get('/user/settings', function(req,res,next){
  res.render('user/settings', {
    title: "settings"
  });
}); 

router.post('/login',jsonParser, function(req, res) {
  const u = req.body;
  console.log(u);

  userdb.get('SELECT * FROM users WHERE username = ?',
      [ u.username ],
      function(err, row) {
          console.log("row:" +row);
          if ( !err ) {
              console.log('no err');
              if( row ) {
                  console.log('row checked');
                  if( sha256(u.password) == row.password ) {

                      res.send( JSON.stringify({ ok: true, user: u.username }) );
                  }
                  else {

                      res.send( JSON.stringify({ ok: false }) );
                  }
              }
              else { 

                  res.send( JSON.stringify({ ok: false, msg : 'nouser' }) );
              }
          }
          else {

              res.send({ ok:false });
          }
      } );

});

router.post('/user/register',jsonParser, function(req, res,next) {
  var u = req.body;
  console.log(u);
  userdb.run('INSERT INTO users(username,password,FName,LName,email) VALUES(?,?,?,?,?);',[u.username,sha256(u.password),u.FName,u.LName,u.email]);
  console.log('inserted');
   
});




module.exports = router;