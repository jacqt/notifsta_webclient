/// <reference path="service.js"/>
/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */


(function () {
    angular.module('notifsta.controllers').controller('AdminCtrl',
        ['$scope', 'NotifstaHttp', 'EventMonitor', '$cookies', '$timeout', '$routeParams', 'toaster', 'ImcService', '$compile', 'uiCalendarConfig', 'AddressService',
    function ctrl($scope, NotifstaHttp, EventMonitor, $cookies, $timeout, $routeParams, toaster, ImcService, $compile, uiCalendarConfig, AddressService) {
        //TESTING PURPOSES ONLY
        //var p = NotifstaHttp.LoginEvent('event1', 'asdfasdf');

        $scope.cover_photo_preview = {
            templateUrl: 'app/admin/cover_photo_preview.html'
        }
        $scope.event_map_preview = {
            templateUrl: 'app/admin/event_map_preview.html'
        }
        $scope.partial_subevent = {};

        $scope.$watch('partial_subevent.start_time', function (newVal) {
            if ($scope.partial_subevent.id || !newVal || $scope.data.Event.event_sources[1].events.length == 0) {
                return;
            }
            if (newVal == $scope.data.Event.event_sources[1].events[0].start) {
                return;
            }
            console.log($scope.data.Event.event_sources[1].events[0]);
            var evs = uiCalendarConfig.calendars.timetable_c.fullCalendar('clientEvents', function (ev) {
                return ev.partial;
            });
            console.log(evs);
            if (evs.length == 0) {
                return;
            }
            evs[0].start = moment($scope.partial_subevent.start_time);
            evs[0].end = moment($scope.partial_subevent.end_time);
            uiCalendarConfig.calendars.timetable_c.fullCalendar('updateEvent', evs[0]);
        });
        $scope.$watch('partial_subevent.end_time', function (newVal) {
            if ($scope.partial_subevent.id || !newVal || $scope.data.Event.event_sources[1].events.length == 0) {
                return;
            }
            var evs = uiCalendarConfig.calendars.timetable_c.fullCalendar('clientEvents', function (ev) {
                return ev.partial;
            });
            console.log(evs);
            if (evs.length == 0) {
                return;
            }
            evs[0].start = moment($scope.partial_subevent.start_time);
            evs[0].end = moment($scope.partial_subevent.end_time);
            uiCalendarConfig.calendars.timetable_c.fullCalendar('updateEvent', evs[0]);
        });

        $scope.cover_photo_files = [];
        $scope.event_map_files = [];
        $scope.temp = {};
        $scope.config = {
            sending_survey: false,
            scheduled_notif: {
                show: false,
                start_time: moment(),
                showme: function () {
                    return $scope.config.scheduled_notif.show
                }
            },
        };
        $scope.revert_changes = function () {
            if ($scope.temp.event_map_url) {
                $scope.data.Event.event_map_url = $scope.temp.event_map_url;
            }
            if ($scope.temp.cover_photo_url) {
                $scope.data.Event.cover_photo_url = $scope.temp.cover_photo_url;
            }
            $scope.temp = {};
        }
        $scope.event = {
            name: $routeParams.event_name,
            id: $routeParams.event_id
        }

        $scope.timeoption = {
            editing: false,
            edit: function(){
                $scope.timeoption.start_time = $scope.data.Event.start_time;
                $scope.timeoption.end_time = $scope.data.Event.end_time;
                $scope.timeoption.editing = true;
            },
            cancel: function () {
                $scope.timeoption.editing = false;
            },
            save: function () {
                $scope.timeoption.editing = false;
                $scope.data.Event.start_time = $scope.timeoption.start_time;
                $scope.data.Event.end_time = $scope.timeoption.end_time;
                $scope.publish_updates();
            },
            start_time: null,
            end_time: null
        
        };
        $scope.$watch('timeoption.start_time', function (newVal) {
            if (!$scope.timeoption.start_time) {
                return;
            }
            console.log(newVal);
            var sv = moment(newVal);
            var ev = moment($scope.timeoption.end_time);
            if (sv > ev) {
                $scope.timeoption.end_time = sv.add(2,'hours');
            } 
        });

        $scope.$watch('timeoption.end_time', function (newVal) {
            if (!$scope.timeoption.end_time) {
                return;
            }
            console.log(newVal);
            var ev = moment(newVal);
            var sv = moment($scope.timeoption.start_time);
            if (sv > ev) {
                $scope.timeoption.start_time = newVal;
            } 
        });
        var TIMEOUT = 1 * 1000;

        var event_monitor = EventMonitor.GetMonitor($scope.event, EventMonitor.ADMIN_MONITOR);

        //Data binding for new notifications
        $scope.input = {
            broadcast: '',
            options: [],
            next_option: {
                text: ''
            }
        }

        $scope.submit_description_update = function () {
            var description = $scope.data.Event.description;
        }
        $scope.submit_address_update = function () {
            var description = $scope.data.Event.description;
        }
        $scope.submit_start_time_update = function () {
            var description = $scope.data.Event.description;
        }
        $scope.submit_end_time_update = function () {
            var description = $scope.data.Event.description;
        }

        $scope.submit_cover_photo_update = function () {
        }
        $scope.submit_event_map_update = function () {
        }

        $scope.on_time_set = function (newDate, oldDate) {
            var n = moment(newDate).unix();
            var o = moment(oldDate).unix();
            if (n != o) {
                $scope.publish_updates();
            }
            $scope.data.Event.start_time =
              moment($scope.data.Event.start_time).format('LLL');
            $scope.data.Event.end_time =
              moment($scope.data.Event.end_time).format('LLL');
        }

        $scope.publish_updates = function () {
            $scope.temp = {};
            var promise = NotifstaHttp.PublishEventUpdate($scope.data.Event);
            promise.success(function (e) {
                if (e.status == 'success') {
                    toaster.pop('success', 'Successfuly updated event');
                    console.log($scope.data.Event.address);
                } else {
                    toaster.pop('error', e.error);
                }

            });
        }

        $scope.format_date = function(time_string){
            return moment(time_string).format('LLL');
        }

        $scope.create_option = function () {
            $scope.input.options.unshift({
                text: $scope.input.next_option.text
            });
            $scope.input.next_option = {
                text: ''
            }
        }

        $scope.cover_photo_toggle = function () {
            $scope.editing_cover_photo = !$scope.editing_cover_photo;
        }
        $scope.map_url_toggle = function () {
            $scope.editing_map_url = !$scope.editing_map_url;
        }

        $scope.$watch('cover_photo_files', function () {
            $scope.upload($scope.cover_photo_files, function (data) {
                console.log(data);
                if (data) {
                    $scope.temp.cover_photo_url = $scope.data.Event.cover_photo_url;
                    $scope.data.Event.cover_photo_url = data.Location;
                    $scope.loading = false;
                }
            });
        });

        $scope.$watch('event_map_files', function () {
            $scope.upload($scope.event_map_files, function (data) {
                if (data) {
                    $scope.temp.event_map_url = $scope.data.Event.event_map_url;
                    $scope.data.Event.event_map_url = data.Location;
                    $scope.loading = false;
                }
            });
        });

        var bucket = new AWS.S3({ params: { Bucket: 'notifsta' } });
        $scope.upload = function (files, cb) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var params = { Key: file.name, ContentType: file.type, Body: file };
                    $scope.loading = true;
                    bucket.upload(params, function (err, data) {
                        console.log(data);
                        cb(data);
                    });
                }
            }
        };

        $scope.toggle_survey = function ($event) {
            console.log($event);
            if (!$event.$material) {
                $scope.config.sending_survey = !$scope.config.sending_survey;
                $scope.config.sending_survey_sep = $scope.config.sending_survey;
                $scope.config.sending_survey_sep_2 = $scope.config.sending_survey;
                setTimeout(function () {
                    $scope.$apply();
                }, 10);
            }
        }
        $scope.sending_survey = function () {
            return !$scope.config.sending_survey;
        }

        $scope.option_keypressed = function (event, option) {
        }

        $scope.finish_editing = function (option) {
            if (option.text == '') {
                //Delete it
                $scope.input.options.splice($scope.input.options.indexOf(option), 1);
            } else {
                option.editing = false;
            }

        }

        $scope.create_notification = function () {
            var channel_ids = $scope.data.Event.channels
            .filter(function (channel) {
                return channel.selected;
            })
            .map(function (channel) {
                return channel.id;
            })
            if ($scope.config.sending_survey) {
                var question = $scope.input.message;
                var options = $scope.input.options.map(function (opt) {
                    return opt.text;
                });
                var promises = NotifstaHttp.CreateSurvey(question, options, channel_ids);
            } else {
                var message = $scope.input.message;
                var promises = NotifstaHttp.CreateNotification(message, channel_ids);
            }

            $scope.loading = true;
            var succeeded = 0;
            promises.map(function (p) {
                p.success(function (e) {
                    succeeded += 1;
                    if (succeeded == channel_ids.length) {
                        $scope.loading = false;
                        if (e.error || e.status == "failure") {
                            toaster.pop('error', e.error);
                        } else {
                            toaster.pop('success', 'Successfuly sent notification');
                            $scope.input.message = '';
                            $scope.input.options = [];
                            $scope.input.next_option.text = '';
                            $scope.input.focus_notice = false;
                        }
                    }
                });
                p.error(function (e) {
                    $scope.loading = false;
                });
            })
        }

        $scope.schedule_notification = function(){
            $scope.config.scheduled_notif.start_time = moment();
            $scope.config.scheduled_notif.show = true;
            setTimeout(function () {
                $scope.$apply();
            }, 10);

        }
        $scope.create_scheduled_notification = function () {
            var channel_ids = [$scope.data.Event.channels[0].id];
            if ($scope.config.sending_survey) {
                throw "Scheduling surveys is not implemented yet";
            } else {
                var message = $scope.input.message;
                var start_time = $scope.config.scheduled_notif.start_time;
                var event_id = $scope.data.Event.id;
                var promises = NotifstaHttp.CreateScheduledNotification(message, start_time, event_id, channel_ids);
            }

            var succeeded = 0;
            promises.map(function (p) {
                p.success(function (e) {
                    succeeded += 1;
                    if (succeeded == channel_ids.length) {
                        if (e.error || e.status == "failure") {
                            toaster.pop('error', e.error);
                        } else {
                            toaster.pop('success', 'Successfuly scheduled notification');
                            $scope.input.message = '';
                            $scope.input.options = [];
                            $scope.input.next_option.text = '';
                            $scope.input.focus_notice = false;
                            $scope.config.scheduled_notif.show = false;
                            event_monitor.UpdateScheduledNotifications();
                        }
                    }
                });
                p.error(function (e) {
                    $scope.loading = false;
                });
            })
        }

        $scope.edit_scheduled_notification = function (notif) {
            console.log(notif);
            notif.editing = true;
            notif.temp = {
                start_time: notif.start_time.clone(),
                message: notif.message
            };
        }

        $scope.cancel_edit_scheduled_notification = function (notif) {
            notif.editing = false;
        }

        $scope.save_edit_scheduled_notification = function (notif) {
            var event_id = $scope.data.Event.id;
            var promise = NotifstaHttp.UpdateScheduledNotification(
                notif.temp.message,
                notif.temp.start_time,
                event_id,
                notif.channel_id,
                notif.id
            );
            promise.success(function (resp) {
                console.log(resp);
                if (resp.status === "success") {
                    notif.start_time = moment(resp.data.start_time, moment.ISO8061);
                    notif.message = resp.data.message;
                    toaster.pop('success', 'Successfuly updated notification');
                }
                notif.editing = false;
            })
        }
        $scope.delete_scheduled_notification = function (notif) {
            var event_id = $scope.data.Event.id;
            var promise = NotifstaHttp.DeleteScheduledNotification(
                notif.channel_id,
                event_id,
                notif.id
            );
            promise.success(function (resp) {
                console.log(resp);
                if (resp.status === "success") {
                    event_monitor.UpdateScheduledNotifications();
                    toaster.pop('success', 'Successfuly deleted notification');
                }
                notif.editing = false;
            })

            notif.editing = false;
        }

        $scope.selected_none = function () {
            return $scope.data.Event.channels.filter(function (e) { return e.selected }).length == 0;
        }

        $scope.data = event_monitor._data;
        $scope.GetNotifResponses = event_monitor.GetNotifResponses;

        /* GOOGLE MAPS */
        $scope.options = { scrollwheel: false, draggable: false };
        var events = {
            places_changed: function (searchBox) {
                console.log(searchBox);
                var places = searchBox.getPlaces();
                if (places.length > 0) {
                    $scope.data.Event.address = $('#searchbox').val();
                    var place = places[0];
                    var lat = place.geometry.location.lat();
                    var lng = place.geometry.location.lng();
                    $scope.data.Event.map.center.latitude = lat;
                    $scope.data.Event.map.center.longitude = lng;
                    $scope.data.Event.map.zoom = 15;
                    $scope.data.Event.marker.coords.latitude = lat;
                    $scope.data.Event.marker.coords.longitude = lng;

                    $scope.$apply();
                    $scope.publish_updates();
                }
            }
        }
        $scope.searchbox = { template: 'searchbox.tpl.html', events: events };


        //CALENDAR
        $scope.calendar_editable = true;
        function disable_all_events() {
            console.log('disabling events...');
            $scope.calendar_editable = false;
            $scope.data.Event.event_sources.map(function (event_source) {
                event_source.events.map(function (event) {
                    event.editable = false;
                })
            })
            console.log($scope.data.Event.event_sources);
        }
        function enable_all_events() {
            $scope.calendar_editable = true;
            $scope.data.Event.event_sources.map(function (event_source) {
                event_source.events.map(function (event) {
                    event.editable = true;
                })
            })
            uiCalendarConfig.calendars.timetable_c.fullCalendar({ 'editable': false });
        }

        if ($scope.data.Event.event_sources.length < 2) {
            $scope.data.Event.event_sources = [{
                events: [],
                color: '#da4e4e',   // an option!
                textColor: 'white' // an option!
            }, {
                events: [],
                color: 'white',
                textColor: 'black',
                borderColor: 'red'
            }]
        }

        function UpdateSubEvent(changed_event) {
            var promise = NotifstaHttp.PublishSubEventUpdate($scope.data.Event, changed_event);
            promise.success(function (e) {
                if (e.status == 'success') {
                    toaster.pop('success', 'Successfuly updated timetable');
                    var evs = $scope.data.Event.event_sources[0].events;
                    for (var i = 0 ; i != evs.length; ++i) {
                        if (evs[i].id == changed_event.id) {
                            uiCalendarConfig.calendars.timetable_c.fullCalendar('refetchEvents');
                            $scope.partial_subevent.start_time = null;
                            $scope.partial_subevent.end_time = null;
                            $scope.partial_subevent.name = null;
                            $scope.partial_subevent.description = null;
                            $scope.partial_subevent.location = null;
                            $scope.editing_subevent = false;
                        }
                    }
                } else {
                    console.log(e);
                    toaster.pop('error', e.error);
                }
            });
        }

        $scope.event_editor_popup = {
            posX: 0,
        }

        //Super bad hack that we need.
        //Keep trying to render the calendar 
        //This is needed because the FullCalendar library does not render calendars that are not visible! 
        var first_time = true;
        $scope.show_calendar = function () {
            setTimeout(function () {
                if (!$scope.data.Event.uiConfig){
                    $scope.data.Event.uiConfig = {
                        calendar: {
                            height: 650,
                            editable: true,
                            defaultView: 'agendaDay',
                            header: {
                                left: 'agendaWeek agendaDay',
                                center: 'title',
                                right: 'prev,next'
                            },
                            firstDay: moment($scope.data.Event.start_time).format('d'),
                            defaultDate: new Date($scope.data.Event.start_time),
                            scrollTime: moment($scope.data.Event.start_time).format('HH:mm:ss'),
                            snapDuration: { minutes: 5 },
                            allDaySlot: false,
                            slotDuration: { minutes: 15 },
                            dayClick: on_day_click,
                            eventClick: on_event_click,
                            eventDrop: alertOnDrop,
                            eventResize: on_event_resize
                        }
                    }

                    setTimeout(function () {
                        uiCalendarConfig.calendars.timetable_c.fullCalendar('refetchEvents');
                    }, 1000);
                    first_time = false;
                } else {
                    uiCalendarConfig.calendars.timetable_c.fullCalendar('render');
                }

            }, 400);
        }
        $scope.timetable_clicked = function (ev) {
            if (!$scope.calendar_editable) return;
            console.log(ev);
            var CALENDAR_LEFT_LABEL_WIDTH = 93;
            var w = $('.fc-day').width();
            var x_offset = 117;//$('.fc-widget-content').offset().left;
            var x_rel = ev.pageX - x_offset;
            var x_rel = Math.floor(x_rel / w) * w;
            console.log(ev.pageX);
            console.log(x_rel);
            if (x_rel - 350 > 0) {
                $scope.event_editor_popup.posX = x_rel - 400 + 20  + CALENDAR_LEFT_LABEL_WIDTH;
            } else {
                $scope.event_editor_popup.posX = x_rel + w + 40 + CALENDAR_LEFT_LABEL_WIDTH;
            }
            $scope.event_editor_popup.posX = x_rel + CALENDAR_LEFT_LABEL_WIDTH;
            console.log(ev.pageY);
            console.log($('.fc-center').offset().top);
            $scope.event_editor_popup.posY =  Math.min(ev.pageY - $('.fc-center').offset().top - 800, -400);
        }


        var on_day_click = function (date, jsEvent, view) {
            if (!$scope.calendar_editable) return;
            //disable_all_events();
            console.log(date);
            $scope.partial_subevent = {
                name: null,
                description: null,
                start_time: moment(date.format('LLL')).format('LLL'),
                end_time: moment(date.format('LLL')).add(1, 'hour').format('LLL'),
                location: null
            }
            $scope.data.Event.event_sources[1].events.push({
                title: '',
                start: moment($scope.partial_subevent.start_time),
                end: moment($scope.partial_subevent.end_time),
                allDay: false,
                partial: true
            });

            show_subevent();
        };

        var show_subevent = function () {
            setTimeout(function () {
                $scope.editing_subevent = true;
                //disable_all_events();
            }, 100);
            $scope.subevent_editor.$show();
        }
        var on_event_click = function (calEvent, jsEvent, view) {
            if (!$scope.calendar_editable) {
                jsEvent.stopPropagation()
                return;
            }
            console.log(calEvent);
            calEvent.start_time = moment(calEvent.start.format('LLL')).format('LLL');
            calEvent.end_time = moment(calEvent.end.format('LLL')).format('LLL');
            for (var key in calEvent) {
                $scope.partial_subevent[key ] = calEvent[key]
            }
            show_subevent();
        }

        var alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
            console.log(event.partial);
            if (event.partial) { //update the partial event 
                $scope.partial_subevent.start_time = moment(event.start.format('LLL')).format('LLL');
                $scope.partial_subevent.end_time = moment(event.end.format('LLL')).format('LLL');
            } else {
                event.start_time = moment(event.start.format('LLL')).format('LLL');
                event.end_time = moment(event.end.format('LLL')).format('LLL');
                UpdateSubEvent(event);
            }
        };

        var on_event_resize = function (event, delta, revertFunc, jsEvent, ui, view) {
            if (event.partial) { //update the partial event 
                $scope.partial_subevent.start_time = moment(event.start.format('LLL')).format('LLL');
                $scope.partial_subevent.end_time = moment(event.end.format('LLL')).format('LLL');
            } else {
                event.start_time = moment(event.start.format('LLL')).format('LLL');
                event.end_time = moment(event.end.format('LLL')).format('LLL');
                UpdateSubEvent(event);
            }
        };

        $scope.cancel_subevent_editing = function () {
            //enable_all_events();
            $scope.editing_subevent = false;
            $scope.partial_subevent.start_time = null;
            $scope.partial_subevent.end_time = null;
            $scope.partial_subevent.name = null;
            $scope.partial_subevent.description = null;
            $scope.partial_subevent.location = null;
            $scope.data.Event.event_sources[1].events.splice(0, 1);
        }

        $scope.save_subevent = function () {
            //enable_all_events();
            if ($scope.partial_subevent.id) {
                var event = $scope.partial_subevent;
                event.title = event.name;

                //We need to use the setters here because we are directly manipulating the FullCalendar FCMoment object
                //which is an augmented version of moment, and is something we do not have access to!
                var s = moment($scope.partial_subevent.start_time).zone(moment().zone());
                $scope.partial_subevent.start.set({
                    year: s.get('year'),
                    month: s.get('month'),
                    date: s.get('date'),
                    hour: s.get('hour'),
                    minute: s.get('minute')
                });
                var e = moment($scope.partial_subevent.end_time).zone(moment().zone());
                $scope.partial_subevent.end.set({
                    year: e.get('year'),
                    month: e.get('month'),
                    date: e.get('date'),
                    hour: e.get('hour'),
                    minute: e.get('minute')
                });
                console.log(s);
                console.log(e);
                UpdateSubEvent($scope.partial_subevent);
            } else {
                var promise = NotifstaHttp.CreateSubEvent($scope.data.Event, $scope.partial_subevent);
                promise.success(function (ev) {
                    if (ev.status == 'success') {
                        console.log(ev.data);
                        var new_event = ev.data;
                          new_event.title = new_event.name + ' - ' + new_event.description;
                          new_event.start = moment(new_event.start_time).format('LLL');
                          new_event.end = moment(new_event.end_time).format('LLL');
                          new_event.start_time = new_event.start;
                          new_event.end_time = new_event.end;
                          new_event.start_day_time = moment(new_event.start).format('hh:mm');
                          new_event.end_day_time = moment(new_event.end).format('hh:mm');
                          new_event.allDay = false;
                        $scope.data.Event.event_sources[0].events.push(new_event);
                        toaster.pop('success', 'Successfuly added new event');
                        $scope.partial_subevent.start_time = null;
                        $scope.partial_subevent.end_time = null;
                        $scope.partial_subevent.name = null;
                        $scope.partial_subevent.description = null;
                        $scope.partial_subevent.location = null;
                        $scope.editing_subevent = false;
                        $scope.data.Event.event_sources[1].events.splice(0, 1);
                    } else {
                        console.log(ev);
                        toaster.pop('error', ev.error);
                        console.log($scope.partial_subevent);
                        show_subevent();
                    }
                });
            }
        }

        ImcService.AddHandler('event_loaded ' + $scope.event.id, function (data) {
            //console.log(uiCalendarConfig)
            //uiCalendarConfig.calendars.timetable_c.fullCalendar('gotoDate', new Date($scope.data.Event.start_time));
            ////uiCalendarConfig.calendars.timetable_c.fullCalendar({ 'scrollTime': moment($scope.data.Event.start_time).format('hh:mm') });
            //    $('timetable_c').fullCalendar({
            //        defaultView: 'agendaWeek',
            //        scrollTime: '00:00:00'
            //    });
            //    uiCalendarConfig.calendars.timetable_c.fullCalendar('render');
            //console.log('HEEy');
        });

        if ($scope.data.Event.start_time) {
            setTimeout(function () {
                //$scope.timetable_c.fullCalendar('gotoDate', new Date($scope.data.Event.start_time));
                    //$('timetable_c').fullCalendar({
                    //    defaultView: 'agendaWeek',
                    //    scrollTime: '00:00:00'
                    //});
            }, 100);
        }

        $scope.editing_subevent = false;

    }]);
})();
