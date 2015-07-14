/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function () {
    angular.module('notifsta.controllers').controller('CreateEventStep2Ctrl',
        ['$scope', 'NotifstaHttp', '$cookies', 'ImcService', 'toaster', 'EventMonitor', '$routeParams', ctrl]);
    function ctrl($scope, NotifstaHttp, $cookies, ImcService, toaster, EventMonitor, $routeParams) {
        $scope.event = {
            name: $routeParams.event_name,
            id: $routeParams.event_id,
        }
        var event_monitor = EventMonitor.GetMonitor($scope.event, EventMonitor.ADMIN_MONITOR);
        $scope.data = event_monitor._data;
        $scope.focusthis = true;
        $scope.today = moment();
        //TODO Move this into somewhere central. Duplicated at admin/ctrl.js

        $scope.temp = {};
        $scope.cover_photo_files = [];
        $scope.cover_photo_uploading = false;
        $scope.event_map_files = [];
        $scope.cover_map_uploading = false;

        $scope.$watch('cover_photo_files', function () {
            console.log('umnmm');
            console.log($scope.cover_photo_files);

            if ($scope.cover_photo_files && $scope.cover_photo_files.length > 0) {
                $scope.cover_photo_uploading = true;
                $scope.upload($scope.cover_photo_files, function (data) {
                    console.log(data);
                    if (data) {
                        $scope.temp.cover_photo_url = $scope.data.Event.cover_photo_url;
                        $scope.data.Event.cover_photo_url = data.Location;
                    }
                    $scope.cover_photo_uploading = false;
                });
            }
        });

        $scope.$watch('event_map_files', function () {
            console.log($scope.event_map_files);
            if ($scope.event_map_files && $scope.event_map_files.length > 0) {
                $scope.event_map_uploading = true;
                $scope.upload($scope.event_map_files, function (data) {
                    if (data) {
                        $scope.temp.event_map_url = $scope.data.Event.event_map_url;
                        $scope.data.Event.event_map_url = data.Location;
                    }
                    $scope.event_map_uploading = false;
                });

            }
        });

        var bucket = new AWS.S3({ params: { Bucket: 'notifsta' } });
        $scope.upload = function (files, cb) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var params = { Key: file.name, ContentType: file.type, Body: file };
                    bucket.upload(params, function (err, data) {
                        console.log(data);
                        cb(data);
                    });
                }
            } else {
                cb(null);
            }
        };

        $scope.publish_updates = function () {
            $scope.temp = {};
            var promise = NotifstaHttp.PublishEventUpdate($scope.data.Event);
            promise.success(function (e) {
                if (e.status == 'success') {
                    toaster.pop('success', 'Successfuly created event!');
                    window.location = '#/event_admin/' + window.encodeURIComponent($scope.event.name)+'?event_id=' + $scope.event.id + '&first_time=true';
                    console.log($scope.data.Event.address);
                } else {
                    toaster.pop('error', e.error);
                }
            });
        }

        $scope.skip = function() {
            $scope.data.Event.cover_photo_url = 'http://cdn.notifsta.com/images/walking.jpg';
            var promise = NotifstaHttp.PublishEventUpdate($scope.data.Event);
            promise.success(function (e) {
                if (e.status == 'success') {
                    toaster.pop('success', 'Successfuly created event!');
                    window.location = '#/event_admin/' + window.encodeURIComponent($scope.event.name)+'?event_id=' + $scope.event.id + '&first_time=true';
                    console.log($scope.data.Event.address);
                } else {
                    toaster.pop('error', e.error);
                }
            });
        }
    };
})();