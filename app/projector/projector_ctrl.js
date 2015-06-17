/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *  : Note that this controller is always a child of a AdminCtrl instance
 */
(function () {
    angular.module('notifsta.controllers').controller('ProjectorCtrl',
    ['$scope', 'ImcService','EventMonitor',
    function ($scope, ImcService, EventMonitor) {
        $scope.proj = {
            current_time: moment(),
            next_few_events: []
        }

        $scope.first_three = function (list) {
            var t = [];
            for (var i = 0 ; i < list.length && i < 3; ++i) {
                t.push(list[i]);
            }
            return t;
        }

        function UpdateTime() {
            $scope.proj.current_time = moment();
        }

        function UpdateEvents() {
            if ($scope.event_monitor) {
                $scope.proj.next_few_events.length = 0;
                var t = $scope.event_monitor.GetNextEvents(3);
                t.map(function (e) {
                    $scope.proj.next_few_events.push(e);
                })
            }
        }

        $scope.shorten = function (time) {
            var m = moment(time);
            return m.format('hh:mm A');
        }

        function Update() {
            UpdateTime();
            UpdateEvents();
            setTimeout(function () {
                $scope.$apply();
            }, 10);
            setTimeout(Update, 1000);
        }
        ImcService.AddHandler('event_loaded ' + $scope.event.id, function (data) {
            Update();
        });
    }]);
})();
