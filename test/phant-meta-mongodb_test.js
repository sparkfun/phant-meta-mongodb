'use strict';

var PhantMeta = require('../lib/phant-meta-mongodb.js'),
    meta = PhantMeta();

exports.phantMeta = {

  setUp: function(done) {

    var data = {
      title: 'unit test',
      description: 'testing',
      fields: ['one', 'two', 'three'],
      tags: ['test'],
      hidden: false,
      flagged: false,
      last_push: 0
    };

    meta.create(data, function(err, stream) {

      this.stream = stream;

      // create another
      meta.create(data, function(err, stream) {
        done();
      });

    }.bind(this));

  },

  tearDown: function(done) {

    meta.remove(this.stream.id, function(err, status) {
      done();
    }.bind(this));

  },

  'created': function(test) {
    test.expect(1);
    test.ok(this.stream.id, 'should be ok');
    test.done();
  },

  'get stream': function(test) {

    test.expect(1);

    meta.get(this.stream.id, function(err, stream) {
      test.ok(this.stream.id, stream.id, 'should return the stream');
      test.done();
    }.bind(this));

  },

  'touch': function(test) {

    test.expect(1);

    var old = this.stream.last_push;

    meta.touch(this.stream.id, function(err, status) {

      meta.get(this.stream.id, function(err, stream) {
        test.ok(old < stream.last_push, 'should set last_push to now');
        test.done();
      }.bind(this));

    }.bind(this));

  },

  'flag': function(test) {

    test.expect(2);

    test.equal(this.stream.flagged, false, 'should not be flagged at creation');

    meta.flag(this.stream.id, function(err, status) {

      meta.get(this.stream.id, function(err, stream) {
        test.ok(stream.flagged, 'should now be flagged');
        test.done();
      }.bind(this));

    }.bind(this));

  },

  'list': function(test) {

    test.expect(2);

    meta.list(function(err, streams) {

      var limit = streams.length;

      test.ok(streams.length > 0, 'should return some items');

      meta.list(function(err, streams) {
        test.equal(streams.length, limit -1, 'should limit the list');
        test.done();
      }, 0, limit - 1);

    });

  },

  'remove': function(test) {

    test.expect(2);

    meta.remove(this.stream.id, function(err, status) {

      test.ok(status, 'should be ok');

      meta.get(this.stream.id, function(err, stream) {

        test.ok(!stream, 'should not return a stream');
        test.done();

      });

    }.bind(this));

  }

};

