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
 * Setup
 */
var connectedBirdCount = 0,
    readyHandler,
    getConfigFilePath,
    configFilename,
    currentBird,
    sendSong,
    birdConfigRaw,
    birdConfig,
    flock;

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
    logCount();

    socket.on('disconnect', function () {
      // @todo: Possibly problematic, would a reconnection throw the count off?
      connectedBirdCount--;

      // Notify the host
      console.log('A ' + socket.bird.get('name') + ' appears to have left.');
      logCount();
    });

    // Trigger welcome event, informing user of their assignment
    socket.emit('welcome', {
      name: socket.bird.get('name'),
      photo: socket.bird.get('photo')
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
 * Log the number of connected birds
 *
 * @method logCount
 */
logCount = function () {
  console.log('There are ' + connectedBirdCount + ' birds connected.');
};

/*
 * Get the path for the configuration to load from the process arguments
 *
 * @method getConfigFilePath
 * @param  {Object} args     The object containing process arguments, typically this is process.argv
 * @param  {String} fallback The default config to load if none is specified
 * @return {String}          The path of a configuration file
 */
getConfigFilePath = function (args, fallback) {
  // We ignore the first two arguments, as process.argv includes "node" and the script path
  return args[2] || fallback;
};

/**
 * Startup
 */

// Load configuration needed to instantiate a flock of birds (oh lawd)
configFilename = getConfigFilePath(process.argv, 'new-zealand-forest-daytime') + '.json';
try {
  birdConfigRaw  = fs.readFileSync('./config/' + configFilename);
  birdConfig = JSON.parse(birdConfigRaw);
  console.log('Loaded configuration: ' + configFilename);
} catch (err) {
  console.log('Error loading configuration: ' + configFilename + ' - Exiting');
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
