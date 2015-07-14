/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for the dashboard
 */
(function () {
    angular.module('notifsta.controllers').controller('DashboardCtrl',
        ['$scope', 'NotifstaHttp', 'toaster', 'ImcService', 'WindowSizeService', 'DesktopNotifs', '$routeParams', '$mdDialog',
        function ($scope, NotifstaHttp, toaster, ImcService, WindowSizeService, DesktopNotifs, $routeParams, $mdDialog) {
            var from_signup = $routeParams.signup;
            if (from_signup) {
                setTimeout(function () {
                    $mdDialog.show({
                        templateUrl: 'app/dashboard/welcome/welcome_message.html',
                        parent: angular.element(document.body),
                        scope: $scope,
                        preserveScope: true,
                        clickOutsideToClose: true,
                    })
                    .then(function (answer) {
                    }, function () {
                    });
                }, 4000);
            }

            $scope.window_size = WindowSizeService.window_size;
            $scope.events = {};
            DesktopNotifs.RequestNotification();
            ImcService.AddHandler('user updated', function () {
                update_events();
            });
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
                });
            }
            $scope.subscribe_to_event = function (event) {
                var promise = NotifstaHttp.SubscribeToEvent(event.id);
                promise.success(function (ev) {
                    ImcService.FireEvent('user state changed');
                })
                promise.error(function(ev){
                })
            }

            $scope.unsubscribe_to_event = function (event) {
                var promise = NotifstaHttp.UnsubscribeToEvent(event.id);
                promise.success(function (ev) {
                    ImcService.FireEvent('user state changed');
                    update_events();
                })
                promise.error(function(ev){
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

            $scope.showcard = function (card) {
                card.showme = true;
            }
            $scope.hidecard = function (card) {
                card.showme = false;
            }
        }]);
})();
