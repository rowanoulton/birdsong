/**
 * Dependencies, app & socket setup
 */
var express  = require('express'),
    path     = require('path'),
    http     = require('http'),
    routes   = require('./routes'),
    app      = express(),
    server   = http.createServer(app),
    io       = require('socket.io').listen(server, { log: false });

/**
 * Express setup
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(app.router);
app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * Routes
 */
app.get('/', routes.index);

/**
 * Startup
 */
server.listen(app.get('port'));

/**
 * Sockets
 */
io.sockets.on('connection', function (socket) {
  // @todo
  // socket.emit('news', { hello: 'world' });
  // socket.on('my other event', function (data) {
  //   console.log(data);
  // });
});

