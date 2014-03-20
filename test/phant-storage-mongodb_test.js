'use strict';

var phantStorageMongodb = require('../lib/phant-storage-mongodb.js');

exports.phantStorageMongodb = {
  setUp: function(done) {
    done();
  },
  'no args': function(test) {
    test.expect(1);
    test.ok(phantStorageMongodb, 'should be ok');
    test.done();
  }
};
