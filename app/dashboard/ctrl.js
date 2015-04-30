/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for the dashboard
 */
(function(){
    angular.module('notifsta.controllers').controller('DashboardCtrl',
        ['$scope', 'NotifstaHttp', 'toaster' ,function($scope, NotifstaHttp,  toaster, $cookies) {

          $scope.go_create_event = function(){
            window.location = '#/create_event';
          }
          $scope.say_sorry = function(){
            toaster.pop('info', 'Sorry - we\'re still working on all our features!');
          }
    }]);
})();
