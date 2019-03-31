var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
var db = require('../models/productModel');
var cartdb = require('../models/cart');

/* GET home page. */
router.get('/products', function (req, res, next) {
  db.all('SELECT * FROM products', [], function (err, rows) {
    if (!err) {
      req.session.user = {username:'hello'};
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

router.delete('/deleteSingleProduct', jsonParser, function (req, res, next) {
  console.log("Hi");
  let pname = req.body;

  console.log(pname);
  cartdb.run(`DELETE FROM cart WHERE username=? AND product_name=?`, [req.session.user.username, pname], function (err) {
    if (!err) {
      console.log("here");
      res.render('shop/shoppingcart', {
        title: 'Shopping-cart',
        status: "deleted"
      });
      console.log("tere");
    }
    else {
      console.log(err);
    }
    console.log("delete", pname);
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
  const qty = req.body;
  let totalPrice = 0;
  console.log("qty:", qty);
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
router.get('/user/settings', function(req,res,next){
  res.render('user/settings', {
    title: "settings"
  });
}); 
router.get('/thankyou', function (req, res, next) {
  res.render('shop/thankyou', {
    title: 'Thank you',
    items: req.session.bought,
    user: req.session.user.username
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
  userdb.get('UPDATE users SET username=? WHERE username = ?',[u.username, currentUser ],function(err,row){
    if(err){
      res.send(JSON.stringify({ok:false,err:' change user row error'}));        
    }
    res.send(JSON.stringify({ok:true}));
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