/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function(){
    angular.module('notifsta.controllers').controller('AdminCtrl',
    ['$scope', 'NotifstaHttp', 'EventService', '$cookies', '$timeout', '$routeParams', 
    function($scope, NotifstaHttp, EventService, $cookies, $timeout, $routeParams) {
        //TESTING PURPOSES ONLY
        //var p = NotifstaHttp.LoginEvent('event1', 'asdfasdf');
        $scope.event_name = $routeParams.event_name;
        $scope.event = {
            name: $routeParams.event_name,
            id: $routeParams.id
        }
        var TIMEOUT = 1 * 1000;

        EventService.SetEvent($scope.event.name, $scope.event.id);

        //Data binding for new notifications
        $scope.input = {
            broadcast: '',
            options: [],
            next_option: {
                text: ''
            }
        }

        $scope.sending_survey = false;

        $scope.create_option = function(){
            console.log($scope.input.next_option.text);
            $scope.input.options.unshift({
                text: $scope.input.next_option.text
            });
            $scope.input.next_option = {
                text: ''
            }
        }

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
            var message = $scope.input.message;
            var channel_ids = $scope.data.Event.channels
                .filter(function(channel){
                    return channel.selected;
                })
                .map(function(channel){
                    return channel.id;
                })
            var promises = NotifstaHttp.CreateNotification(message, channel_ids);
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

        //function UpdateLoop(){
            //EventService.UpdateEvent();
            //setTimeout(UpdateLoop, TIMEOUT);
        //}

        //UpdateLoop();
        $scope.data = EventService.data;

    }]);
})();
