
(function () {
    angular.module('notifsta.controllers').controller('LoginSignupCtrl',
      ['$scope', 'NotifstaHttp', '$cookies', 'Facebook', 'toaster', '$mdDialog',
      function ($scope, NotifstaHttp, $cookies, Facebook, toaster, $mdDialog, logging_in) {
          console.log('Login sign up controller made');
          console.log($mdDialog);
          console.log(logging_in);

          $scope.credentials = {
              email: '',
              password: ''
          };
          $scope.submitted = false;

          $scope.facebook_login = function (event) {
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
              console.log(' attempting 2 login')
              $scope.info = "Logging in...";
              $scope.submitted = true;
              var promise = NotifstaHttp.Login($scope.credentials.email, $scope.credentials.password);
              HandleLoginPromise(promise);
          }

          $scope.AttemptSignup = function () {
              $scope.info = "Logging in...";
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
                  }
                  else if (data.status === "success") {
                      toaster.pop('success', 'Signup up successful!');
                      window.location = ''; //Tempory fix
                  }
                  else {
                      $scope.info = "Unspecified error - contact us for more information!"
                  }
              })
          }
          function HandleLoginPromise(promise) {
              promise.success(function (data) {
                  if (data.status == "failure") {
                      toaster.pop('error', 'Incorrect username and password combination');
                  }
                  else if (data.status === "success") {
                      toaster.pop('success', 'Successfully logged in!');
                      setTimeout(function () {
                          window.location = ''; //Tempory fix
                      }, 50);
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
              })
          }


      }]);
}());