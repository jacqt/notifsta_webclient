/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function(){
    angular.module('notifsta.controllers').controller('EventCtrl',
    ['$scope', 'NotifstaHttp', 'EventService', '$cookies', '$timeout', '$routeParams', 
    function($scope, NotifstaHttp, EventService, $cookies, $timeout, $routeParams) {
        //TESTING PURPOSES ONLY
        //var p = NotifstaHttp.LoginEvent('event1', 'asdfasdf');
        $scope.event_name = $routeParams.event_name;
        $scope.event = {
            name: $routeParams.event_name,
            id: $routeParams.event_id
        }
        var TIMEOUT = 1 * 1000;

        EventService.SetEvent($scope.event.name, $scope.event.id);

        //Data binding for new notifications
        $scope.input = {
            broadcast: '',
            options: [],
            next_option: {
                text: ''
            }
        }

        $scope.submit_option = function(notif){
            var promise = NotifstaHttp.SubmitResponse(notif.id, notif.response.option_id);
            promise.success(function(resp){
                console.log(resp);
            });
        }

        $scope.selected_none = function(){
            return $scope.data.Event.channels.filter(function(e){return e.selected}).length  ==  0;
        }

        $scope.data = EventService.data;

    }]);
})();
