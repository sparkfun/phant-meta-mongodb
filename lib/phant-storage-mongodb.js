/**
 * phant-storage-mongodb
 * https://github.com/sparkfun/phant-storage-mongodb
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

var mongoose = require('mongoose'),
    Meta = require('./meta'),
    events = require('events'),
    errorHelper = require('mongoose-error-helper').errorHelper;

/**** PhantStorageMongodb prototype ****/
var app = PhantStorageMongodb.prototype;

/**** Expose PhantStorageMongodb ****/
exports = module.exports = PhantStorageMongodb;

/**** Initialize a new PhantStorageMongodb ****/
function PhantStorageMongodb(config) {

  if (! (this instanceof PhantStorageMongodb)) {
    return new PhantStorageMongodb(config);
  }

  this.name = 'Phant MongoDB Metadata Storage';
  config = config || {};

  if ('url' in config) { this.url  = config.url;  }
  if ('cap' in config) { this.cap  = config.cap;  }

  this.connect();

}

/**** Make PhantStorageMongodb an event emitter ****/
PhantStorageMongodb.prototype.__proto__ = events.EventEmitter.prototype;

app.mongoose = false;
app.mongoUrl = 'mongodb://localhost/test';
app.cap = false;

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

app.list = function(callback) {

  Meta.find({}).sort({_id: -1}).exec(function(err, metas) {

    if(err) {
      return callback(errorHelper(err).join(' - '), false);
    }

    callback('', metas);

  });

};

app.get = function(id, callback) {

  Meta.findById(id, function(err, meta) {

    if(err) {
      return callback(errorHelper(err).join(' - '), false);
    }

    callback('', meta);

  });

};

app.create = function(data, callback) {

  var meta = new Meta({
    title: data.title,
    description: data.description,
    tags: data.tags,
    fields: data.fields
  });

  meta.save(function(err) {

    if(err) {
      return callback(errorHelper(err).join(' - '), false);
    }

    callback('', meta);

  });

};

app.remove = function(id, callback) {

  Meta.findById(id, function(err, meta) {

    if(err) {
      return callback(false);
    }

    meta.remove(function(err) {

      if(err) {
        return callback(false);
      }

      this.mongoose.connection.db.dropCollection(id, function(err) {

        if(err) {
          return callback(false);
        }

        callback(true);

      });

    });

  });

};

app.validateFields = function(id, data, callback) {

  Meta.findById(id, function(err, meta) {

    if(err) {
      return callback('meta not found', false);
    }

    // make sure all keys are valid
    for(var key in data) {

      if(! data.hasOwnProperty(key)) {
        continue;
      }

      if(meta.fields.indexOf(key) === -1) {

        err = key + " is not a valid field for this meta. \n\n";
        err += 'expecting: ' + meta.fields.join(', ');

        return callback(err, false);

      }

    }

    // make sure all fields exist in data
    for(var i=0; i < meta.fields.length; i++) {

      if(! data.hasOwnProperty(meta.fields[i])) {

        err = meta.fields[i] + " missing from sent data. \n\n";
        err += 'expecting: ' + meta.fields.join(', ');

        return callback(err, false);

      }

    }

    callback('', true);

  });

};
