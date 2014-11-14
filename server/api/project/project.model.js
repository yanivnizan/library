'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  _id: String,
  platform: String,
  latest: String,
  releases: [String]
});

module.exports = mongoose.model('projects', ProjectSchema);