var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({secret: 'uniSafeSecret'}));

var lat = 41.878114;
var longi = -87.629798;
var rayon = 2000;
var liste = [
		{lat:41.878114, longi:-87.629798, radius :2000},
		{lat:40.878114, longi:-87.629798, radius :2000},
		{lat:40.878114, longi:-84.629798, radius :2000},
	];

app.get('/', function(req, res) {
	res.render('index.ejs', {lat:41.878114, longi:-87.629798, rayon :2000});
});

app.get('/connexion', function(req, res) {
	var sess = req.session;
	res.render('connexion.ejs');
});

app.get('/inscription', function(req, res) {
	res.render('inscription.ejs', { erreur : '' });
});

app.post('/do_inscription', function(req, res) {
	if (req.body.pass == req.body.pass_confirm) {
		mongoose.connect('mongodb://localhost/unisafe', function(err) {
			if (err) { throw err; }
		});

		var userSchema = new mongoose.Schema({
			login : String,
			password : String
		});

		var userModel = mongoose.model('users', userSchema);

		var newUser = new userModel({ login : req.body.login, password : req.body.pass });

		newUser.save(function (err) {
			if (err) { throw err; }
			mongoose.connection.close();
		});

		res.render('index.ejs');
	}
	else {
		res.render('inscription.ejs', { erreur : 'Erreur : Les mots de passe ne correspondent pas.' });
	}
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable.');
});

app.listen(8080);
