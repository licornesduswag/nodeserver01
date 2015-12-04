var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');

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
	lat : Number,
	lng : Number,
	rayon : Number,
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
	{lat:40.878114, longi:-84.629798, radius :10000, type: "ebola", nom:"lol"},
	{lat:40.878114, longi:-84.629708, radius :15000, type: "test", nom:"lol"},
];

var awsobj = {
	zones: liste
};

var sess;

/* Autres */

app.get('/', function(req, res) {
	sess = req.session;
	if (isConnected(sess))
		res.render('index.ejs', { login : sess.login });
	else
		res.render('index.ejs');
});

/* Zones */

app.get('/zone', function(req, res) {

	renderZone(req, res, null);

});

function renderZone(req, res, center) {
	
	
	mongoose.connect('mongodb://localhost/unisafe', function(err) {
		if (err) { throw err; }
	});
	
	console.log('taille liste avant ' + liste.length);
	liste = [];
	var query = zoneModel.find(null);
	query.exec(function (err, comms) {
		console.log('yolo');
		if (err) { throw err; }
		console.log('taille' + comms.length);
		for(var i =0; i < comms.length; i++)
		{
			var com = comms[i];
			liste.push({lat : com.lat, longi : com.lng, radius : com.rayon, type : com.type, nom : com.nom });
			console.log(com.lat + 'pp');
		}
		
		console.log('taille liste' + liste.length);

		if(center == null)
		{
			sess = req.session;
			
			if(liste.length == 0 && isConnected(sess))
				res.render('ajout_zone.ejs', { login : sess.login , erreur : ' ' });
			else if(liste.length == 0)
				res.render('zone.ejs', {liste: liste, centerLat : 43, centerLng : 43 });
			else if (isConnected(sess))
				res.render('zone.ejs', {login : sess.login, liste: liste, centerLat : liste[0].lat, centerLng : liste[0].longi });
			else
				res.render('zone.ejs', {liste: liste, centerLat : liste[0].lat, centerLng : liste[0].longi });
		}
		else
		{
			sess = req.session;
			if (isConnected(sess))
				res.render('zone.ejs', {login : sess.login, liste: liste, centerLat : center.centerLat, centerLng : center.centerLng});
			else 
				res.render('zone.ejs', {liste: liste, centerLat : center.centerLat, centerLng : center.centerLng});
		}
		
		mongoose.connection.close();
	});
	

	
		
}

app.get('/ajout_zone', function(req, res) {
	sess = req.session;
	if (isConnected(sess))
		res.render('ajout_zone.ejs', { login : sess.login , erreur : ' ' });
	else res.render('/');
});



app.post('/ajout_zone', function(req, res) {
	
	sess = req.session;
	if (!isConnected(sess))
		res.redirect('/');
	
	
	mongoose.connect('mongodb://localhost/unisafe', function(err) {
		if (err) { throw err; }
	});
	
	
	var nom = req.body.nom;
	var lat = req.body.lat;
	var lng = req.body.lng;
	var rayon = req.body.rayon;
	var type = req.body.type;
	
			
	if(!nom || !lat || !lng || !rayon || !type)
	{
		res.render('ajout_zone.ejs', { login : sess.login ,  erreur : 'Erreur : Veuillez remplir tous les champs.' });
	}
			

	var query = zoneModel.find(null);
	query.where('nom', req.body.nom);
	query.exec(function (err, comms) {
		if (err) { throw err; }
		if (comms.length > 0) {
			mongoose.connection.close();
			res.render('ajout_zone.ejs', { login : sess.login ,  erreur : 'Erreur : Une zone avec ce nom existe déjà' });
		}
		else {
			
			var newZone = new zoneModel({ nom : nom, lat : lat, lng : lng, rayon : rayon, type : type });
			
			
			newZone.save(function (err) {
				if (err) { throw err; }
				mongoose.connection.close();
				renderZone(req, res, {centerLat : lat, centerLng : lng});
			});
		}
	});
	
});


/* Inscription */

app.get('/inscription', function(req, res) {
	res.render('inscription.ejs', { erreur : ' ' });
});

app.post('/do_inscription', function(req, res) {
	if (req.body.pwd == req.body.pwdC) {
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
				var newUser = new userModel({ login : req.body.login, password : req.body.pwd });
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
	query.where('password', req.body.pwd);
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

app.get('/deconnexion',function(req,res){
	sess = req.session;
	sess.login = null;
	sess.destroy(function(err) {
		if(err) {
			console.log(err);
		}
		else {
			res.redirect('/');
		}
	});
});

/* Test AWS */

/* Cette URL est en fait un genre de proxy vers l’URL d’Amazon.
 *
 * Elle va interroger la base MongoDB et envoyer l’ensemble des zones au script
 * de traitement, qui va ensuite calculer les stats sur les zones et les
 * retourner au format JSON.
 *
 * En appelant cette URL avec Javascript en XMLHTTPRequest, on peut donc
 * récupérer les données statistiques calculées sur les serveurs d’Amazon et
 * ensuite afficher des graphiques avec.
 *
 * On déploie donc un micro-service de statistiques avec AWS Lambda sans se
 * soucier de la charge serveur que peut entrainer le calcul de statistiques.
 *
 * De plus, ce genre de proxy nous permet de cacher notre vraie URL Amazon.
 *
 */

var secret = require('./secret');

app.get('/test_aws', function(req, res) {
	request({
		url: secret.getSecretURL(),
		method: "POST",
		json: true,
		body: awsobj
	}, function(error, response, body) {
		res.send(body);
	});
});

app.get('/stats', function(req, res) {
	res.render('stats.ejs');
});

/* Le reste */

app.use(express.static('assets'));

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable.');
});

// sess correspond a l'objet session recupere avec req.session

function isConnected(sess) {
	if (sess.login)
		return true;
	else
		return false;
}




app.listen(8080);
