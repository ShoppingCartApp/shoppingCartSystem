var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
var db = require('../models/productModel');
var userdb = require('../models/usersModel');
const sha256 = require('sha-256-js');
var userproductdb = require('../models/userproductdb');

router.get('/', function (req, res, next) {
  res.render('user/login', {
    title: "Login Page",
    layout: false
  });
});

router.get('/user/register', function (req, res, next) {
  res.render('user/register', {
    title: "Registration Page",
    layout: false
  });
});

router.get('/user/login/:id(\\d+)', function (req, res) { //currently not used in front end
  let id = parseInt(req.params.id); // XXX error checking
  db.get('SELECT * FROM users WHERE id=?', [id], function (err, row) {
    if (!err) {
      console.log('get', user);
      if (row) {
        res.send(row);
      } else {
        res.send({
          id: id,
          notfound: true
        });
      }
    } else {
      res.send({
        id: id,
        error: err
      });
    }
  });
});
router.get('/user/settings', function (req, res, next) {
  res.render('user/settings', {
    title: "Settings"
  });
});
// User login function
router.post('/login', jsonParser, function (req, res) {
  const u = req.body;
  console.log(u);

  userdb.get('SELECT * FROM users WHERE username = ?',
    [u.username],
    function (err, row) {
      console.log("row:" + row);
      if (!err) {
        console.log('no err');
        if (row) {
          console.log('row checked');
          if (sha256(u.password) == row.password) {
            req.session.user = u;
            req.session.islogin = true;
            req.session.cartItem = row.cartItem;
            res.send(JSON.stringify({
              ok: true
            }));
          } else {
            res.send(JSON.stringify({
              ok: false
            }));
          }
        } else {
          res.send(JSON.stringify({
            ok: false,
            msg: 'nouser'
          }));
        }
      } else {
        res.send({
          ok: false
        });
      }
    });
});

//User Register function
router.post('/user/register', jsonParser, function (req, res, next) {
  var u = req.body;
  console.log(u);
  userdb.get('SELECT * from users where username=?', [u.username], function (err, row) {
    if (row) {
      console.log('taken');
      res.send({
        ok: false,
        err: "Username Taken"
      });
    } else {
      userdb.run('INSERT INTO users(username,password,FName,LName,Email,admin,cartItem) VALUES(?,?,?,?,?,?,?);', [u.username, sha256(u.password), u.FName, u.LName, u.email, 0, 0]);
      console.log('inserted');
      req.session.cartItemNum = 0;
      res.send({
        ok: true
      });
    }
  });
});
//User change password function, ---called by settings.
router.post('/changePassword', jsonParser, function (req, res, next) {
  var u = req.body;
  console.log(u);
  userdb.get('SELECT * FROM users WHERE username = ?', [req.session.user.username], function (err, row) {
    console.log('row: ' + row);
    if (!err) {
      console.log('row pass: ' + row.password + ", old pass: " + u.oldPassword);
      if (row.password == sha256(u.oldPassword)) {
        userdb.get('UPDATE users SET password=? WHERE username = ?', [sha256(u.newPassword), req.session.user.username], function (err, row) {
          if (err) {
            res.send(JSON.stringify({
              ok: false,
              err: ' update row error'
            }));
          }
          res.send(JSON.stringify({
            ok: true
          }));
        });
      } else {
        res.send(JSON.stringify({
          ok: false
        }));
      }
    } else {
      res.send(JSON.stringify({
        ok: false,
        err: 'error'
      }));
    }
  });
});
//User change username function ---Called by settings.
router.post('/changeUsername', jsonParser, function (req, res, next) {
  var u = req.body;
  console.log(u);
  userdb.get('SELECT * from users where username=?', [u.username], function (err, row) {
    if (row) {
      console.log('taken');
      res.send({
        ok: false,
        err: "Username Taken"
      });
    } else {
      userdb.get('UPDATE users SET username=? WHERE username = ?', [u.username, req.session.user.username], function (err, row) {
        if (err) {
          console.log('taken err');
          res.send(JSON.stringify({
            ok: false,
            err: ' change user row error'
          }));
        }
        console.log('not taken');
        req.session.user.username = u.username;
        req.session.usernam
        res.send(JSON.stringify({
          ok: true
        }));
      });
    }
  });
});

//User change name function ---Called by settings.
router.post('/changeName', jsonParser, function (req, res, next) {
  var u = req.body;
  console.log(u);
  userdb.get('UPDATE users SET Fname=?, Lname=? WHERE username = ?', [u.Fname, u.Lname, req.session.user.username], function (err, row) {
    if (err) {
      res.send(JSON.stringify({
        ok: false,
        err: ' change name error'
      }));
    }
    res.send(JSON.stringify({
      ok: true
    }));
  });
});
//User change email function ---Called by settings.
router.post('/changeEmail', jsonParser, function (req, res, next) {
  var u = req.body;
  console.log(u);
  userdb.get('UPDATE users SET email=? WHERE username = ?', [u.email, req.session.user.username], function (err, row) {
    if (err) {
      res.send(JSON.stringify({
        ok: false,
        err: ' change email error'
      }));
    }
    res.send(JSON.stringify({
      ok: true
    }));
  });
});

function generate_users(res) {
  userdb.all(`SELECT rowid,* FROM users`, [], function (err, rows) {
    if (!err) {
      res.type('.html'); // set content type to html
      res.render('user/admin', {
        users: rows,
        title: 'Admin Page'
      });
    }
  });
}

//Get Admin page
router.get('/user/admin', function (req, res, next) {
  generate_users(res);
});


//Admin delete account functin ----Called by admin page.
router.post('/user/admin', jsonParser, function (req, res, next) {
  var u = req.body;
  if (u.op == "delete") {
    userdb.run('DELETE FROM users WHERE username = ?', [u.username], function (err, row) {
      if (!err) {
        console.log('deleted');
        generate_users(res);
      } else {
        res.send(JSON.stringify({
          ok: false
        }));
      }
    });
  }

  if (u.op == "update") {
    console.log(u);
    console.log(u.username);
    console.log(u.FName);
    console.log(u.LName);
    console.log(u.Email);
    console.log(u.id);
    let passw = sha256(u.password);
    userdb.run('UPDATE users SET username=?,password=?,FName=?,LName=?,Email=? WHERE rowid=?', [u.username, passw, u.FName, u.LName,
      u.Email, u.id
    ], function (err, row) {
      if (!err) {
        console.log('updated');
        generate_users(res);
      } else {
        res.send(JSON.stringify({
          ok: false
        }));
      }
    });
  }
});

router.get('/user/profile', function (req, res, next) {
  userproductdb.all(`SELECT * FROM userproducts WHERE username=?`, [req.session.user.username], function (err, rows) {
    if (!err) {
      userdb.all(`SELECT * FROM users WHERE username=?`, [req.session.user.username], function (err, rows1) {
        if (!err) {
          console.log(rows1);
          res.type('.html'); // set content type to html
          res.render('user/profile', {
            user: rows1,
            product: rows,
            title: 'Profile'
          });
        } else {
          console.log('prof2 error');
        }
      });
    } else {
      console.log('prof error');
    }
  });
});
module.exports = router;