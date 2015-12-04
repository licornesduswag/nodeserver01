var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));

app.get('/', function(req, res) {
	res.render('index.ejs');
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
