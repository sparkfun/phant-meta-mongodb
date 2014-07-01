/**
 * phant-meta-mongodb
 * https://github.com/sparkfun/phant-meta-mongodb
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

var mongoose = require('mongoose'),
    Meta = require('./meta'),
    events = require('events'),
    util = require('util');

/**** Make PhantMeta an event emitter ****/
util.inherits(PhantMeta, events.EventEmitter);

/**** PhantMeta prototype ****/
var app = PhantMeta.prototype;

/**** Expose PhantMeta ****/
exports = module.exports = PhantMeta;

/**** Initialize a new PhantMeta ****/
function PhantMeta(config) {

  if (! (this instanceof PhantMeta)) {
    return new PhantMeta(config);
  }

  events.EventEmitter.call(this);

  util._extend(this, config || {});

  this.connect();

}

app.name = 'Metadata MongoDB';
app.mongoose = false;
app.url = 'mongodb://localhost/test';

app.connect = function() {

  // return if already connected
  if(this.mongoose && this.mongoose.connection.readyState) {
    return;
  }

  // connect to mongo
  mongoose.connect(this.url, {server: {auto_reconnect: true}});

  // log errors
  mongoose.connection.on('error', function(err) {
    this.emit('error', err);
  }.bind(this));

  // log connection status
  mongoose.connection.once('open', function() {
    this.emit('info', 'Connected to MongoDB');
  }.bind(this));

  this.mongoose = mongoose;

};

app.get = function(id, callback) {

  Meta.findById(id, function(err, stream) {

    if(! stream || err) {
      return callback('stream not found');
    }

    callback(null, stream);

  });

};

app.create = function(data, callback) {

  var stream = new Meta(data);

  stream.save(function(err) {

    if(err) {
      return callback('creation failed');
    }

    callback(null, stream);

  });

};

app.touch = function(id, callback) {

  this.update(id, {last_push: Date.now()}, callback);

};

app.delete = function(id, callback) {

  Meta.findById(id, function(err, stream) {

    if(! stream || err) {
      return callback('stream not found');
    }

    stream.remove(function(err) {

      if(err) {
        return callback('delete failed');
      }

      callback(null);

    });

  });

};
