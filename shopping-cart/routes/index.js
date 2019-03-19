var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
var db = require('../models/productModel');
var userdb = require('../models/usersModel');
var Cart = require('../models/cart');

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
  res.render('shop/shoppingcart', {
    title: 'Shopping-cart',
  });
});

router.get('/add-to-cart/:id', function(req, res, next) {
  let id = parseInt(req.params.id);
  var cart = new Cart(req.session.cart ? req.session.cart.items : {});

  db.get('SELECT * FROM products WHERE id=?', [id], function (err, row) {
    if (!err) {
      cart.add(row, row.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect('/');
    }
  });
});

router.get('/checkout', function (req, res, next) {
  res.render('shop/checkout', {
    title: 'Check Out',
  });
});

router.get('/paysuccessfully', function (req, res, next) {
  res.render('shop/paysuccessfully', {
    title: 'Thank you'
  });
})

router.get('/user/login', function(req, res, next) {
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
  userdb.get('SELECT * FROM users WHERE id=?',[id], function(err, row) {
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

router.post('/user/login', function(req, res) {
  var u = req.body;   
  console.log(u); 

  if( u.submit == "Login"){
      userdb.get("select * from users where (username=?) and (password=?)",[u.username,u.password],function(err,row){
      if(row){
          res.redirect("/");
      }
      else{
          res.send("alert('Username or Password incorrect. Please try again or register.')");
      }
  });
  }
  if(u.submit == "Register"){
      res.render('user/register', {
        title: "Register Page"
      });
  }
});

router.post('/register',jsonParser, function(req, res) {
  var u = req.body;
  console.log(req.body);
  var i = db.get('SELECT last_insert_rowid()');
  userdb.run('INSERT INTO users(id,username,password) VALUES(?,?,?);',[i,u.username,u.password]);

});




module.exports = router;