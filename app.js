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

var userSchema = new mongoose.Schema({
	login : String,
	password : String
});

var userModel = mongoose.model('users', userSchema);

var lat = 41.878114;
var longi = -87.629798;
var rayon = 2000;

var liste = [
		{lat:41.878114, longi:-87.629798, radius :2000},
		{lat:40.878114, longi:-87.629798, radius :2000},
		{lat:40.878114, longi:-84.629798, radius :2000},
	];

app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.get('/map', function(req, res) {
	res.render('map.ejs', {liste: liste});
});

app.get('/connexion', function(req, res) {
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

		var query = userModel.find(null);
		query.where('login', req.body.login);
		query.exec(function (err, comms) {
			if (err) { throw err; }
			if (comms.length > 0) {
				mongoose.connection.close();
				res.render('inscription.ejs', { erreur : 'Erreur : Un utilisateur existe déjà avec ce login.' });
			}
			else {
				var newUser = new userModel({ login : req.body.login, password : req.body.pass });
				newUser.save(function (err) {
					if (err) { throw err; }
					mongoose.connection.close();
					res.redirect('/');
				});
			}
		});
	}
	else {
		res.render('inscription.ejs', { erreur : 'Erreur : Les mots de passe ne correspondent pas.' });
	}
});

app.use(express.static('assets'));

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable.');
});

app.listen(8080);
