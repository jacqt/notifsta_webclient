/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for logging in as a user
 */
(function () {
    angular.module('notifsta.controllers').controller('LoginCtrl',
      ['$scope', 'NotifstaHttp', '$cookies', 'Facebook', 'toaster', function ($scope, NotifstaHttp, $cookies, Facebook, toaster) {

          $scope.credentials = {
              email: '',
              password: ''
          };

          $scope.facebook_login = function () {
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
              $scope.info = "Logging in...";
              var promise = NotifstaHttp.Login($scope.credentials.email, $scope.credentials.password);
              HandleLoginPromise(promise);
          }

          function HandleLoginPromise(promise) {
              promise.success(function (data) {
                  if (data.status == "failure") {
                      toaster.pop('error', 'Incorrect username and password combination');
                  }
                  else if (data.status === "success") {
                      toaster.pop('success', 'Successfully logged in!');
                      window.location = '#dashboard'
                  }
                  else {
                  }
                  $scope.info = "";
              });
              promise.error(function (data) {
                  toaster.pop('error', 'Incorrect username and password combination');
                  $scope.info = "";
              })
          }


      }]);
})();
