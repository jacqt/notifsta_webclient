/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * THIS IS JUST COPYPASTED DO NOT USE
 *
 */
(function () {
    angular.module('notifsta.controllers').controller('CreateEventCtrl', ['$scope', 'NotifstaHttp', '$cookies', 'ImcService', 'toaster', ctrl]);
    function ctrl($scope, NotifstaHttp, $cookies, ImcService, toaster) {
        $scope.partial_event = {
            start_hh_mm: moment('2015-01-01 00:00'),
            end_hh_mm: moment('2015-01-01 00:00'),
        }
        //TODO Move this into somewhere central. Duplicated at admin/ctrl.js
        var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            console.log(place);
            $scope.partial_event.address = place.name + ',' + place.formatted_address;
            $scope.location = place.geometry.location.lat() + ',' + place.geometry.location.lng();
            $scope.$apply();
        });

        $scope.AttemptEventCreation = function () {
            var required_fields = ['name', 'description', 'address', 'start_date', 'start_hh_mm', 'end_date', 'end_hh_mm'];
            var to_english = {
                'name': 'name',
                'description': 'description',
                'address': 'address',
                'start_date': 'start date & time',
                'start_hh_mm': 'start date & time',
                'end_date': 'end date & time',
                'end_hh_mm': 'end date & time'
            };
            //Extract the datetime from date and time
            var start_day = moment(moment($scope.partial_event.start_date).format('LLL'));
            var start_hh_mm = moment($scope.partial_event.start_hh_mm);
            var start_hh_mm = moment.duration({ hour: start_hh_mm.get('hour'), minute: start_hh_mm.get('minute') });

            var end_day = moment(moment($scope.partial_event.end_date).format('LLL'));
            var end_hh_mm = moment($scope.partial_event.end_hh_mm);
            var end_hh_mm = moment.duration({ hour: end_hh_mm.get('hour'), minute: end_hh_mm.get('minute') });

            $scope.partial_event.start_time = start_day.add(start_hh_mm).zone(moment().zone());
            $scope.partial_event.end_time = end_day.add(end_hh_mm).zone(moment().zone());

            var promise = NotifstaHttp.CreateEvent($scope.partial_event);
            promise.success(function (e) {
                console.log(e);
                window.location = '#/';
                ImcService.FireEvent('user state changed');
            });
        }
    };
})();
