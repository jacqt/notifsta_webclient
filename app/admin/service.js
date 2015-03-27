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
                        GetAllNotifResponses();
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
                                GetNotifResponses(notif);
                            }
                        }
                    }
                });
            })
        }

        function GetAllNotifResponses(){
            var event = _data.Event;
            event.channels.map(function(channel){
                for (var i =0 ; i != channel.notifications.length; ++i){
                    GetNotifResponses(channel.notifications[i]);
                }
            });
        }

        function GetNotifResponses(notif){
            if (notif.type != 'Survey'){
                // do nothing...
                return;
            }
            notif.responses_pie_chart = {
                labels: [],
                data: []
            }

            var promise = NotifstaHttp.GetResponses(notif.id);
            promise.success(function(resp){
                if (resp.status == 'success'){
                    console.log(resp);
                }

                notif.responses_pie_chart.labels = 
                    notif.options
                        .sort(function(a,b){return a.id - b.id})
                        .map(function(option){
                            return option.option_guts
                        });
                notif.responses_pie_chart.data = 
                    notif.options.map(function(_){
                        return 1;
                    })
                //Now set the chart accordingly
                resp.data.map(function(response){
                    for (var i = 0; i != notif.options.length; ++i){
                        var option = notif.options[i];
                        if (option.id == response.option_id){
                            notif.responses_pie_chart.data[i] += 1;
                        }
                    }
                });
                notif.style = {
                    height: '80px',
                    width: '90px'
                }
            });
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
            try {
                event.channels = event.channels.map(function(channel){
                    channel.notifications = channel.notifications.map(function(notif){
                        notif.time = moment(notif.created_at).fromNow();
                        console.log(notif.time);
                        return notif;
                    })
                    return channel;
                })
                $rootScope.$apply();
            } catch (err){
                console.log(err);
            }
        }
        setTimeout(UpdateTimestamps, 1000);

        return {
            // Sets the event 
            SetEvent: SetEvent,

            //Updates a notification
            UpdateNotification: UpdateNotification,

            //For getting response information
            GetNotifResponses: GetNotifResponses,

            //for data binding purposes
            data : _data
        }
    }
})();
