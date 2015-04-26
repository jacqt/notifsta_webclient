/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for logging out the user
 */
(function(){
    angular.module('notifsta.controllers').controller('LogoutCtrl',
        ['$scope', 'AuthService', '$cookies',function($scope, AuthService,  $cookies) {
            AuthService.Logout();
            window.location = '#/';
    }]);
})();
