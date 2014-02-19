/**
 * Dependencies
 */
var XenoCanto = require('xeno-canto'),
    _         = require('underscore');

/**
 * Constructor
 */

/*
 * @class Bird
 * @constructor
 * @param config {Object}
 *        @param {String} config.name      The public-facing name of the bird
 *        @param {String} config.img       The URL of an image representing the bird
 *        @param {Object} config.arguments Search parameters for XenoCanto API. See https://github.com/tripitakit/xeno-canto
 */
function Bird (config) {
    this.recordings = [];
    this.api        = new XenoCanto();
    this.name       = config.name;
    this.img        = config.img;
    this.args       = config.arguments;
};

/**
 * Methods
 */

/*
 * Return a property of the bird
 *
 * @method get
 * @param  {String} property argument key
 * @return {Mixed}
 */
Bird.prototype.get = function (property) {
    return this[property];
};

/*
 * Load recordings from the XenoCanto API and store them
 *
 * @param {Function} [callback] callback is passed the current instance
 */
Bird.prototype.load = function (callback) {
    this.api.search(this.get('args'), function (data) {
        this.recordings = data.entity.recordings;
        console.log(this.recordings.length + ' recordings loaded for ' + this.get('name'));

        if (_.isFunction(callback)) {
            callback(this);
        }
    }.bind(this));
};

/*
 * Return a random(!) entry from stored list of recordings
 *
 * @method getRandomRecording
 * @return {Object} recording
 */
Bird.prototype.getRandomRecording = function () {
    return _.sample(this.recordings);
};

/**
 * Export
 */
module.exports = Bird;
