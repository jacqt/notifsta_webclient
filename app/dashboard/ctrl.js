/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for the dashboard
 */
(function () {
    angular.module('notifsta.controllers').controller('DashboardCtrl',
        ['$scope', 'NotifstaHttp', 'toaster', function ($scope, NotifstaHttp, toaster, $cookies) {
            $scope.events = {};
            update_events();
            function update_events() {
                var promise = NotifstaHttp.GetAllEvents();
                promise.success(function (ev) {
                    $scope.events.admin = [];
                    $scope.events.subscribed = [];
                    $scope.events.not_subscribed = [];
                    ev.data.subscribed.map(function (event) {
                        if (!event.cover_photo_url) {
                            event.cover_photo_url = "http://cdn.notifsta.com/images/walking.jpg";
                        }
                        $scope.data.user.subscriptions.map(function (sub) {
                            if (sub.event_id == event.id) {
                                event.admin = sub.admin;
                                if (event.admin) {
                                    $scope.events.admin.push(event);
                                } else {
                                    $scope.events.subscribed.push(event);
                                }
                                console.log(sub);
                            }
                        });
                        event.subscribed = true;
                    })
                    ev.data.not_subscribed.map(function (event) {
                        if (!event.cover_photo_url) {
                            event.cover_photo_url = "http://cdn.notifsta.com/images/walking.jpg";
                        }
                        event.subscribed = null;
                        $scope.events.not_subscribed.push(event);
                    })
                })
                promise.error(function (ev) {
                    console.log(ev);
                });
            }
            $scope.subscribe_to_event = function (event) {
                var promise = NotifstaHttp.SubscribeToEvent(event.id);
                promise.success(function (ev) {
                    update_events();
                    ImcService.FireEvent('user state changed');
                    console.log(ev);
                })
                promise.error(function(ev){
                    console.log(ev)
                })
            }

            $scope.unsubscribe_to_event = function (event) {
                var promise = NotifstaHttp.UnsubscribeToEvent(event.id);
                promise.success(function (ev) {
                    console.log(ev);
                    ImcService.FireEvent('user state changed');
                    update_events();
                })
                promise.error(function(ev){
                    console.log(ev)
                })
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
