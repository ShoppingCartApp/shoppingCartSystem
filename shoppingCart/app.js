const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database( __dirname + '/users.db',
    function(err) {
        if ( !err ) {
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT,
                password TEXT
            )`);
            console.log('opened users.db');
        }
    });

const express = require('express');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// the static file middleware
app.use(express.static( __dirname + '/public'))

// the template middleware
// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
  defaultLayout: __dirname + '/views/layout/main.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

const port = process.env.PORT || 8000;

function generate_users_page( res ) {
    db.all('SELECT * FROM users', [], function(err, rows) {
        if ( !err ) {
            res.type('.html'); // set content type to html
            res.render('users', {
                users : rows,
                title : 'JSON and XMLHttpRequest',
                greetings : 'A partial example at ' + new Date()
            });
        }
    } );
}

app.get('/', function(req, res) {
    res.redirect('/login.html');
});


app.get('/user/:id(\\d+)', function(req, res) {//currently not used in front end
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
app.post('/login.html', function(req, res) {
    var u = req.body;   
    console.log(u); 

    if( u.submit == "Login"){
        db.get("select * from users where (username=?) and (password=?)",[u.username,u.password],function(err,row){
        if(row){
            console.log('red')
            res.redirect("/homepage.html");
        }
        else{
            res.send("alert('Username or Password incorrect. Please try again or register.')");
        }
    });
    }
    if(u.submit == "Register"){
        res.redirect('/register.html');
    }
});

app.post('/register.html',jsonParser, function(req, res) {
    var u = req.body;
    console.log(req.body);
    var i = db.get('SELECT last_insert_rowid()');
    db.run('INSERT INTO users(id,username,password) VALUES(?,?,?);',[i,u.username,u.password]);


});

app.listen(port, () => console.log(`Listening on port ${port}!`));