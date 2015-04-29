/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function(){
  angular.module('notifsta.controllers').controller('AdminCtrl', 
      ['$scope', 'NotifstaHttp', 'EventMonitor', '$cookies', '$timeout', '$routeParams', 'toaster', ctrl]);
  function ctrl($scope, NotifstaHttp, EventMonitor, $cookies, $timeout, $routeParams, toaster) {
    //TESTING PURPOSES ONLY
    //var p = NotifstaHttp.LoginEvent('event1', 'asdfasdf');
    $scope.event = {
      name: $routeParams.event_name,
      id: $routeParams.event_id
    }
    var TIMEOUT = 1 * 1000;

    console.log("SDFSDFSF");
    var event_monitor = EventMonitor.GetMonitor($scope.event, EventMonitor.ADMIN_MONITOR);

    //Data binding for new notifications
    $scope.input = {
      broadcast: '',
      options: [],
      next_option: {
        text: ''
      }
    }

    $scope.sending_survey = false;

    $scope.submit_description_update = function(){
      var description = $scope.data.Event.description;
      console.log('updating description');
    }
    $scope.submit_address_update = function(){
      var description = $scope.data.Event.description;
      console.log('updating address');
    }
    $scope.submit_start_time_update = function(){
      var description = $scope.data.Event.description;
      console.log('updating start time');
    }
    $scope.submit_end_time_update = function(){
      var description = $scope.data.Event.description;
      console.log('updating end time');
    }

    $scope.submit_cover_photo_update = function(){
      console.log('updating cover photo');
    }
    $scope.submit_event_map_update = function(){
      console.log('updating event photo');
    }

    $scope.publish_updates = function(){
      var promise = NotifstaHttp.PublishEventUpdate($scope.data.Event);
      promise.success(function(e){
        console.log(e);
        if (e.status == 'success'){
          toaster.pop('success', 'Successfuly updated event');
        } else {
          toaster.pop('error', e.data);
        }

      });
    }

    $scope.create_option = function(){
      console.log($scope.input.next_option.text);
      $scope.input.options.unshift({
        text: $scope.input.next_option.text
      });
      $scope.input.next_option = {
        text: ''
      }
    }

    $scope.cover_photo_toggle = function(){
      console.log('editing cover photo');
      $scope.editing_cover_photo = !$scope.editing_cover_photo;
    }
    $scope.map_url_toggle = function(){
      console.log('editing cover photo');
      $scope.editing_map_url = !$scope.editing_map_url;
    }

    $scope.$watch('cover_photo_files', function () {
      console.log('uploading cover photo file');
      $scope.upload($scope.cover_photo_files, function(data){
        if (data){
          $scope.data.Event.cover_photo_url = data.Location;
          $scope.cover_photo_editor.$hide();
          $scope.publish_updates();
        }
      });
    });

    $scope.$watch('event_map_files', function () {
      $scope.upload($scope.event_map_files, function(data){
        if (data){
          $scope.data.Event.event_map_url = data.Location;
          $scope.event_map_editor.$hide();
          $scope.publish_updates();
        }
      });
    });

    var bucket = new AWS.S3({params: {Bucket: 'notifsta'}});
    $scope.upload = function (files, cb) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          console.log('uploading file...');

          var params = {Key: file.name, ContentType: file.type, Body: file};
          bucket.upload(params, function (err, data) {
            console.log(data);
            cb(data);
          });
        }
      }
    };

    $scope.option_keypressed = function(event, option){
    }

    $scope.finish_editing = function(option){
      if (option.text==''){
        //Delete it
        $scope.input.options.splice($scope.input.options.indexOf(option),1);
      } else {
        option.editing = false;
      } 

    }

    $scope.create_notification = function(){
      var channel_ids = $scope.data.Event.channels
      .filter(function(channel){
        return channel.selected;
      })
      .map(function(channel){
        return channel.id;
      })
      if ($scope.sending_survey){
        var question = $scope.input.message;
        var options = $scope.input.options.map(function(opt){
          return opt.text;
        });
        var promises = NotifstaHttp.CreateSurvey(question, options, channel_ids);
      } else {
        var message = $scope.input.message;
        var promises = NotifstaHttp.CreateNotification(message, channel_ids);
      }

      $scope.loading = true;
      $scope.info = 'Sending...';

      var succeeded = 0;
      promises.map(function(p){
        p.success(function(e){
          succeeded += 1;
          console.log(e);
          if (succeeded == channel_ids.length){
            $scope.loading = false;
            if (e.error || e.status == "failure" ){
              $scope.info = e.data;
            } else {
              $scope.info = 'Success!';
            }
            $timeout(function() {
              $scope.input.message = '';
              $scope.input.options = [];
              $scope.input.next_option.text = '';
            });
            ClearInfoTimeout();
          }
        });
        p.error(function(e){
          $scope.loading = false;
        });

      })
    }

    function ClearInfoTimeout(){
      setTimeout(function(){
        $scope.info = '';
      }, 3000);
    }


    $scope.selected_none = function(){
      return $scope.data.Event.channels.filter(function(e){return e.selected}).length  ==  0;
    }

    $scope.data = event_monitor._data;
    $scope.GetNotifResponses = event_monitor.GetNotifResponses;

    $scope.options = {scrollwheel: false};
    var events = {
      places_changed: function (searchBox) {
        console.log(searchBox);
        console.log(searchBox.getPlaces());
        var places = searchBox.getPlaces();
        if (places.length > 0){
          var place = places[0];
          var lat = place.geometry.location.lat();
          var lng = place.geometry.location.lng();
          $scope.data.Event.map.center.latitude = lat;
          $scope.data.Event.map.center.longitude = lng;
          $scope.data.Event.map.zoom = 15;
          $scope.data.Event.marker.coords.latitude = lat;
          $scope.data.Event.marker.coords.longitude = lng;
          $scope.data.Event.address = place.name + ', ' + place.formatted_address;
        }
      }
    }
    $scope.searchbox = { template:'searchbox.tpl.html', events:events};

  }
})();
