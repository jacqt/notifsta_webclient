/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Model of the stats interface
 */

(function(){
    angular.module('notifsta.services').service('NotifStatsService', 
        ['$cookies', 'NotifstaHttp', 'ParseHttp', '$rootScope', 'ImcService', 'NotifstaAdapter', 'DesktopNotifs', service]);
    function service($cookies, NotifstaHttp, ParseHttp, $rootScope, ImcService, NotifstaAdapter, DesktopNotifs){
        //We wrap everything under a _data object so that we can perform databindings more easily
        //Otherwise, we will be assigning by value and things get messy quite quickly
        var _data = {
            Notif: {
            },
            responses_pie_chart: {
                labels: [],
                data: []
            }
        }
        function SetNotif(event_id, notif_id){
            var promise = NotifstaHttp.GetNotification(notif_id);
            promise.success(function(resp){
                if (resp.status == 'success'){
                    _data.Notif = resp.data;
                    UpdateChart(notif_id);
                }
            });
            
            promise.error(function(err){
            })
        }

        function UpdateChart(notif_id){
            var promise = NotifstaHttp.GetResponses(notif_id);
            promise.success(function(resp){
                if (resp.status == 'success'){
                    console.log(resp);
                }

                _data.responses_pie_chart.labels = 
                    _data.Notif.options
                        .sort(function(a,b){return a.id - b.id})
                        .map(function(option){
                            return option.option_guts
                        });
                _data.responses_pie_chart.data = 
                    _data.Notif.options.map(function(_){
                        return 0;
                    })
                //Now set the chart accordingly
                resp.data.map(function(response){
                    for (var i = 0; i != _data.Notif.options.length; ++i){
                        var option = _data.Notif.options[i];
                        if (option.id == response.option_id){
                            _data.responses_pie_chart.data[i] += 1;
                        }
                    }
                });
            });
        }

        function OnNewNotif(data){
            notif = data.notification;
            if (notif)
            DesktopNotifs.FireNotification(notif);
            notif.time = moment(notif.created_at).fromNow();
            var event = _data.Event;
            event.channels.map(function(channel){
                if (channel.id == data.channel_id){
                    channel.notifications.unshift(notif)
                }
            });

        }
        return {
            // Sets the notification
            SetNotif: SetNotif,

            //for data binding purposes
            data : _data
        }
    }
})();
