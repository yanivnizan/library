/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /releases              ->  index
 * POST    /releases              ->  create
 * GET     /releases/:id          ->  show
 * PUT     /releases/:id          ->  update
 * DELETE  /releases/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Release = require('./release.model.js');
var Project = require('./../project/project.model.js');
var fs = require('fs-extra');

// Get list of releases
exports.index = function(req, res) {
  Release.find(function (err, releases) {
    if(err) { return handleError(res, err); }
    return res.json(200, releases);
  });
};

// Get a single release
exports.show = function(req, res) {
  Release.findById(req.params.id, function (err, release) {
    if(err) { return handleError(res, err); }
    if(!release) { return res.send(404); }
    return res.json(release);
  });
};

// Uploads a new release to the DB.
exports.upload = function(req, res) {
//  console.log(JSON.stringify(req.files));
//  console.log(JSON.stringify(req.body));
//
//  res.send(200);
  var inRelease = JSON.parse(req.body.release);
  Project.findOne({ _id: inRelease.projectId }, function (err, project) {
    if (err) {
      return handleError(res, err);
    }

    if (!project) {
      return res.json(404);
    }

    Release.findById({ _id: (inRelease.version+'/'+project.id) }, function(err, release) {
      if (err) {
        return handleError(res, err);
      }

      var postReleaseSave = function(release) {
        fs.move('./uploads/raw/' + req.files.file.name,
            './uploads/projects/' + project.id + '/' + req.files.file.name,
          { clobber: true },
          function (err) {
          });

        if (!_.contains(project.releases, release.version)) {
          project.releases.push(release.version);
        }

        if (req.body.isLatest) {
          project.latest = release.version;
        }

        project.save(function (err) {
          if (err) {
            return handleError(500, err);
          }

          res.json(200, release);
        });

      };

      if (!release) {
        release = new Release({
          _id: (inRelease.version+'/'+project.id),
          filename: req.files.file.originalname,
          localFilename: req.files.file.name,
          projectId: project.id,
          version: inRelease.version,
          added: new Date()
        });
      } else {
        fs.delete('./uploads/projects/' + project.id + '/' + release.localFilename);
        release.localFilename = req.files.file.name;
        release.filename = req.files.file.originalname;
      }
      release.save(function (err) {
        if (err) {
          handleError(res, err);
        }

        postReleaseSave(release);
      });
    });

  });
};

// Deletes a release from the DB.
// TODO: implement this !
exports.destroy = function(req, res) {
  Release.findById(req.params.id, function (err, release) {
    if(err) { return handleError(res, err); }
    if(!release) { return res.send(404); }
    release.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}