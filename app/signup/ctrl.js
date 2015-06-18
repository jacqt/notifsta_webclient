/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for logging in as a user
 */
(function(){
  angular.module('notifsta.controllers').controller('SignupCtrl',
    ['$scope', 'NotifstaHttp', '$cookies', 'Facebook', 'toaster', function($scope, NotifstaHttp,  $cookies, Facebook, toaster) {

      $scope.credentials = {
        email: '',
        password: ''
      };

      $scope.facebook_login = function(){
        console.log('logging in to facebook');
        Facebook.login(function(response) { 
          var facebook_token = response.authResponse.accessToken;
          console.log(response) 
          Facebook.api('/me', function(response) {
            var user = response;
            var id = user.id;
            console.log(user);
            var email = user.email;
            var promise = NotifstaHttp.FacebookLogin(email, id, facebook_token);
            HandleSignupPromise(promise);

          });
        }, {scope:'email'});

      }
      $scope.info = "";

      $scope.AttemptSignup = function(){
        $scope.info = "Logging in...";
        if ($scope.credentials.password != $scope.credentials.confirm_password){
          toaster.pop('error', 'passwords do not match!');
        } else {
          var promise = NotifstaHttp.CreateUser($scope.credentials);
          HandleSignupPromise(promise);
        }
      }

      function HandleSignupPromise(promise){
        promise.success(function(data){
          console.log(data);
          if (data.status === "failure"){
            toaster.pop('error', data.error);
          } 
          else if (data.status === "success"){
            toaster.pop('success', 'Signup up successful!');
              setTimeout(function () {
                  window.location = ''; //Tempory fix
              }, 1000);
          } 
          else {
            $scope.info = "Unspecified error - contact us for more information!"
          }
        })
      }
    }]);
})();
