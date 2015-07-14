
(function () {
    angular.module('notifsta.controllers').controller('LoginSignupCtrl',
      ['$scope', 'NotifstaHttp', '$cookies', 'Facebook', 'toaster', '$mdDialog',
      function ($scope, NotifstaHttp, $cookies, Facebook, toaster, $mdDialog, logging_in) {
          console.log('Login sign up controller made');
          console.log($mdDialog);
          console.log(logging_in);

          $scope.loading = false;

          $scope.credentials = {
              email: '',
              password: ''
          };
          $scope.submitted = false;

          $scope.facebook_login = function (event) {
              $scope.loading = true;
              if (event.$material) {
                  return; //Don't handle angular material bullshit
              }
              $scope.info = "Logging in...";
              Facebook.login(function (response) {
                  var facebook_token = response.authResponse.accessToken;
                  console.log(response)
                  Facebook.api('/me', function (response) {
                      var user = response;
                      var id = user.id;
                      console.log(user);
                      var email = user.email;
                      var promise = NotifstaHttp.FacebookLogin(email, id, facebook_token);
                      HandleLoginPromise(promise);

                  });
              }, { scope: 'email' });
          }
          $scope.info = "";

          $scope.AttemptLogin = function () {
              $scope.loading = true;
              $scope.info = "Logging in...";
              $scope.submitted = true;
              var promise = NotifstaHttp.Login($scope.credentials.email, $scope.credentials.password);
              HandleLoginPromise(promise);
          }

          $scope.AttemptSignup = function () {
              $scope.info = "Logging in...";
              $scope.loading = true;
              if ($scope.credentials.password != $scope.credentials.confirm_password) {
                  toaster.pop('error', 'passwords do not match!');
              } else {
                  var promise = NotifstaHttp.CreateUser($scope.credentials);
                  HandleSignupPromise(promise);
              }
          }

          function HandleSignupPromise(promise) {
              promise.success(function (data) {
                  console.log(data);
                  if (data.status === "failure") {
                      toaster.pop('error', data.error);
                      $scope.loading = false;
                  }
                  else if (data.status === "success") {
                      toaster.pop('success', 'Signup successful!');
                      RedirectTo($scope.redirect_url || '#/dashboard?signup=true');
                  }
                  else {
                      $scope.info = "Unspecified error - contact us for more information!"
                      $scope.loading = false;
                  }
              })
          }
          function HandleLoginPromise(promise) {
              promise.success(function (data) {
                  if (data.status == "failure") {
                      toaster.pop('error', 'Incorrect username and password combination');
                      $scope.loading = false;
                  }
                  else if (data.status === "success") {
                      toaster.pop('success', 'Successfully logged in!');
                      RedirectTo($scope.redirect_url || '#/dashboard');
                  }
                  else {
                  }
                  $scope.info = "";
                  $scope.submitted = false;
              });
              promise.error(function (data) {
                  $scope.submitted = false;
                  toaster.pop('error', 'Incorrect username and password combination');
                  $scope.info = "";
                  $scope.loading = false;
              })
          }

          function RedirectTo(url) {
              setTimeout(function () {
                  window.location = url; //Tempory fix
                  window.location.reload()
              }, 250);
          }


      }]);
}());