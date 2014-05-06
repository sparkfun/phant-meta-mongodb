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
    util = require('util'),
    errorHelper = require('mongoose-error-helper').errorHelper;

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

  config = config || {};

  events.EventEmitter.call(this, config);

  util._extend(this, config);

  this.connect();

}

app.name = 'Metadata MongoDB';
app.mongoose = false;
app.mongoUrl = 'mongodb://localhost/test';

app.connect = function() {

  // return if already connected
  if(this.mongoose && this.mongoose.connection.readyState) {
    return;
  }

  // connect to mongo
  mongoose.connect(this.url, {server: {auto_reconnect:true}});

  // log errors
  mongoose.connection.on('error', console.error.bind(console, 'MongoDB Connection Error:'));

  // log connection status
  mongoose.connection.once('open', function() {
    console.log('Connected to MongoDB');
  });

  this.mongoose = mongoose;

};

app.list = function(callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  Meta.find({}).sort({_id: -1}).skip(offset).limit(limit).exec(function(err, streams) {

    if(err) {
      return callback(errorHelper(err), false);
    }

    callback('', streams);

  });

};

app.listByTag = function(tag, callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  Meta.find({ tags: tag }).sort({_id: -1}).skip(offset).limit(limit).exec(function(err, streams) {

    if(err) {
      return callback(errorHelper(err), false);
    }

    callback('', streams);

  });

};

app.listByActivity= function(callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  Meta.find({}).sort({last_pushed: -1}).skip(offset).limit(limit).exec(function(err, streams) {

    if(err) {
      return callback(errorHelper(err), false);
    }

    callback('', streams);

  });

};

app.get = function(id, callback) {

  Meta.findById(id, function(err, stream) {

    if(err) {
      return callback(errorHelper(err), false);
    }

    callback('', stream);

  });

};

app.create = function(data, callback) {

  var stream = new Meta({
    title: data.title,
    description: data.description,
    tags: data.tags,
    fields: data.fields
  });

  stream.save(function(err) {

    if(err) {
      return callback(errorHelper(err), false);
    }

    callback('', stream);

  });

};

app.remove = function(id, callback) {

  Meta.findById(id, function(err, stream) {

    if(! stream || err) {
      return callback('stream not found', false);
    }

    stream.remove(function(err) {

      if(err) {
        return callback(errorHelper(err), false);
      }

      callback('', true);

    });

  });

};
