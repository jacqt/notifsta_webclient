/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for logging in as a user
 */
(function(){
  angular.module('notifsta.controllers').controller('SignupCtrl',
    ['$scope', 'NotifstaHttp', '$cookies', 'Facebook', function($scope, NotifstaHttp,  $cookies, Facebook) {

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
            HandleLoginPromise(promise);

          });
        }, {scope:'email'});

      }
      $scope.info = "";

      $scope.AttemptLogin = function(){
        $scope.info = "Logging in...";
        var promise = NotifstaHttp.Login($scope.credentials.email, $scope.credentials.password);
        HandleLoginPromise(promise);
      }

      function HandleLoginPromise(promise){
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
