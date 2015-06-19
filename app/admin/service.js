/// <reference path="../../bower_components/angular/angular.js" />

/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Model of the admin interface
 */

(function () {
    angular.module('notifsta.services').service('EventMonitor',
        ['$cookies', 'NotifstaHttp', 'ParseHttp', '$rootScope', 'ImcService', 'NotifstaAdapter', 'DesktopNotifs', 'uiCalendarConfig', service]);
    function service($cookies, NotifstaHttp, ParseHttp, $rootScope, ImcService, NotifstaAdapter, DesktopNotifs, uiCalendarConfig) {
        var self = this;
        var ADMIN_MONITOR = 1;
        var NON_ADMIN_MONITOR = 2;

        var TIMESTRING_FORMAT = 'MMMM Do YYYY, h:mm A z';

        var event_monitors = {};

        function GetMonitor(event, monitor_type) {
            var key = event.id + '_' + monitor_type;
            if (!(key in event_monitors)) {
                var new_monitor = new EventMonitor(event.name, event.id, monitor_type);
                event_monitors[key] = new_monitor;
            } else {
                event_monitors[key].UpdateData(); // Update the event data when re-requesting an event
            }
            return event_monitors[key];

        }
        function EventMonitor(event_name, event_id, monitor_type) {
            var self = this;
            //We wrap everything under a _data object so that we can perform databindings more easily
            //Otherwise, we will be assigning by value and things get messy quite quickly
            self._data = {
                Event: {
                    timezone: "Europe/London",
                    channels: [],
                    event_sources: [
                        function (start, end, timezone, callback) {
                            callback(self._data.Event.event_sources_arr[0].events.map(function(ev){
                                var t = {};
                                for (key in ev){
                                    t[key] = ev[key];
                                }
                                t.color = '#da4e4e';
                                t.textColor = 'white';
                                return t;
                            }));
                        },
                        function (start, end, timezone, callback) {
                            callback(self._data.Event.event_sources_arr[1].events.map(function(ev){
                                var t = {};
                                for (key in ev){
                                    t[key] = ev[key];
                                }
                                t.color = 'white';
                                t.textColor = 'black';
                                t.borderColor = 'red'
                                return t;
                            }));
                        }
                    ],
                    event_sources_arr: [{ events: [] }, { events: [] }],
                    subevent_grouped_array: [],
                    scheduled_notifications: []
                },
            }
            self.monitor_type = monitor_type;

            var promise = NotifstaHttp.GetEvent(event_id);
            promise.success(function (resp) {
                for (var key in resp.data) {
                    self._data.Event[key] = resp.data[key]
                }
                self.GetInitialEventData();
            });

            promise.error(function (err) {
                console.log("error in EventMonitor constructor");
                console.log(err);
            })

            //Start a loop that updates the "{HOW_LONG_AGO_NOTIF_WAS}" message
            setTimeout(function () { self.UpdateTimestamps() }, 1000);
        }

        EventMonitor.prototype.moment = function (arg1, arg2, arg3) {
            if (this._data.Event.timezone_offset) {
                return moment(arg1, arg2, arg3).tz(this._data.Event.timezone_offset);
            } else {
                return moment(arg1, arg2, arg3);
            }
        }


        function StripTimezone(moment_obj) {
            if (moment_obj) {
                var s = moment_obj.format();
                if (s.indexOf('+') > 0){
                    return s.substring(0, s.indexOf('+'));
                }
                if (s.lastIndexOf('-') > s.length - 8){
                    return s.substring(0, s.lastIndexOf('-'));
                } 
                return s;
            } else {
                return null;
            }
        }

        EventMonitor.prototype.moment_no_convert = function (moment_obj) {
            console.log(moment_obj.format());
            var stripped = StripTimezone(moment_obj);
            console.log(stripped);
            console.log(moment_obj);
            return this.moment(stripped + this.moment().format('Z'));
        }

        EventMonitor.prototype.ManagedByMe = function () {
            var self = this;
            var events = $rootScope.data.user.events;
            for (var i = 0; i != events.length; ++i) {
                if (events[i].id == self._data.Event.id) {
                    return events[i].admin;
                }
            }
        }
        EventMonitor.prototype.UpdateData = function () {
            var self = this;
            self.ConfigureMap();
            self.ConfigureTimetable();
            self.ConfigureWebsocket();
            self.UpdateScheduledNotifications();
            self.GetAllNotifications();
        }

        EventMonitor.prototype.GetInitialEventData = function () {
            var self = this;
            var event = self._data.Event;
            event.start_time = self.moment(event.start_time);
            event.end_time = self.moment(event.end_time);
            self.UpdateData();
            ImcService.FireEvent('event_loaded ' + self._data.Event.id);
        }

        EventMonitor.prototype.GetNextEvents = function (num_events) {
            var self = this;
            var sub_events = this._data.Event.subevents;
            var events = []
            for (var start_time in sub_events) {
                if (self.moment(start_time) < self.moment()) {
                    continue;
                }
                if (events.length > num_events) {
                    break;
                }
                for (var i = 0; i != sub_events[start_time].length && events.length < num_events; ++i) {
                    events.push(sub_events[start_time][i]);
                }
            }
            return events;
        }

        EventMonitor.prototype.GetAllNotifications = function () {
            var self = this;
            var event = self._data.Event;
            var total_broadcasts = 0;
            var channels_processed = 0;
            event.channels.map(function (channel) {
                var promise = NotifstaHttp.GetNotifications(channel.id);
                promise.success(function (e) {
                    var notifications = e.data;
                    channel.notifications = [];
                    notifications.reverse().map(function (notif) {
                        self.PushNewNotif(channel, notif);
                    });
                    total_broadcasts += notifications.length;
                    channels_processed += 1;
                    if (channels_processed == event.channels.length) {
                        event.total_broadcasts = total_broadcasts;
                        if (self.monitor_type == ADMIN_MONITOR) {
                            self.GetAllNotifResponses();
                        }
                    }
                    channel.selected = true;
                });
                promise.error(function (error) {
                    channel.messages = [
                    {
                        time: 'N/A',
                        message: 'Error in getting data'
                    }
                    ]
                })
            });
        }


        EventMonitor.prototype.UpdateScheduledNotifications = function () {
            var self = this;
            var data = this._data;
            var promise = NotifstaHttp.GetScheduledNotification(data.Event.channels[0].id);
            promise.success(function (resp) {
                data.Event.scheduled_notifications.length = 0;
                resp.data.map(function (s_notif) {
                    s_notif.start_time = self.moment(s_notif.start_time, moment.ISO8061)
                    data.Event.scheduled_notifications.push(s_notif);
                })
                data.Event.scheduled_notifications.sort(function (a, b) {
                    return moment(a.start_time).utc() - moment(b.start_time).utc();
                })
            });

        }

        EventMonitor.prototype.ConfigureWebsocket = function () {
            var self = this;
            function Handler(data) {
                self.OnNewNotif(data);
            }
            ImcService.AddHandler('event_' + self._data.Event.channels[0].guid + ' notif', Handler);
            NotifstaAdapter.SubscribeToNotifications(self._data.Event.channels[0].guid);
        }

        EventMonitor.prototype.AddSubEvent = function (new_event) {
            var self = this;
            var event = self._data.Event;
            if (!event.subevents[new_event.start_time]) {
                event.subevents[new_event.start_time] = [];
            }
            self._data.Event.subevents[new_event.start_time].push(new_event);
            self.ConfigureTimetable();
        }

        EventMonitor.prototype.UpdateSubEvent = function (changed_event) {
            var self = this;
            self.RemoveSubEvent(changed_event.id);
            self.AddSubEvent(changed_event);
        }
        EventMonitor.prototype.RemoveSubEvent = function (removed_event_id) {
            var self = this;
            var event = self._data.Event;
            var sub_events = self._data.Event.subevents;
            for (var start_time in sub_events) {
                for (var i = 0; i != sub_events[start_time].length; ++i) {
                    if (sub_events[start_time][i].id == removed_event_id) {
                        sub_events[start_time].splice(i, 1);
                        return;
                    }
                }
            }
            self.ConfigureTimetable();
        }

        EventMonitor.prototype.ConfigureTimetable = function () {
            var self = this;
            var sub_events = self._data.Event.subevents;
            self._data.Event.event_sources_arr[0].events.length = 0; // Clear the event source array
            self._data.Event.subevent_grouped_array.length = 0; // Clear the event source array

            for (var start_time in sub_events) {
                self._data.Event.subevent_grouped_array.push({
                    start_time: self.moment(start_time),
                    events: sub_events[start_time]
                });
                sub_events[start_time].map(function (sub_event) {
                    sub_event.title = sub_event.name + ' - ' + sub_event.location;
                    sub_event.start = self.moment(sub_event.start_time);
                    sub_event.end = self.moment(sub_event.end_time);
                    sub_event.start_time = sub_event.start;
                    sub_event.end_time = sub_event.end;
                    sub_event.start_day_time = self.moment(sub_event.start).format('hh:mm');
                    sub_event.end_day_time = self.moment(sub_event.end).format('hh:mm');
                    sub_event.allDay = false;
                    sub_event.stick = true;
                    if (self._data.Event.event_sources_arr[0]) {
                        self._data.Event.event_sources_arr[0].events.push(sub_event);
                    }
                });
            }
        }

        EventMonitor.prototype.ConvertTimetableBack = function () {
            var self = this;
            console.log(self._data.Event);
            var sub_events = self._data.Event.subevents;
            self._data.Event.event_sources_arr[0].events.length = 0; // Clear the event source array
            for (var start_time in sub_events) {
                sub_events[start_time].map(function (sub_event) {
                    self._data.Event.event_sources_arr[0].events.push({
                        title: sub_event.name,
                        start: sub_event.start_time,
                        end: sub_event.end_time,
                        location: sub_event.location,
                        allDay: false,
                        id: sub_event.id
                    });
                });
            }
        }

        EventMonitor.prototype.GetNotification = function (notif_id) {
            var self = this;
            var event = self._data.Event;
            console.log("this is the notif id man");
            console.log(notif_id);
            var promise = NotifstaHttp.GetNotification(notif_id);
            promise.success(function (resp) {
                console.log(resp);
                notif = resp.data;

                event.channels.map(function (channel) {
                    if (channel.id == notif.channel_id) {
                        self.PushNewNotif(channel, notif);
                        self.GetNotifResponses(notif);
                    }
                });
            })
        }

        //TODO see if this actually used or not
        EventMonitor.prototype.UpdateNotification = function (notif_id, channel_id) {
            var self = this;
            var promise = NotifstaHttp.GetNotification(notif_id);
            promise.success(function (resp) {
                notif = resp.data;
                notif.time = self.moment(notif.created_at).fromNow();
                if (!notif.response) {
                    notif.response = {};
                } else {
                    notif.response.new_option_id = notif.response.option_id;
                }
                var event = self._data.Event;
                event.channels.map(function (channel) {
                    if (channel.id == channel_id) {
                        for (var i = 0 ; i != channel.notifications.length; ++i) {
                            if (channel.notifications[i].id == notif.id) {
                                channel.notifications[i] = notif;
                                if (self.monitor_type == ADMIN_MONITOR) {
                                    self.GetNotifResponses(notif);
                                }
                            }
                        }
                    }
                });
            })
        }

        EventMonitor.prototype.GetAllNotifResponses = function () {
            var self = this;
            var event = self._data.Event;
            event.channels.map(function (channel) {
                for (var i = 0 ; i != channel.notifications.length; ++i) {
                    self.GetNotifResponses(channel.notifications[i]);
                }
            });
        }

        EventMonitor.prototype.GetNotifResponses = function (notif) {
            if (notif.type != 'Survey') {
                // do nothing...
                return;
            }
            notif.responses_pie_chart = {
                labels: [],
                data: []
            }

            var promise = NotifstaHttp.GetResponses(notif.id);
            promise.success(function (resp) {
                notif.responses_pie_chart.labels =
                    notif.options
                        .sort(function (a, b) { return a.id - b.id })
                        .map(function (option) {
                            return option.option_guts
                        });
                notif.responses_pie_chart.data =
                    notif.options.map(function (_) {
                        return 0;
                    })

                //Now set the chart accordingly
                resp.data.map(function (response) {
                    for (var i = 0; i != notif.options.length; ++i) {
                        var option = notif.options[i];
                        if (option.id == response.option_id) {
                            notif.responses_pie_chart.data[i] += 1;
                        }
                    }
                });
                if (resp.data.length > 0) {
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

        EventMonitor.prototype.PushNewNotif = function (channel, notif) {
            var self = this;
            notif.time = self.moment(notif.created_at).fromNow();
            if (!notif.response) {
                notif.response = {};
            } else {
                notif.response.new_option_id = notif.response.option_id;
            }
            channel.notifications.unshift(notif);
            return notif;
        }

        EventMonitor.prototype.OnNewNotif = function (data) {
            console.log('New notification');
            var self = this;
            console.log(data);
            var notif = data.notification;
            //Desktop notifications
            DesktopNotifs.FireNotification(notif);

            if (self.monitor_type == ADMIN_MONITOR) {
                console.log('Getting more detailed information about the notification');
                self.GetNotification(notif.id);
            } else if (self.monitor_type == NON_ADMIN_MONITOR) {
                console.log('adding notification to UI')
                var event = self._data.Event;
                event.channels.map(function (channel) {
                    if (channel.id == notif.channel_id) {
                        self.PushNewNotif(channel, notif);
                    }
                });
            }

            //Update scheduled notifications
            setTimeout(function () {
                self.UpdateScheduledNotifications();
            }, 1000);
        }

        EventMonitor.prototype.UpdateTimestamps = function () {
            var self = this;
            var event = self._data.Event;
            try {
                event.channels = event.channels.map(function (channel) {
                    channel.notifications = channel.notifications.map(function (notif) {
                        notif.time = self.moment(notif.created_at).fromNow();
                        return notif;
                    })
                    return channel;
                })
                $rootScope.$apply();
            } catch (err) {
                console.log(err);
            }
            setTimeout(function () { self.UpdateTimestamps() }, 1000);
        }

        EventMonitor.prototype.ConfigureMap = function () {
            var self = this;
            var geocoder = new google.maps.Geocoder();
            var address = self._data.Event.address;
            geocoder.geocode({ 'address': self._data.Event.address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.lat();
                    var lng = results[0].geometry.location.lng();
                    self._data.Event.map = { center: { latitude: lat, longitude: lng }, zoom: 15 };
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
            if (self.monitor_type == ADMIN_MONITOR) {
                //FIXME: Big hack for the issue of not being able to set the initial value of the searchbox
                function SetAddress() {
                    var el = document.getElementById('searchbox');
                    if (el == null) {
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
            NON_ADMIN_MONITOR: NON_ADMIN_MONITOR,
            T_FORMAT : TIMESTRING_FORMAT
        }
    }
})();
