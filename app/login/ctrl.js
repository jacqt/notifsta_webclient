/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for logging in as a user
 */
(function(){
  angular.module('notifsta.controllers').controller('LoginCtrl',
    ['$scope', 'NotifstaHttp', '$cookies', 'Facebook', function($scope, NotifstaHttp,  $cookies, Facebook) {

      $scope.credentials = {
        email: '',
        password: ''
      };

      $scope.facebook_login = function(){
        Facebook.login(function(response) { 
          var facebook_token = response.accessToken;
          console.log(response) 
          Facebook.api('/me', function(response) {
            var user = response;
            var id = user.id;
            var email = user.email;
            NotifstaHttp.FacebookLogin(email, id, facebook_token);

          });
        });

      }

      $scope.info = "";

      $scope.AttemptLogin = function(){
        $scope.info = "Logging in...";
        var promise = NotifstaHttp.Login($scope.credentials.email, $scope.credentials.password);
        promise.success(function(data){
          console.log(data);
          if (data.status === "failure"){
            $scope.info = "Invalid email and password combination";
          } 
          else if (data.status === "success"){
            $scope.info = "Successfuly logged in!";
            window.location = '#dashboard'

          } 
          else {
            $scope.info = "Unspecified error - contact us for more information!"
          }
        })
      }
    }]);
})();
