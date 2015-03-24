/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Model of the admin interface
 */

(function(){
    angular.module('notifsta.services').service('EventService', 
        ['$cookies', 'NotifstaHttp', 'ParseHttp', '$rootScope', 'ImcService', 'NotifstaAdapter', 'DesktopNotifs', service]);
    function service($cookies, NotifstaHttp, ParseHttp, $rootScope, ImcService, NotifstaAdapter, DesktopNotifs){
        //We wrap everything under a _data object so that we can perform databindings more easily
        //Otherwise, we will be assigning by value and things get messy quite quickly
        var _data = {
            Event: {
                channels: []
            },
        }
        var _websocket_enabled = false;
        
        function SetEvent(event_name, event_id){
            //Check if we've already set this event
            if (_data.Event.id == event_id){
                return;
            }
            var promise = NotifstaHttp.GetEvent(event_id);
            promise.success(function(resp){
                _data.Event = resp.data;
                GetInitialEventData();
                ImcService.AddHandler('event_' + _data.Event.id + ' notif', OnNewNotif);
                NotifstaAdapter.SubscribeToNotifications(event_name, event_id);
            });
            
            promise.error(function(err){
            })
        }

        function GetInitialEventData(){
            var event = _data.Event;
            var total_broadcasts = 0;
            var channels_processed = 0;
            event.channels.map(function(channel){
                var promise = NotifstaHttp.GetNotifications(channel.id);
                promise.success(function(e){
                    var notifications = e.data;
                    console.log(e);
                    channel.notifications = notifications.map(function(notif){
                        notif.time = moment(notif.created_at).fromNow();
                        if (!notif.response){
                            notif.response = {};
                        } else {
                            notif.response.new_option_id = notif.response.option_id;
                        }
                        total_broadcasts += 1;
                        return notif;
                    });
                    channels_processed += 1;
                    if (channels_processed == event.channels.length){
                        event.total_broadcasts = total_broadcasts;
                    }
                });
                promise.error(function(error){
                    channel.messages = [
                    {
                        time: 'N/A',
                        message: 'Error in getting data'
                    }
                    ]
                })
            });
        }

        function UpdateNotification(notif_id, channel_id){
            var promise = NotifstaHttp.GetNotification(notif_id);
            promise.success(function(resp){
                notif = resp.data;
                notif.time = moment(notif.created_at).fromNow();
                if (!notif.response){
                    notif.response = {};
                } else {
                    notif.response.new_option_id = notif.response.option_id;
                }
                var event = _data.Event;
                event.channels.map(function(channel){
                    if (channel.id == channel_id){
                        for (var i =0 ; i != channel.notifications.length; ++i){
                            if (channel.notifications[i].id == notif.id){
                                channel.notifications[i] = notif;
                            }
                        }
                    }
                });
            })

        }

        function OnNewNotif(data){
            notif = data.notification;
            DesktopNotifs.FireNotification(notif);
            notif.time = moment(notif.created_at).fromNow();
            //Because the websocke api doesn't give us everything, just poll again.
            GetInitialEventData();
            return;
            
            var event = _data.Event;
            event.channels.map(function(channel){
                if (channel.id == data.channel_id){
                    console.log(notif);
                    channel.notifications.unshift(notif)
                }
            });
        }

        function UpdateTimestamps(){
            var event = _data.Event;
            event.channels.map(function(channel){
                channel.notifications.map(function(notif){
                    notif.time = moment(notif.created_at).fromNow();
                })
            })
            setTimeout(UpdateTimestamps, 5000);
        }

        UpdateTimestamps();

        return {
            // Sets the event 
            SetEvent: SetEvent,

            //Updates a notification
            UpdateNotification: UpdateNotification,

            //for data binding purposes
            data : _data
        }
    }
})();
