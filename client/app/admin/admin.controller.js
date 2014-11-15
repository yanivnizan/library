'use strict';

angular.module('libraryApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    var refreshUsers = function () {
      $scope.users = User.query();
      $scope.users.$promise.then(function (result) {
        angular.forEach(result, function(u, i) {
          u.isAdmin = (u.role==='admin');
        });
        $scope.users = result;
      });

    };
    refreshUsers();


    $scope.saveRole = function(user) {
      if (user.isAdmin) {
        user.role = 'admin';
      } else {
        user.role = 'user';
      }
      User.changeRole({ id: user._id }, { role: user.role });
    };

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };

    // Adding new users
    $scope.add = function () {
      User.save($scope.userToAdd,
        function(data) {
          refreshUsers();
        },
        function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
//            form[field].$setValidity('mongoose', false);
//            $scope.errors[field] = error.message;
            alert(error.message);
          });
        });
    };
    $scope.userToAdd = null;
  });
