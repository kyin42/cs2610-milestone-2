// Put in your express server here. Use index.html for your
// view so have the server direct you to that.
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 3000));

var ejs = require('ejs');

app.use(express.static(__dirname + '/views'));
app.set('view engine', ejs);
app.set('views', __dirname+'/views');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL;
var db = pgp(connectionString);


app.get('\/((index(\.html)?)?)', function (req, res) {
    res.render("./index.ejs");
});

app.use(session({
  secret: process.env.COOKIE_SECRET,
  name: 'userId',
  resave: true,
  saveUninitialized: false,
  secure: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 30 days
}));


app.post('\/', function (req, res) {
  req.session.name = req.body.nick;
  res.redirect('/game');
});

app.get('\/game', function (req, res) {
  if(req.session.name != null){
    res.render("./game.ejs", {nick: req.session.name});
  }
});


app.post('\/game', function (req, res) {
  req.session.score = parseInt(req.body.score);
  db.none('insert into scores(nick, score)' +
      'values($1, $2)',
    [req.body.nick, parseInt(req.body.score)])
    .then(function () {
      res.redirect('/highscores'});
    })
    .catch(function (err) {
      console.log("error form db: " + err);
        res.send("something went wrong");
    });
});

app.get('\/highscores', function (req, res) {
  db.any('select * from scores')
    .then(function (data) {
      if(req.session.name != null){
        res.render("./highscores.ejs", {dbsuccess: true, hasscore: true, results: data, nick: req.session.nick, score: req.session.score}); 
      }
      else{
        res.render("./highscores.ejs", {dbsuccess: true, hasscore: false, results: data});   
      }
    })
    .catch(function (err) {
      console.log("error form db: " + err);
        res.render("./highscores.ejs", {dbsuccess: false});
    });
});

/* 

app.get('\/((index\.html)?)', function (req, res) {
  db.any('select * from posts')
    .then(function (data) {
      res.render("./index.ejs", {dbsuccess: true, results: data});
    })
    .catch(function (err) {
      console.log("error form db: " + err);
        res.render("./index.ejs", {dbsuccess: false});
    });
});

app.get('\/new', function (req, res) {
	res.render("./new.ejs");
});

app.post('\/new', function (req, res) {
 	db.none('insert into posts(name, content)' +
      'values($1, $2)',
    [req.body.name, req.body.content])
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
    	console.log("error form db: " + err);
      	res.render("./index.ejs", {dbsuccess: false});
    });
});

app.get('\/:id/edit', function (req, res) {
	db.one('select * from posts where id = $1', parseInt(req.params.id))
    .then(function (data) { 
	    res.render("./edit.ejs", {dbsuccess: true, results: data});
    })
    .catch(function (err) {
    	console.log("error form db: " + err);
      	res.render("./edit.ejs", {dbsuccess: false});
    });
});

app.post('\/:id/edit', function (req, res) {
	db.none('update posts set name=$1, content=$2 where id=$3',
    [req.body.name, req.body.content, parseInt(req.params.id)])
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
    	console.log("error form db: " + err);
      	res.render("./index.ejs", {dbsuccess: false});
    });
});

app.get('\/:id', function (req, res) {
	db.one('select * from posts where id = $1', parseInt(req.params.id))
    .then(function (data) { 
	    res.render("./single.ejs", {dbsuccess: true, results: data});
    })
    .catch(function (err) {
    	console.log("error form db: " + err);
      	res.render("./single.ejs", {dbsuccess: false});
    });
});

app.get('\/:id/delete', function (req, res) {
	db.none('delete from posts where id = $1', parseInt(req.params.id))
    .then(function (result) {
      res.redirect('/');
    })
    .catch(function (err) {
    	console.log("error form db: " + err);
      	res.render("./index.ejs", {dbsuccess: false});
    });
});

*/





app.get('/css/:path', function (req, res) {
  res.sendFile(__dirname + '/css/' + req.params.path);
});

app.get('/js/:path', function (req, res) {
  res.sendFile(__dirname + '/js/' + req.params.path);
});
app.get('/images/:path', function (req, res) {
  res.sendFile(__dirname + '/images/' + req.params.path);
});

app.use(function (req, res, next) {
  res.status(404).send('404! Not found.')
})

app.listen(app.get('port'), function () {
  console.log('Example app listening on port ' + app.get('port'));
});
