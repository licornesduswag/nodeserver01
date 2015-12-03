var express = require('express');
var app = express();
var lat = 41.878114;
var longi = -87.629798;
var rayon = 2000;

app.get('/', function(req, res) {
	res.render('index.ejs',{lat:lat, longi:longi , rayon :rayon });
});

app.get('/connexion', function(req, res) {
	res.render('connexion.ejs');
});

app.get('/inscription', function(req, res) {
	res.render('inscription.ejs');
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable.');
});

app.listen(8080);
