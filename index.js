var express = require('express');
var fetch = require('node-fetch');
var handler =  require('./src/handler.js');
var redis = require('./src/redis.js')
var r =  require('./src/request.js');
var fs = require('fs');
var path    = require("path");

var app = express();

const SECRET = ""
app.set('port', (process.env.PORT || 5000));

// app.use(express.static(__dirname + '/build'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// app.get('/',function(req,res){
//   res.render('index.html');
// });

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/v1/status', function(request, response) {
  return response.status(200).send()
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/v1/media', function(request, response){
  
    const access = request.headers.authorization;
    const qs =  request.query;
    const obj = {qs:qs, access:access}
    return handler.handleRequest(response, obj);
    
});


