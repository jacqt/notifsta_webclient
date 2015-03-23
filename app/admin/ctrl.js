/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function(){
    angular.module('notifsta.controllers').controller('AdminCtrl',
    ['$scope', 'NotifstaHttp', 'EventService', '$cookies', '$timeout', function($scope, NotifstaHttp, EventService, $cookies, $timeout) {
        //TESTING PURPOSES ONLY
        //var p = NotifstaHttp.LoginEvent('event1', 'asdfasdf');
        var TIMEOUT = 1 * 1000;

        //Data binding for new broadcasts
        $scope.input = {
            broadcast: ''
        }

        $scope.broadcast_notice = function(){
            var message = $scope.input.message;
            var channel_ids = $scope.data.Event.channels
                .filter(function(channel){
                    return channel.selected;
                })
                .map(function(channel){
                    return channel.id;
                })
            var promises = NotifstaHttp.Broadcast(message, channel_ids);
            $scope.loading = true;
            $scope.info = 'Sending...';
            
            var succeeded = 0;
            promises.map(function(p){
                p.success(function(e){
                    succeeded += 1;
                    if (succeeded == channel_ids.length){
                        $scope.loading = false;
                        if (e.error){
                            $scope.info = e.error;
                        } else {
                            $scope.info = 'Success!';
                        }
                        $timeout(function() {
                            $scope.input.message = '';
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

        function UpdateLoop(){
            EventService.UpdateEvent();
            setTimeout(UpdateLoop, TIMEOUT);
        }

        UpdateLoop();
        $scope.data = EventService.data;

    }]);
})();
