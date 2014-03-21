/**
 * phant-storage-mongodb
 * https://github.com/sparkfun/phant-storage-mongodb
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

var mongoose = require('mongoose'),
    Stream = require('./stream'),
    Storage = require('./storage'),
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

  this.name = 'Phant MongoDB Storage';
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

  Stream.find({}).lean().sort({_id: -1}).exec(function(err, streams) {

    if(err) {
      return callback(errorHelper(err).join(' - '), false);
    }

    callback('', streams);

  });

};

app.get = function(id, callback) {

  Stream.findById(id, function(err, stream) {

    if(err) {
      return callback(errorHelper(err).join(' - '), false);
    }

    callback('', stream);

  });

};

app.create = function(data, callback) {

  var stream = new Stream({
    title: data.title,
    description: data.description,
    tags: data.tags,
    fields: data.fields
  });

  stream.save(function(err) {

    if(err) {
      return callback(errorHelper(err).join(' - '), false);
    }

    callback('', stream);

  });

};

app.remove = function(id, callback) {

  Stream.findById(id, function(err, stream) {

    if(err) {
      return callback(false);
    }

    stream.remove(function(err) {

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

  Stream.findById(id, function(err, stream) {

    if(err) {
      return callback('stream not found', false);
    }

    // make sure all keys are valid
    for(var key in data) {

      if(! data.hasOwnProperty(key)) {
        continue;
      }

      if(stream.fields.indexOf(key) === -1) {

        err = key + " is not a valid field for this stream. \n\n";
        err += 'expecting: ' + stream.fields.join(', ');

        return callback(err, false);

      }

    }

    // make sure all fields exist in data
    for(var i=0; i < stream.fields.length; i++) {

      if(! data.hasOwnProperty(stream.fields[i])) {

        err = stream.fields[i] + " missing from sent data. \n\n";
        err += 'expecting: ' + stream.fields.join(', ');

        return callback(err, false);

      }

    };

    callback('', true);

  });

};

app.getRecords = function(id, callback) {

  var cap = this.cap;

  Stream.findById(id, function(err, stream) {

    if(err) {
      return callback(errorHelper(err).join(' - '), false);
    }

    var StorageModel = Storage(id, stream.fields, cap);

    StorageModel.find({}).lean().sort({_id: -1}).exec(function(err, records) {

      if(err) {
        return callback(errorHelper(err).join(' - '), records);
      }

      callback('', records);

    });

  });

};

app.receive = function(id, data) {

  var self = this;

  this.addRecord(id, data, function(err, success) {

    if(! success) {
      self.emit('error', err);
    }

  });

};

app.addRecord = function(id, data, callback) {

  var cap = this.cap;

  Stream.findById(id, function(err, stream) {

    if(err) {
      return callback(errorHelper(err).join(' - '), false);
    }

    var StorageModel = Storage(id, stream.fields, cap),
        bucket = new StorageModel(data);

    bucket.save(function(err) {

      if(err) {
        return callback(errorHelper(err).join(' - '), false);
      }

      return callback('', true);

    });

  });

};
