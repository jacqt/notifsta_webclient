/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for the dashboard
 */
(function () {
    angular.module('notifsta.controllers').controller('DashboardCtrl',
        ['$scope', 'NotifstaHttp', 'toaster', function ($scope, NotifstaHttp, toaster, $cookies) {
            update_events();

            function update_events() {
                var promise = NotifstaHttp.GetAllEvents();
                promise.success(function (ev) {
                    console.log(ev);
                    $scope.events = ev.data;
                })
                promise.error(function (ev) {
                    console.log(ev);

                });
            }
            $scope.subscribe_to_event = function (event) {
                var promise = NotifstaHttp.SubscribeToEvent(event.id);
                promise.success(function (ev) {
                    update_events();
                    console.log(ev);
                })
                promise.error(function(ev){
                    console.log(ev)
                })
            }

            $scope.unsubscribe_to_event = function (event) {
                $scope.data.user.subscriptions.map(function (sub) {
                    if (sub.event_id == event.id) {
                        var promise = NotifstaHttp.SubscribeToEvent(sub.id);
                        promise.success(function (ev) {
                            console.log(ev);
                            update_events();
                        })
                        promise.error(function(ev){
                            console.log(ev)
                        })
                    }
                })
                console.log($scope.data.user);
            }

            $scope.get_date = function(time){
                return moment(time).format('ll');
            }
            $scope.get_time = function(time){
                return moment(time).format('LT');
            }

            $scope.go_create_event = function () {
                window.location = '#/create_event';
            }
            $scope.say_sorry = function () {
                toaster.pop('info', 'Sorry - we\'re still working on all our features!');
            }
        }]);
})();
