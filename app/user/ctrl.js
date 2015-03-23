/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function(){
    angular.module('notifsta.controllers').controller('UserPanelController',
    ['$scope', 'NotifstaHttp', 'UserService', '$cookies', '$timeout', function($scope, NotifstaHttp, UserService, $cookies, $timeout) {
        var TIMEOUT = 2 * 1000; //5 seconds
        var _websocket_enabled = false;

        $scope.logged_in = UserService.GetEventLoggedIn;

        // Need to make 'cmd' a child element of input. The issue is
        // documented here:
        // http://stackoverflow.com/questions/12618342/ng-model-does-not-update-controller-value
        $scope.input = {
            name: 'anthony_guo@live.com',
            password: 'asdfasdf'
        };

        $scope.email = 'lukas@me.com';

        $scope.tags = [];

        $scope.selected_event;

        $scope.SelectEvent = function(event){
            if ($scope.selected_event){
                $scope.selected_event.active = false;
            }
            event.active = true;
            $scope.selected_event = event;
            UserService.UpdateUserEvent($scope.selected_event);
        }

        function UpdateLoop(){
            if ($scope.selected_event){
                UserService.UpdateUserEvent($scope.selected_event);
            }
            if ($scope.data.User && $scope.data.User.events && $scope.data.User.events.length > 0 && !$scope.selected_event){
                $scope.SelectEvent($scope.data.User.events[0]);
            }
            setTimeout(UpdateLoop, TIMEOUT);
        }
        $scope.data = UserService.data;
        UserService.SetUser($scope.email);
        UpdateLoop();
    }]);
})();
