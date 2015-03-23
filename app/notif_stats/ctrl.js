/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function(){
    angular.module('notifsta.controllers').controller('NotifStatsCtrl',
    ['$scope', 'NotifstaHttp', 'NotifStatsService', '$cookies', '$timeout', '$routeParams', 
    function($scope, NotifstaHttp, NotifStatsService, $cookies, $timeout, $routeParams) {
        $scope.notif_id = $routeParams.notif_id;
        $scope.notification = {
            event_id: $routeParams.event_id,
            id: $routeParams.notif_id
        }
        var TIMEOUT = 1 * 1000;

        NotifStatsService.SetNotif($scope.notification.event_id, $scope.notification.id);

        $scope.data = NotifStatsService.data;

    }]);
})();
