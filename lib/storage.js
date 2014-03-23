var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = function(collection, fields, cap) {

  try {

    if (mongoose.model(collection)) {
      return mongoose.model(collection);
    }

  } catch(e) {

    if (e.name === 'MissingSchemaError') {

      // mongoose schema options
      var options = {
        _id: false,
        autoIndex: false,
        strict: true,
        versionKey: false
      };

      // default schema def
      var definition = {
        date: {
          type: Date,
          default: Date.now,
          required: true
        }
      };

      // loop through fields and add them
      // to the schema
      fields.forEach(function(field) {

        definition[field] = {
          type: mongoose.Schema.Types.Mixed,
          default: null,
          required: true
        };

      });

      // force a cap if provided
      if(cap) {
        options.capped = { size: cap, autoIndexId: false };
      }

      var schema = new Schema(definition, options);

      return mongoose.model(collection, schema);

   }

  }

};

