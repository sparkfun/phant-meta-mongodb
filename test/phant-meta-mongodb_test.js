'use strict';

var phantMeta = require('../lib/phant-meta-mongodb.js');

exports.phantMeta = {
  setUp: function(done) {
    done();
  },
  'no args': function(test) {
    test.expect(1);
    test.ok(phantMeta, 'should be ok');
    test.done();
  }
};
