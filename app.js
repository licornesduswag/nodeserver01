var express = require('express');


var app = express();



app.get('/', function(req, res) {


	res.render('index.ejs');


});

app.get('/connexion', function(req, res) {


	res.render('connexion.ejs');


});

app.listen(8080);
