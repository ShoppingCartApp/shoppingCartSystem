var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
var db = require('../models/productModel');
var cartdb = require('../models/cart');
var userdb = require('../models/usersModel');
var Cart = require('../models/cart');
const sha256 = require('sha-256-js');

var currentUser = '';

/* GET home page. */
router.get('/product', function (req, res, next) {
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

/** 
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
*/
router.post('/add-to-cart/:id', function(req, res, next) {
  let id = parseInt(req.params.id);
  const product = req.body;
  cartdb.serialize( function() {
    cartdb.run('INSERT INTO cart(product_id, product_name, product_price, product_image) VALUES(?,?,?,?)', 
    [id, product.productName, product.productPrice, product.image]);
    cartdb.get('SELECT last_insert_rowid()', [], function(err,row) {
      if (!err) {
        console.log( row );
        let id = row['last_insert_rowid()'];
        let p = {id : id};
        res.send(p);
        res.redirect('shop/index');
      }
    });
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

// User login function
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
                      currentUser = u.username;
                      res.send( JSON.stringify({ ok: true }) );
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

//User Register function
router.post('/user/register',jsonParser, function(req, res,next) {
  var u = req.body;
  console.log(u);
  userdb.run('INSERT INTO users(username,password,FName,LName,email) VALUES(?,?,?,?,?);',[u.username,sha256(u.password),u.FName,u.LName,u.email]);
  console.log('inserted');
   
});
//User change password function, ---called by settings.
router.post('/changePassword',jsonParser, function(req, res,next){
  var u = req.body;
  console.log(u);
  userdb.get('SELECT * FROM users WHERE username = ?',[ currentUser ],function(err,row){
    console.log('row: '+row);
    if(!err){
      console.log('row pass: '+row.password+", old pass: "+u.oldPassword);
      if(row.password == sha256(u.oldPassword)){
        userdb.get('UPDATE users SET password=? WHERE username = ?',[sha256(u.newPassword),currentUser ],function(err,row){
          if(err){
            res.send(JSON.stringify({ok:false,err:' update row error'}));        
          }
          res.send(JSON.stringify({ok:true}));
        });
    }
      else{
        res.send(JSON.stringify({ok:false}));
      }
  }
  else{
    res.send(JSON.stringify({ok:false, err:'error'}));
  }
  });
});
//User change username function ---Called by settings.
router.post('/changeUsername', jsonParser, function(req,res,next){
  var u = req.body;
  console.log(u);
  userdb.get('SELECT * FROM users WHERE username = ?',[ u.username ],function(err,row){
    if(row){
      res.send(JSON.stringify({ok:false,err:'username taken error'})); 
    }
    else{
    userdb.get('UPDATE users SET username=? WHERE username = ?',[u.username, currentUser ],function(err,row){
    if(err){
      res.send(JSON.stringify({ok:false,err:' change user row error'}));        
    }
    console.log(u.username);
    currentUser = u.username;
    res.send(JSON.stringify({ok:true}));
  });
}
});
});

//User change name function ---Called by settings.
router.post('/changeName', jsonParser, function(req,res,next){
  var u = req.body;
  console.log(u);
    userdb.get('UPDATE users SET Fname=?, Lname=? WHERE username = ?',[u.Fname,u.Lname,currentUser],function(err,row){
      if(err){
        res.send(JSON.stringify({ok:false,err:' change name error'}));        
      }
      res.send(JSON.stringify({ok:true}));
    });
});
//User change email function ---Called by settings.
router.post('/changeEmail', jsonParser, function(req,res,next){
  var u = req.body;
  console.log(u);
    userdb.get('UPDATE users SET email=? WHERE username = ?',[u.email,currentUser],function(err,row){
      if(err){
        res.send(JSON.stringify({ok:false,err:' change email error'}));        
      }
      res.send(JSON.stringify({ok:true}));
    });
});


//Admin delete account functin ----Called by admin page.
router.post('/DeleteAccount',jsonParser, function(req, res,next){
  var u = req.body;
  console.log(u);
  userdb.get('SELECT * FROM users WHERE username = ?',[ currentUser ],function(err,row){
    console.log('row: '+row);
    if(!err){
      console.log('row pass: '+row.password+", old pass: "+u.password);
      if(row.password == sha256(u.password)){
        userdb.get('DELETE FROM users WHERE username = ?',[currentUser ],function(err,row){
          if(err){
            res.send(JSON.stringify({ok:false,err:' delete row error'}));        
          }
          res.send(JSON.stringify({ok:true}));
        });
    }
      else{
        res.send(JSON.stringify({ok:false}));
      }
  }
  else{
    res.send(JSON.stringify({ok:false, err:'error'}));
  }
}); 
});

module.exports = router;