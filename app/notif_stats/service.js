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
        }
        function SetNotif(event_id, notif_id){
            var promise = NotifstaHttp.GetResponses(notif_id);
            promise.success(function(resp){
                if (resp.status == 'success'){
                    console.log(resp.data);
                }
            });
            
            promise.error(function(err){
            })
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
