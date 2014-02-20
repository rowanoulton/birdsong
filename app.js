/**
 * Dependencies, app & socket setup
 */
var express  = require('express'),
    fs       = require('fs'),
    _        = require('underscore'),
    path     = require('path'),
    http     = require('http'),
    routes   = require('./routes'),
    Flock    = require('./models/flock'),
    Bird     = require('./models/bird'),
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
var connectedBirdCount = 0,
    readyHandler,
    currentBird,
    sendSong,
    birdConfigRaw,
    birdConfig,
    flock;

// Load configuration needed to instantiate a flock of birds (oh lawd)
birdConfigRaw = fs.readFileSync('./config/birds.json');
try {
  birdConfig = JSON.parse(birdConfigRaw);
} catch (err) {
  console.log('Error reading config/birds.json - Exiting');
  console.log(err);
  process.exit(1);
}

flock = new Flock();

// Iterate over the configuration entries, load and add them to
// our collection
_.each(birdConfig, function (config) {
  currentBird = new Bird(config);
  currentBird.load(function (bird) {
    flock.add(bird);

    if (flock.getCount() === birdConfig.length) {
      // Once all birds are finished loading, fire up the server
      readyHandler();
    }
  });
});

/*
 * Start listening for connections
 *
 * Triggered when all birds have finished loading their recordings
 *
 * @method readyHandler
 */
readyHandler = function () {
  console.log('Listening on ' + app.get('port'));
  server.listen(app.get('port'));

  io.sockets.on('connection', function (socket) {
    connectedBirdCount++;

    // Assign the socket a bird at random
    socket.bird = flock.getRandom();

    // Notify the host
    console.log('A ' + socket.bird.get('name') + ' has joined.');
    generalReport();

    socket.on('disconnect', function () {
      connectedBirdCount--;

      // Notify the host
      console.log('A ' + socket.bird.get('name') + ' appears to have left.');
      generalReport();
    });

    // Trigger welcome event, informing user of their assignment
    socket.emit('welcome', {
      name: socket.bird.get('name'),
      img: socket.bird.get('img')
    });

    // Send a song
    sendSong(socket);
  });
};

/*
 * Pick a recording from the birds collection at random(!) and send the file URL
 * to the given client
 *
 * Afterward, reset the timer
 *
 * @method sendSong
 * @param  {Object} socket
 */
sendSong = function (socket) {
  var song    = socket.bird.getRandomRecording(),
      songUrl = song.file;

  socket.emit('sing', { song: songUrl });
  socket.songTimeout = setTimeout(function () {
    sendSong(socket);
  }.bind(this), socket.bird.getInterval());
};


/*
 * A periodic diagnostic function which reports on usage
 *
 * @method generalReport
 */
generalReport = function () {
  console.log('There are ' + connectedBirdCount + ' birds connected.');
};
