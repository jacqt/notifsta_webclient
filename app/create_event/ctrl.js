/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * THIS IS JUST COPYPASTED DO NOT USE
 *
 */
(function () {
    angular.module('notifsta.controllers').controller('CreateEventCtrl',
        ['$scope', 'NotifstaHttp', '$cookies', 'ImcService', 'toaster', 'AddressService', ctrl]);
    function ctrl($scope, NotifstaHttp, $cookies, ImcService, toaster, AddressService) {
        $scope.submitting = false;
        $scope.partial_event = {
            start_hh_mm: moment('2015-01-01 00:00'),
            end_hh_mm: moment('2015-01-01 00:00'),
            start_time: null,
            end_time: null,
        }
        //TODO Move this into somewhere central. Duplicated at admin/ctrl.js
        var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            console.log($('#google_places_ac').val());
            $scope.partial_event.address = $('#google_places_ac').val();
            //var place = autocomplete.getPlace();
            //console.log(place);
            //var partial_address = AddressService.ShortenAddress(place);
            //console.log(partial_address);
            //$scope.partial_event.address = place.name + partial_address;
            //$scope.location = place.geometry.location.lat() + ',' + place.geometry.location.lng();
            //setTimeout(function () {
            //    console.log('hii');
            //    $('#google_places_ac').val($scope.partial_event.address);
            //},0);
        });

        $scope.$watch('partial_event.start_time', function (newVal) {
            console.log(newVal);
            if (!$scope.partial_event.end_time) {
                $scope.partial_event.end_time = newVal;
                return;
            }
            var sv = moment(newVal);
            var ev = moment($scope.partial_event.end_time);
            if (sv > ev) {
                $scope.partial_event.end_time = newVal;
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
                    console.log(e);
                    window.location = '#/';
                    ImcService.FireEvent('user state changed');
                } else {
                    toaster.pop('error', e.error);
                }
            });
        }
    };
})();
