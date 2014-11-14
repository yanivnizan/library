'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReleaseSchema = new Schema({
  _id: String,
  projectId: String,
  version: String,
  filename: String,
  localFilename: String,
  added: Date
});

module.exports = mongoose.model('releases', ReleaseSchema);