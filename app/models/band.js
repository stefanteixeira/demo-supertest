var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BandSchema = new Schema({
  name: String
});

module.exports = mongoose.model('Band', BandSchema);
