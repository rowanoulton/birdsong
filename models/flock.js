/**
 * Dependencies
 */
var _ = require('underscore');

/**
 * Constructor
 */

/*
 * @class Flock
 * @constructor
 * @param {Array} [birds] Optional array of birds to begin with
 */
function Flock (birds) {
    this.birds = [];

    if (_.isArray(birds)) {
        this.add(birds);
    }
};

/**
 * Methods
 */

/*
 * Get a random(!) bird from the flocks collection
 *
 * @method getRandom
 * @return {Bird}
 */
Flock.prototype.getRandom = function () {
    return _.sample(this.birds);
};

/*
 * Returns the current count of birds in this collection
 *
 * @method getCount
 * @return {Integer} count The count of birds in this collection
 */
Flock.prototype.getCount = function () {
    return this.birds.length;
};

/*
 * Add one or many birds to the collection
 *
 * @method add
 * @param {Array|Bird} data
 */
Flock.prototype.add = function (data) {
    if (_.isArray(data)) {
        _.each(data, function (bird) {
            this._add(bird);
        }.bind(this));
    } else if (_.isObject(data)) {
        this._add(data);
    }
};

/*
 * Adds a single instance of a Bird model to internal collection
 *
 * @private
 * @method _add
 * @param {Bird} bird
 */
Flock.prototype._add = function (bird) {
    this.birds.push(bird);

    // @todo: Trigger "bird added" custom event, or implement extension of a
    // backbone collection if it would suite
    console.log('Bird added: ' + bird.get('name'));
};

/**
 * Export
 */
module.exports = Flock;
