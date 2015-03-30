/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */
(function(){
    angular.module('notifsta.controllers').controller('AdminCtrl',
    ['$scope', 'NotifstaHttp', 'EventMonitor', '$cookies', '$timeout', '$routeParams', 
    function($scope, NotifstaHttp, EventMonitor, $cookies, $timeout, $routeParams) {
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
                    if (succeeded == channel_ids.length){
                        $scope.loading = false;
                        if (e.error){
                            $scope.info = e.error;
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
    }]);
})();
