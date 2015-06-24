/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function () {
    angular.module('notifsta.controllers').controller('EventCtrl',
    ['$scope', 'NotifstaHttp', 'EventMonitor', '$cookies', '$timeout', '$routeParams', 'ImcService', 'WindowSizeService',
    function ($scope, NotifstaHttp, EventMonitor, $cookies, $timeout, $routeParams, ImcService, WindowSizeService) {





        $scope.format_date = function (time_string) {
            return event_monitor.moment(time_string).format(EventMonitor.T_FORMAT);
        }
        //TESTING PURPOSES ONLY
        //var p = NotifstaHttp.LoginEvent('event1', 'asdfasdf');
        $scope.event_name = $routeParams.event_name;
        $scope.event = {
            name: $routeParams.event_name,
            id: $routeParams.event_id
        }
        var TIMEOUT = 1 * 1000;

        $scope.options = { scrollwheel: false, draggable: false };
        var event_monitor = EventMonitor.GetMonitor($scope.event, EventMonitor.NON_ADMIN_MONITOR);

        //Data binding for new notifications
        $scope.input = {
            broadcast: '',
            options: [],
            next_option: {
                text: ''
            }
        }


        $scope.submit_option = function (notif, channel_id) {
            var promise = NotifstaHttp.SubmitResponse(notif.id, notif.response.new_option_id);
            promise.success(function (resp) {
                console.log(resp);
                event_monitor.UpdateNotification(notif.id, channel_id)
            });
        }

        $scope.selected_none = function () {
            return $scope.data.Event.channels.filter(function (e) { return e.selected }).length == 0;
        }

        $scope.unsubscribe = function () {
            var promise = NotifstaHttp.UnsubscribeToEvent($scope.data.Event.id);
            promise.success(function (resp) {
                window.location = '';
            });
        }

        $scope.data = event_monitor._data;

        ImcService.AddHandler('event_loaded ' + $scope.event.id, function (data) {
            CreateTwitterTimeline();
        });

        if ($scope.data.Event.channels.length > 0) {
            CreateTwitterTimeline();
        }

        function CreateTwitterTimeline() {
            if (!$scope.data.Event.twitter_widget_id) {
                return;
            }
            twttr.widgets.createTimeline(
              $scope.data.Event.twitter_widget_id,
              document.getElementById('twitter_timeline'),
              {
                  width: '1000',
                  height: '300',
                  related: 'twitterdev,twitterapi'
              }).then(function (el) {
                  console.log("Embedded a timeline.")
              });
        }

        // Make this page responsive
        $scope.selected = {};
        $scope.selected.index = 0;
        $scope.firsttab = function () {
            setTimeout(function () {
                $scope.selected.index = 0;
            }, 1);
        }
        $scope.lasttab = function () {
            setTimeout(function () {
                $scope.selected.index = 2;
            }, 1);
        }
        //$scope.nexttab = function () {
        //    $scope.selected.index += 1;
        //    console.log('next tab');
        //    console.log($scope.selected.index);
        //}
        //$scope.prevtab = function () {
        //    $scope.selected.index -= 1;
        //    console.log('prev tab');
        //    console.log($scope.selected.index);
        //}
        $scope.never = "never";
        $scope.pls = true;


        $scope.window_size = WindowSizeService.window_size;
    }]);
})();
