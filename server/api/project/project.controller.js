/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /projects              ->  index
 * POST    /projects              ->  create
 * GET     /projects/:id          ->  show
 * PUT     /projects/:id          ->  update
 * DELETE  /projects/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Project = require('./project.model');
var Release = require('./../release/release.model');
var Mixpanel = require('./../../components/mixpanel');
var fs = require('fs-extra');

// Get list of projects
exports.index = function (req, res) {
  Project.find(function (err, projects) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, projects);
  });
};

// Get a single project
exports.show = function (req, res) {
  Project.findById(req.params.id, function (err, project) {
    if (err) {
      return handleError(res, err);
    }
    if (!project) {
      return res.send(404);
    }
    return res.json(project);
  });
};

exports.isAvailable = function (req, res) {
  Project.where({ _id: req.params.id }).count(function(err, cnt) {
    if (err) {
      return handleError(res, err);
    }
    return res.json({ result: cnt===0 });
  });
};

// Creates a new project in the DB.
exports.create = function (req, res) {
  Project.create(req.body, function (err, project) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(201, project);
  });
};

// Updates an existing project in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Project.findById(req.params.id, function (err, project) {
    if (err) {
      return handleError(res, err);
    }
    if (!project) {
      return res.send(404);
    }
    var updated = _.merge(project, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, project);
    });
  });
};

// Deletes a project from the DB.
exports.destroy = function (req, res) {
  Project.findById(req.params.id, function (err, project) {
    if (err) {
      return handleError(res, err);
    }
    if (!project) {
      return res.send(404);
    }
    project.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

exports.fetchRelease = function (req, res) {
  Project.findOne({ _id: req.params.id }, function (err, project) {
    if (err) {
      return handleError(res, err);
    }

    if (!project) {
      return res.send(404);
    }


    // fetching only the latest version
    var version = req.params.version;
    if (version === 'latest') {
      version = project.latest;
    }

    Release.findOne({ _id: (version + '/' + project.id) }, function (err, release) {

      if (err) {
        return handleError(res, err);
      }

      if (!release) {
        return res.send(404);
      }

      Mixpanel.track("library_download", {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        remote_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        project: project.id,
        release: release.id,
        version: release.version,
        platform: project.platform,
        fetchLatest: req.params.version === 'latest'
      });

      res.setHeader("content-disposition", "attachment; filename='" + release.filename + "'");
      var readFile = fs.createReadStream('./uploads/projects/' + project.id + '/' + release.localFilename);
      readFile.pipe(res);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}