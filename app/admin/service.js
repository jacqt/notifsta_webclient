/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Model of the admin interface
 */

(function(){
    angular.module('notifsta.services').service('EventMonitor', 
        ['$cookies', 'NotifstaHttp', 'ParseHttp', '$rootScope', 'ImcService', 'NotifstaAdapter', 'DesktopNotifs', service]);
    function service($cookies, NotifstaHttp, ParseHttp, $rootScope, ImcService, NotifstaAdapter, DesktopNotifs){
        var ADMIN_MONITOR = 1;
        var NON_ADMIN_MONITOR = 2;

        var event_monitors = {};

        function GetMonitor(event, monitor_type){
            var key = event.id + '_' + monitor_type;
            if (!(key in event_monitors)){
                var new_monitor = new EventMonitor(event.name, event.id, monitor_type);
                event_monitors[key] = new_monitor;
            }
            return event_monitors[key];

        }
        function EventMonitor(event_name, event_id, monitor_type){
            var self = this;
            //We wrap everything under a _data object so that we can perform databindings more easily
            //Otherwise, we will be assigning by value and things get messy quite quickly
            self._data = {
                Event: {
                    channels: []
                },
            }
            self.monitor_type = monitor_type;

            var promise = NotifstaHttp.GetEvent(event_id);
            promise.success(function(resp){
                self._data.Event = resp.data;
                self.GetInitialEventData();

                function Handler(data){
                    self.OnNewNotif(data);
                }
                console.log("Hi there");
                ImcService.AddHandler('event_' + self._data.Event.id + ' notif', Handler);
                NotifstaAdapter.SubscribeToNotifications(event_name, event_id);
            });
            
            promise.error(function(err){
                console.log("error in EventMonitor constructor");
                console.log(err);
            })

            //Start a loop that updates the "{HOW_LONG_AGO_NOTIF_WAS}" message
            setTimeout(function(){self.UpdateTimestamps()}, 1000);
        }

        EventMonitor.prototype.ManagedByMe = function(){
            var self = this;
            var events = $rootScope.data.user.events;
            for (var i = 0; i != events.length; ++i){
                if (events[i].id == self._data.Event.id){
                    return events[i].admin;
                }
            }
        }
        
        EventMonitor.prototype.GetInitialEventData = function(){
            var self = this;
            var event = self._data.Event;
            var total_broadcasts = 0;
            var channels_processed = 0;
            self.ConfigureMap();
            event.start_time = moment(event.start_time).format('LLL');
            event.end_time = moment(event.end_time).format('LLL');
            event.channels.map(function(channel){
                var promise = NotifstaHttp.GetNotifications(channel.id);
                promise.success(function(e){
                    var notifications = e.data;
                    channel.notifications = [];
                    notifications.reverse().map(function(notif){
                        self.PushNewNotif(channel, notif);
                    });
                    total_broadcasts += notifications.length;
                    channels_processed += 1;
                    if (channels_processed == event.channels.length){
                        event.total_broadcasts = total_broadcasts;
                        self.GetAllNotifResponses();
                    }
                    channel.selected = true;
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

        EventMonitor.prototype.GetNotification = function(notif_id){
            var self = this;
            var event = self._data.Event;
            console.log("this is the notif id man");
            console.log(notif_id);
            var promise = NotifstaHttp.GetNotification(notif_id);
            promise.success(function(resp){
                console.log(resp);
                notif = resp.data;

                event.channels.map(function(channel){
                    if (channel.id == notif.channel_id){
                        self.PushNewNotif(channel, notif);
                        self.GetNotifResponses(notif);
                    }
                });
            })
        }

        //TODO see if this actually used or not
        EventMonitor.prototype.UpdateNotification = function(notif_id, channel_id){
            var self = this;
            var promise = NotifstaHttp.GetNotification(notif_id);
            promise.success(function(resp){
                notif = resp.data;
                notif.time = moment(notif.created_at).fromNow();
                if (!notif.response){
                    notif.response = {};
                } else {
                    notif.response.new_option_id = notif.response.option_id;
                }
                var event = self._data.Event;
                event.channels.map(function(channel){
                    if (channel.id == channel_id){
                        for (var i =0 ; i != channel.notifications.length; ++i){
                            if (channel.notifications[i].id == notif.id){
                                channel.notifications[i] = notif;
                                self.GetNotifResponses(notif);
                            }
                        }
                    }
                });
            })
        }

        EventMonitor.prototype.GetAllNotifResponses = function(){
            var self = this;
            var event = self._data.Event;
            event.channels.map(function(channel){
                for (var i =0 ; i != channel.notifications.length; ++i){
                    self.GetNotifResponses(channel.notifications[i]);
                }
            });
        }

        EventMonitor.prototype.GetNotifResponses = function(notif){
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
                notif.responses_pie_chart.labels = 
                    notif.options
                        .sort(function(a,b){return a.id - b.id})
                        .map(function(option){
                            return option.option_guts
                        });
                notif.responses_pie_chart.data = 
                    notif.options.map(function(_){
                        return 0;
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
                if (resp.data.length > 0){
                    notif.style = {
                        width: '70px',
                    }
                } else {
                    notif.style = {
                        height: '0px',
                        width: '7px'
                    }
                }

                notif.number_responses = resp.data.length;
            });
        }

        EventMonitor.prototype.PushNewNotif = function(channel, notif){
            notif.time = moment(notif.created_at).fromNow();
            if (!notif.response){
                notif.response = {};
            } else {
                notif.response.new_option_id = notif.response.option_id;
            }
            channel.notifications.unshift(notif);
            return notif;
        }

        EventMonitor.prototype.OnNewNotif = function(data){
            console.log('New notification');
            var self  = this;
            console.log(data);
            var notif = data.notification;
            //Desktop notifications
            DesktopNotifs.FireNotification(notif);

            if (self.monitor_type == ADMIN_MONITOR){
                console.log('Getting more detailed information about the notification');
                self.GetNotification(notif.id);
            } else if (self.monitor_type == NON_ADMIN_MONITOR){
                console.log('adding notification to UI')
                var event = self._data.Event;
                event.channels.map(function(channel){
                    if (channel.id == notif.channel_id){
                        self.PushNewNotif(channel, notif);
                    }
                });
            }
        }

        EventMonitor.prototype.UpdateTimestamps = function(){
            var self = this;
            var event = self._data.Event;
            try {
                event.channels = event.channels.map(function(channel){
                    channel.notifications = channel.notifications.map(function(notif){
                        notif.time = moment(notif.created_at).fromNow();
                        return notif;
                    })
                    return channel;
                })
                $rootScope.$apply();
            } catch (err){
                console.log(err);
            }
            setTimeout(function(){self.UpdateTimestamps()}, 1000);
        }

        EventMonitor.prototype.ConfigureMap = function(){
          var self = this;
          var geocoder = new google.maps.Geocoder();
          var address = self._data.Event.address;
          geocoder.geocode( { 'address': self._data.Event.address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              var lat = results[0].geometry.location.lat();
              var lng = results[0].geometry.location.lng();
              self._data.Event.map = {center: {latitude: lat, longitude: lng }, zoom: 15 };
              self._data.Event.marker = {
                id: 0,
                coords: {
                  latitude: lat,
                  longitude: lng
                },
              }
            }
            else {
              alert('Geocode was not successful for the following reason: ' + status);
            }
          });
          if (self.monitor_type == ADMIN_MONITOR){
            //FIXME: Big hack for the issue of not being able to set the initial value of the searchbox
            function SetAddress(){
              var el = document.getElementById('searchbox');
              if (el == null){
                setTimeout(SetAddress, 1000);
              } else {
                document.getElementById('searchbox').value = self._data.Event.address;
              }
            }
            SetAddress();
          }
        }

        return {
            //Constructor for the event monitor object
            EventMonitor: EventMonitor,

            //Either creates the monitor or retrieves a previously created one
            GetMonitor: GetMonitor,

            ADMIN_MONITOR: ADMIN_MONITOR,
            NON_ADMIN_MONITOR: NON_ADMIN_MONITOR
        }
    }
})();
