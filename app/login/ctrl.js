/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for logging in as a user
 */
(function(){
    angular.module('notifsta.controllers').controller('LoginCtrl',
        ['$scope', 'NotifstaHttp', '$cookies',function($scope, NotifstaHttp,  $cookies) {

        $scope.credentials = {
            email: 'admin@example.com',
            password: 'asdfasdf'
        };

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
