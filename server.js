var express = require('express'),
  app = express(),
  multer = require('multer'),
  bodyParser = require('body-parser');

var mongoose = require('./mongoose');
var fs = require('fs-extra');
var _ = require('underscore');
var Mixpanel = require('mixpanel');

var mixpanel = Mixpanel.init('f67499876bf3970d8810d066550124fe');


app.use(bodyParser.json());

app.use(multer({
  dest: './static/uploads/'
//  rename: function (fieldname, filename) {
//    return filename.replace(/\W+/g, '-').toLowerCase();
//  }
}));
app.use(express.static(__dirname + '/static'));

app.get('/projects', function (req, res) {
  mongoose.Project.find({}, '_id releases', function (err, projects) {
    if (err) {
      console.log(err);
      return res.status(500).send({ success: false, error: "Error when fetching projects." });
    }

    res.status(200).send({ success: true, projects: (projects ? projects : []) });
  });
});

app.get('/project/:name', function (req, res) {
  mongoose.Project.findOne({ _id: req.params.name }, '_id releases latest', function (err, project) {
    if (err) {
      console.log(err);
      return res.status(500).send({ success: false, error: "Error when fetching projects." });
    }

    if (!project) {
      console.log(project);
      return res.status(404).send({ success: false, error: ("Project not found: " + req.params.name) });
    }

    res.status(200).send({ success: true, project: project });
  });
});

app.post('/project/new', function (req, res) {

  var project = new mongoose.Project({ _id: req.body.name });
  project.save(function (err) {
    if (err) {

      if (err.code === 11000) {
        return res.status(500).send({ success: false, error: "Project name already exists"});
      } else {
        return res.status(500).send({ success: false, error: "unexpected error"});
      }

    }

    res.status(200).send({ success: true });
  });
});


app.post('/project/:name/:releaseName/delete', function (req, res) {
  mongoose.Project.findOne({ _id: req.params.name }, function (err, project) {
    if (err) {
      console.log(err);
      return res.status(500).send({ success: false, error: "Error when fetching project." });
    }

    if (!project) {
      console.log('Cant find project: ' + req.params.name);
      return res.status(500).send({ success: false, error: 'Cant find project: ' + req.params.name });
    }

    mongoose.Release.findOne({ _id: req.params.releaseName, projectId: project.id }, function(err, release) {
      if (err) {
        console.log(err);
        return res.status(500).send({ success: false, error: "Error when trying to fetch release: " + req.params.releaseName });
      }

      if (!release) {
        console.log(err);
        return res.status(500).send({ success: false, error: "Can't find the required release to delete: " + req.params.releaseName });
      }

      fs.delete('./static/projects/' + project.id + '/' + release.localFilename);
      release.remove(function(err) {
        if (err) {
          console.log(err);
          return res.status(500).send({ success: false, error: "Error when trying to remove release: " + req.params.releaseName });
        }

        mongoose.Release
          .find({ projectId: project.id })
          .sort({ 'added': -1 })
          .limit(1)
          .exec(function (err, releases) {
            if (err) {
              console.log(err);
              return res.status(500).send({ success: false, error: "Error when fetching releases for setting new latest." });
            }

            if (!releases) {
              project.latest = null;
            } else {
              project.latest = releases[0].id;
            }
            project.save();
          });
      });
    });



  });
});

app.post('/project/:name/:releaseName/upload', function (req, res) {
  mongoose.Project.findOne({ _id: req.params.name }, function (err, project) {
    if (err) {
      console.log(err);
      return res.status(500).send({ success: false, error: "Error when fetching project." });
    }

    if (!project) {
      console.log('Cant find project: ' + req.params.name);
      return res.status(500).send({ success: false, error: 'Cant find project: ' + req.params.name });
    }


    var postReleaseSave = function() {
      fs.move('./static/uploads/' + req.files.userFile.name,
          './static/projects/' + req.params.name + '/' + req.files.userFile.name,
        { clobber: true },
        function (err) {
        });

      if (!_.contains(project.releases, req.params.releaseName)) {
        project.releases.push(req.params.releaseName);
      }

      if (req.body.latest === 'on') {
        project.latest = req.params.releaseName;
      }

      project.save(function (err) {
        if (err) {
          console.log(err);
          return res.status(500).send({ success: false, error: "Error when trying to save latest to project." });
        }

        res.status(200).send({ success: true });
      });

    };

    mongoose.Release.findOne({ _id: req.params.releaseName, projectId: project.id }, function(err, release) {
      if (err) {
        console.log(err);
        return res.status(500).send({ success: false, error: "Error when fetching latest release." });
      }

      if (!release) {
        release = new mongoose.Release({
          _id: req.params.releaseName,
          filename: req.files.userFile.originalname,
          localFilename: req.files.userFile.name,
          projectId: project.id,
          added: new Date()
        });
      } else {
        fs.delete('./static/projects/' + project.id + '/' + release.localFilename);
        release.localFilename = req.files.userFile.name;
        release.filename = req.files.userFile.originalname;
      }
      release.save(function (err) {
        if (err) {
          console.log(err);
          return res.status(500).send({ success: false, error: "Error when trying to save release." });
        }

        postReleaseSave();
      });
    });

  });
});

app.get('/project/:name/latest', function (req, res) {
  mongoose.Project.findOne({ _id: req.params.name }, function (err, project) {
    if (err) {
      console.log(err);
      return res.status(500).send({ success: false, error: "Error when fetching project." });
    }

    if (!project) {
      console.log('Cant find project: ' + req.params.name);
      return res.status(500).send({ success: false, error: 'Cant find project: ' + req.params.name });
    }

    mongoose.Release.findOne({ _id: project.latest, projectId: project.id }, function (err, release) {

      if (err) {
        console.log(err);
        return res.status(500).send({ success: false, error: "Error when fetching release." });
      }

      if (!project) {
        console.log('Cant find project: ' + req.params.name);
        return res.status(404).send({ success: false, error: 'Cant find latest release: ' + project.latest });
      }

      mixpanel.track("library_download", {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        remote_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        project: project.id,
        release: 'latest'
      });

      res.setHeader("content-disposition", "attachment; filename='" + release.filename + "'");
      var readFile = fs.createReadStream('./static/projects/' + req.params.name + '/' + release.localFilename);
      readFile.pipe(res);
    });
  });

});

app.get('/project/:name/:release', function (req, res) {
  mongoose.Project.findOne({ _id: req.params.name }, function (err, project) {
    if (err) {
      console.log(err);
      return res.status(500).send({ success: false, error: "Error when fetching project." });
    }

    if (!project) {
      console.log('Cant find project: ' + req.params.name);
      return res.status(500).send({ success: false, error: 'Cant find project: ' + req.params.name });
    }

    mongoose.Release.findOne({ _id: req.params.release, projectId: project.id }, function (err, release) {

      if (err) {
        console.log(err);
        return res.status(500).send({ success: false, error: "Error when fetching release." });
      }

      if (!release) {
        console.log('Cant find release: ' + req.params.release);
        return res.status(500).send({ success: false, error: 'Cant find latest release: ' + req.params.release });
      }

      mixpanel.track("library_download", {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        remote_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        project: project.id,
        release: release.id
      });

      res.setHeader("content-disposition", "attachment; filename='" + release.filename + "'");
      var readFile = fs.createReadStream('./static/projects/' + req.params.name + '/' + release.localFilename);
      readFile.pipe(res);
    });

  });
});


var server = app.listen(3000, function () {
  console.log('listening on port %d', server.address().port);
});