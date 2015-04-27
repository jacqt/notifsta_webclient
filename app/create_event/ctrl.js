/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * THIS IS JUST COPYPASTED DO NOT USE
 *
 */
(function(){
  angular.module('notifsta.controllers').controller('CreateEventCtrl', ['$scope', 'NotifstaHttp', '$cookies', ctrl]);
  function ctrl($scope, NotifstaHttp, $cookies)  {
    $scope.partial_event = {
    }
    //TODO Move this into somewhere central. Duplicated at admin/ctrl.js
    var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var place = autocomplete.getPlace();
      $scope.location = place.geometry.location.lat() + ',' + place.geometry.location.lng();
      $scope.$apply();
    });


    $scope.AttemptEventCreation = function(){
      var promise = NotifstaHttp.CreateEvent($scope.partial_event);
      promise.success(function(e){
        console.log(e);
      });
    }
  };
})();
