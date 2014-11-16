'use strict';

angular.module('libraryApp')
  .controller('MainCtrl', function ($scope, $http, $upload, $location) {
    var refreshProjects = function () {
      $http.get('/api/projects').success(function (projects) {
        $scope.projects = projects;
        $scope.selectedProject = null;
      });
    };
    refreshProjects();
    $scope.refreshReleases = function (projectId) {
      $http.get('/api/projects/' + projectId)
        .success(function (project) {
          $scope.projectReleases = _.map(project.releases, function (r) {
            return { projectId: projectId, version: r, isLatest: (r===project.latest) };
          });
          $scope.release.version = null;
          $scope.isActive = true;
          $scope.selectedFile = null;
        });
    };
    $scope.projectSelected = function(project) {
      if (!$scope.release) {
        $scope.release = {};
      }
      $scope.release.project = project;
      $scope.refreshReleases(project._id);
    };
    $scope.uploadFormValid = function() {
      return !($scope.selectedFile && $scope.release && $scope.release.project && $scope.release.version);
    };

    $scope.uploadInProgress = false;
    $scope.uploadPercent = 0;

    $scope.onFileSelect = function ($files) {
      $scope.selectedFile = $files[0];
    };

    $scope.uploadRelease = function () {
      $scope.ploadInProgress = true;
      $scope.upload = $upload.upload({
        url: '/api/releases/upload', //upload.php script, node.js route, or servlet url
        method: 'POST',
        //headers: {'header-key': 'header-value'},
        //withCredentials: true,
        data: {
          release: {
            projectId: $scope.release.project._id,
            version: $scope.release.version
          },
          isLatest: $scope.isLatest
        },
        file: $scope.selectedFile // or list of files ($files) for html5 only
        //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
        // customize file formData name ('Content-Disposition'), server side file variable name.
        //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'
        // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
        //formDataAppender: function(formData, key, val){}
      }).progress(function (evt) {
//        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        $scope.uploadPercent = parseInt(100.0 * evt.loaded / evt.total);
      }).success(function (data, status, headers, config) {
        // file is uploaded successfully
//        console.log(data);
        $scope.refreshReleases(data.projectId);
        $scope.ploadInProgress = false;
      }).error(function(err) {
        console.log('upload error: ' + err);
        $scope.ploadInProgress = false;
      });
    };

    $scope.selectedFile = null;
    $scope.projectReleases = null;
    $scope.release = null;
    $scope.isLatest = true;
    $scope.userFile = null;


    /* new project */
    $scope.project = null;
    $scope.submitNewProject = function () {
      if ($scope.project) {
        $http.post('/api/projects', $scope.project)
          .success(function () {
            $scope.project = null;
            refreshProjects();
          });
      }
    };

//    $scope.addThing = function() {
//      if($scope.newThing === '') {
//        return;
//      }
//      $http.post('/api/things', { name: $scope.newThing });
//      $scope.newThing = '';
//    };
//
//    $scope.deleteThing = function(thing) {
//      $http.delete('/api/things/' + thing._id);
//    };
  })

//angular.module('libraryApp')
//  .directive("fileread", [function () {
//    return {
//      scope: {
//        fileread: "="
//      },
//      link: function (scope, element, attributes) {
//        element.bind("change", function (changeEvent) {
//          scope.$apply(function () {
//            scope.fileread = changeEvent.target.files[0];
//            // or all selected files:
//            // scope.fileread = changeEvent.target.files;
//          });
//        });
//      }
//    }
//  }]);



  .directive('projectAvailable', function ($http, $timeout) {
    return {
      require: 'ngModel',
      link: function (scope, elem, attr, ctrl) {
        console.log(ctrl);
        ctrl.$parsers.push(function (viewValue) {
          ctrl.$setValidity('projectAvailable', true);
          if (ctrl.$valid) {
            ctrl.$setValidity('checkingProject', false);

            if (viewValue !== "" && typeof viewValue !== "undefined") {
              $http.get('/api/projects/' + viewValue + '/available')
                .success(function (data, status, headers, config) {
                  if (data.result) {
                    ctrl.$setValidity('projectAvailable', true);
                    ctrl.$setValidity('checkingProject', true);
                  } else {
                    ctrl.$setValidity('projectAvailable', false);
                    ctrl.$setValidity('checkingProject', true);
                  }
                })
                .error(function (data, status, headers, config) {
                  ctrl.$setValidity('projectAvailable', false);
                  ctrl.$setValidity('checkingProject', true);
                });
            } else {
              ctrl.$setValidity('projectAvailable', true);
              ctrl.$setValidity('checkingProject', true);
            }
          }
          return viewValue;
        });

      }
    }
  });
