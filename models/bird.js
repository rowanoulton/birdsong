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
 * @param {Object} args Search parameters for XenoCanto API. See https://github.com/tripitakit/xeno-canto
 */
function Bird (args) {
    this.recordings = [];
    this.api        = new XenoCanto();
    this.args       = args;
};

/**
 * Methods
 */

/*
 * Return a property of the search arguments
 *
 * @method get
 * @param  {String} property argument key
 * @return {Mixed}
 */
Bird.prototype.get = function (property) {
    return this.args[property];
};

/*
 * Load recordings from the XenoCanto API and store them
 *
 * @param {Function} [callback]
 */
Bird.prototype.load = function (callback) {
    this.api.search(this.args, function (data) {
        this.recordings = data.entity.recordings;
        console.log(this.recordings.length + ' recordings loaded for ' + this.get('name'));

        if (_.isFunction(callback)) {
            callback();
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
