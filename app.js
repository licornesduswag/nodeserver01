var express = require('express');


var app = express();



app.get('/index', function(req, res) {


	res.render('index.ejs');


});


app.listen(8080);