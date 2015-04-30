/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function(){
    angular.module('notifsta.controllers').controller('EventCtrl',
    ['$scope', 'NotifstaHttp', 'EventMonitor', '$cookies', '$timeout', '$routeParams' ,'ImcService', 
    function($scope, NotifstaHttp, EventMonitor, $cookies, $timeout, $routeParams, ImcService) {
        //TESTING PURPOSES ONLY
        //var p = NotifstaHttp.LoginEvent('event1', 'asdfasdf');
        $scope.event_name = $routeParams.event_name;
        $scope.event = {
            name: $routeParams.event_name,
            id: $routeParams.event_id
        }
        var TIMEOUT = 1 * 1000;

        var event_monitor = EventMonitor.GetMonitor($scope.event, EventMonitor.NON_ADMIN_MONITOR);

        //Data binding for new notifications
        $scope.input = {
            broadcast: '',
            options: [],
            next_option: {
                text: ''
            }
        }

        $scope.submit_option = function(notif, channel_id){
            var promise = NotifstaHttp.SubmitResponse(notif.id, notif.response.new_option_id);
            promise.success(function(resp){
                console.log(resp);
                event_monitor.UpdateNotification(notif.id, channel_id)
            });
        }

        $scope.selected_none = function(){
            return $scope.data.Event.channels.filter(function(e){return e.selected}).length  ==  0;
        }

        $scope.data = event_monitor._data;
        $scope.data.Event.event_sources = [{
          events: [ ],
          color: 'darkorange',   // an option!
          textColor: 'white' // an option!
        }, {
          events: [],
          color: 'white',
          textColor: 'black',
          borderColor: 'orange'
        }]
        $scope.data.Event.uiConfig = {
          calendar:{
            height: 450,
            editable: false,
            defaultView: 'agendaWeek',
            header:{
              left: 'month agendaWeek agendaDay',
              center: 'title',
              right: 'prev,next'
            },
          }
        };
        ImcService.AddHandler('event_loaded ' + $scope.event.id, function(data){
          $scope.timetable_c.fullCalendar('gotoDate', new Date($scope.data.Event.start_time));
        });

    }]);
})();
