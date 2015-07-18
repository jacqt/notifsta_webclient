/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function () {
    angular.module('notifsta.controllers').controller('CreateEventCtrl',
        ['$scope', 'NotifstaHttp', '$cookies', 'ImcService', 'toaster', 'AddressService', ctrl]);
    function ctrl($scope, NotifstaHttp, $cookies, ImcService, toaster, AddressService) {
        $scope.submitting = false;

        $scope.partial_event = {
            start_time: null,
            end_time: null,
            timezone: null
        }
        $scope.focusthis = true;
        $scope.today = moment();
        //TODO Move this into somewhere central. Duplicated at admin/ctrl.js
        var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
        $('#google_places_ac').attr('placeholder', '');
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            $scope.partial_event.address = $('#google_places_ac').val();

            var place = autocomplete.getPlace();
            var partial_address = AddressService.ShortenAddress(place);

            var lat = place.geometry.location.lat();
            var lng = place.geometry.location.lng();
            $.ajax({
                url: "https://maps.googleapis.com/maps/api/timezone/json?location="+lat+"," + lng + " + &timestamp=" + (Math.round((new Date().getTime()) / 1000)).toString() + "&sensor=false",
            }).done(function (response) {
                if (response.timeZoneId != null) {
                    $scope.partial_event.timezone = response.timeZoneId;
                    setTimeout(function () {
                        $scope.$apply();
                    }, 10);
                }
            });
        });

        var selected_time = false;

        $scope.$watch('partial_event.start_time', function (newVal) {
            if (!$scope.partial_event.end_time) {
                $scope.partial_event.end_time = newVal;
                return;
            }
            var sv = moment(newVal);
            var ev = moment($scope.partial_event.end_time);
            if (sv > ev) {
                $scope.partial_event.end_time = sv;
            }
        });

        $scope.AttemptEventCreation = function () {
            var required_fields = ['name', 'description', 'address', 'start_time', 'end_time'];
            var to_english = {
                'name': 'name',
                'description': 'description',
                'address': 'address',
                'start_time': 'start date & time',
                'end_time': 'end date & time',
            };
            var ok = true;
            required_fields.map(function (k) {
                if (!$scope.partial_event[k]) {
                    toaster.pop('error', 'Please fill out the ' + to_english[k] + ' field');
                    ok = false;
                }
            })
            if (!ok) {
                return;
            }

            var promise = NotifstaHttp.CreateEvent($scope.partial_event);
            $scope.submitting = true;
            promise.success(function (e) {
                $scope.submitting = false;
                if (e.status == 'success') {
                    window.location = '#/create_event_step_photos?event_id=' + e.data.id + '&event_name=' + $scope.partial_event.name;
                    ImcService.FireEvent('user state changed');
                } else {
                    toaster.pop('error', e.error);
                }
            });
        }
    };
})();
