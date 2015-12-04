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

/* BDD user */ 
var userSchema = new mongoose.Schema({
	login : String,
	password : String
});

var userModel = mongoose.model('users', userSchema);

/* BDD zone */ 

var zoneSchema = new mongoose.Schema({
	nom : String,
	lat : Double,
	lng : Double,
	rayon : Double,
	type : String
});

var zoneModel = mongoose.model('zones', zoneSchema);

/* fin BDD */ 

var lat = 41.878114;
var longi = -87.629798;
var rayon = 2000;

var liste = [
	{lat:41.878114, longi:-87.629798, radius :15000, type: "radioactif", nom:"test"},
	{lat:40.878114, longi:-87.629798, radius :15000, type: "radioactif", nom:"unautre"},
	{lat:40.878114, longi:-84.629798, radius :35000, type: "ebola", nom:"lol"},
];

var sess;

/* Autres */

app.get('/', function(req, res) {
	res.render('index.ejs');
});


/* Zones */

app.get('/zone', function(req, res) {
	renderZone(res, null);
});

function renderZone(res, center) {

	if(center == null)
		res.render('zone.ejs', {liste: liste});
	else
		res.render('zone.ejs', {liste: liste, centerLat : center.centerLat, centerLng : center.centerLng});
		
}

app.get('/ajout_zone', function(req, res) {
	res.render('ajout_zone.ejs');
});



app.post('/ajout_zone', function(req, res) {
	res.redirect('/ajout_zone');
});

/* Inscription */

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
				res.render('inscription.ejs', { erreur : 'Erreur : Un utilisateur existe déjà avec cet identifiant.' });
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

/* Connexion */

app.get('/connexion', function(req, res) {
	res.render('connexion.ejs', { erreur : ' ' });
});

app.post('/do_connexion', function(req, res) {
	mongoose.connect('mongodb://localhost/unisafe', function(err) {
		if (err) { throw err; }
	});

	var query = userModel.find(null);
	query.where('login', req.body.login);
	query.where('password', req.body.pass);
	query.exec(function (err, comms) {
		if (err) { throw err; }
		if (comms.length != 1) {
			mongoose.connection.close();
			res.render('connexion.ejs', { erreur : 'Erreur : Identifiant ou mot de passe incorrect.' });
		}
		else {
			sess = req.session;
			sess.login=req.body.login;
			mongoose.connection.close();
			res.redirect('/');
		}
	});
});

app.use(express.static('assets'));

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable.');
});

function isConnected() {
	if (sess.login)
		return true;
	else
		return false;
}

app.post('/ajout_zone', function(req, res) {
	mongoose.connect('mongodb://localhost/unisafe', function(err) {
		if (err) { throw err; }
	});

	var query = zoneModel.find(null);
	query.where('nom', req.body.nom);
	query.exec(function (err, comms) {
		if (err) { throw err; }
		if (comms.length > 0) {
			mongoose.connection.close();
			res.render('ajout_zone.ejs', { erreur : 'Erreur : Une zone avec ce nom existe déjà' });
		}
		else {
			var nom = req.body.nom;
			var lat = req.body.lat;
			var lng = req.body.lng;
			var rayon = req.body.rayon;
			var type = req.body.type;
			
			var newZone = new zoneModel({ nom : nom, lat : lat, lng : lng, rayon : rayon, type : type });
				newZone.save(function (err) {
					if (err) { throw err; }
					mongoose.connection.close();
					renderZone(res, {centerLat : lat, centerLng : lng});
				});
		}
	});
});


app.listen(8080);
