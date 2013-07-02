
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var track = require('./routes/track');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon(__dirname+ '/public/images/Guitar.png'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use('/data', express.static(path.join(__dirname, '/data/')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.post('/upload', routes.postHandler);

app.post('/rename', routes.rename);

app.post('/knoxLoad', routes.knoxUpload)

app.delete('/delete/:id', routes.delete);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
