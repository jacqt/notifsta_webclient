/// <reference path="service.js"/>
/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */


(function () {
    angular.module('notifsta.controllers').controller('AdminCtrl',
        ['$scope', 'NotifstaHttp', 'EventMonitor', '$cookies', '$timeout',
            '$routeParams', 'toaster', 'ImcService', '$compile',
            'uiCalendarConfig', 'AddressService', 'Fullscreen', '$q', '$mdDialog',
    function ctrl($scope, NotifstaHttp, EventMonitor, $cookies, $timeout, $routeParams, toaster, ImcService, $compile, uiCalendarConfig, AddressService, Fullscreen, $q, $mdDialog) {
        //TESTING PURPOSES ONLY
        //var p = NotifstaHttp.LoginEvent('event1', 'asdfasdf');

        $scope.event = {
            name: $routeParams.event_name,
            id: $routeParams.event_id,
        }

        if ($routeParams.first_time) {
            setTimeout(function () {
                $mdDialog.show({
                    templateUrl: 'app/admin/welcome_event/welcome_message.html',
                    parent: angular.element(document.body),
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true,
                })
                .then(function (answer) {
                }, function () {
                });
            }, 4000);
        }

        $scope.hideDialog = function () {
            $mdDialog.hide();
        }

        $scope.timezone_names = moment.tz.names().map(function (name) {
            return {
                value: name,
                text: name
            }
        });
        var event_monitor = EventMonitor.GetMonitor($scope.event, EventMonitor.ADMIN_MONITOR);
        $scope.PublishEvent = function () {
            $mdDialog.show({
                templateUrl: 'app/admin/stripe_payment/payment_modal.html',
                parent: angular.element(document.body),
                controller: 'PaymentCtrl',
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: true,
            })
            .then(function (answer) {
            }, function () {
            });
        };

        $scope.ToggleFullScreen = function () {
            console.log('Going into full screen mode')
            Fullscreen.enable(document.getElementById('projector'));
            setTimeout(function () {
                $scope.$apply();
                CreateTwitterTimeline();
            }, 1);
        }
        var loaded_timeline = false;
        function CreateTwitterTimeline() {
            if (!$scope.data.Event.twitter_widget_id || loaded_timeline) {
                return;
            }
            console.log('WATSUP CATSUP');
            twttr.widgets.createTimeline(
              $scope.data.Event.twitter_widget_id,
              document.getElementById('twitter_timeline'),
              {
                  'padding-bottom': '200px',
                  width: '1000',
                  related: 'twitterdev,twitterapi'
              }).then(function (el) {
                  setTimeout(function () {
                      $('#twitter_timeline').find('iframe').contents().find('div.timeline-footer').css('display', 'none');
                  }, 100);
                  console.log("Embedded a timeline.")
                  loaded_timeline = true;
              });
        }

        $scope.is_full_screen = function () {
            return Fullscreen.isEnabled();
        }

        $scope.cover_photo_preview = {
            templateUrl: 'app/admin/cover_photo_preview.html'
        }
        $scope.event_map_preview = {
            templateUrl: 'app/admin/event_map_preview.html'
        }
        $scope.partial_subevent = {};

        $scope.$watch('partial_subevent.start_time', function (newVal) {
            if ($scope.partial_subevent.id || !newVal || $scope.data.Event.event_sources_arr[1].events.length == 0) {
                return;
            }
            if (newVal == $scope.data.Event.event_sources_arr[1].events[0].start) {
                return;
            }
            var evs = uiCalendarConfig.calendars.timetable_c.fullCalendar('clientEvents', function (ev) {
                return ev.partial;
            });
            if (evs.length == 0) {
                return;
            }
            evs[0].start = event_monitor.moment($scope.partial_subevent.start_time);
            evs[0].end = event_monitor.moment($scope.partial_subevent.end_time);
            uiCalendarConfig.calendars.timetable_c.fullCalendar('updateEvent', evs[0]);
        });
        $scope.$watch('partial_subevent.end_time', function (newVal) {
            if ($scope.partial_subevent.id || !newVal || $scope.data.Event.event_sources_arr[1].events.length == 0) {
                return;
            }
            var evs = uiCalendarConfig.calendars.timetable_c.fullCalendar('clientEvents', function (ev) {
                return ev.partial;
            });
            if (evs.length == 0) {
                return;
            }
            evs[0].start = event_monitor.moment($scope.partial_subevent.start_time);
            evs[0].end = event_monitor.moment($scope.partial_subevent.end_time);
            uiCalendarConfig.calendars.timetable_c.fullCalendar('updateEvent', evs[0]);
        });

        $scope.cover_photo_files = [];
        $scope.event_map_files = [];
        $scope.temp = {};
        $scope.config = {
            sending_survey: false,
            scheduled_notif: {
                show: false,
                start_time: event_monitor.moment(),
                showme: function () {
                    return $scope.config.scheduled_notif.show;
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

        $scope.timeoption = {
            editing: false,
            edit: function () {
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
            var sv = event_monitor.moment(newVal);
            var ev = event_monitor.moment($scope.timeoption.end_time);
            if (sv > ev) {
                $scope.timeoption.end_time = sv.add(2, 'hours');
            }
        });


        $scope.$watch('timeoption.end_time', function (newVal) {
            if (!$scope.timeoption.end_time) {
                return;
            }
            console.log(newVal);
            var ev = event_monitor.moment(newVal);
            var sv = event_monitor.moment($scope.timeoption.start_time);
            if (sv > ev) {
                $scope.timeoption.start_time = newVal;
            }
        });
        var TIMEOUT = 1 * 1000;


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
            var n = event_monitor.moment(newDate).unix();
            var o = event_monitor.moment(oldDate).unix();
            if (n != o) {
                $scope.publish_updates();
            }
            $scope.data.Event.start_time =
              event_monitor.moment($scope.data.Event.start_time).format('LLL');
            $scope.data.Event.end_time =
              event_monitor.moment($scope.data.Event.end_time).format('LLL');
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

        $scope.format_date = function (time_string) {
            return event_monitor.moment(time_string).format(EventMonitor.T_FORMAT);
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
            console.log('umnmm');
            console.log($scope.cover_photo_files);

            if ($scope.cover_photo_files && $scope.cover_photo_files.length > 0) {
                $scope.cover_photo_uploading = true;
                $scope.upload($scope.cover_photo_files, function (data) {
                    console.log(data);
                    if (data) {
                        $scope.temp.cover_photo_url = $scope.data.Event.cover_photo_url;
                        $scope.data.Event.cover_photo_url = data.Location;
                        $scope.publish_updates();
                    }
                    $scope.cover_photo_uploading = false;
                });
            }
        });

        $scope.$watch('event_map_files', function () {
            console.log($scope.event_map_files);
            if ($scope.event_map_files && $scope.event_map_files.length > 0) {
                $scope.event_map_uploading = true;
                $scope.upload($scope.event_map_files, function (data) {
                    if (data) {
                        $scope.temp.event_map_url = $scope.data.Event.event_map_url;
                        $scope.data.Event.event_map_url = data.Location;
                        $scope.publish_updates();
                    }
                    $scope.event_map_uploading = false;
                });

            }
        });

        var bucket = new AWS.S3({ params: { Bucket: 'notifsta' } });
        $scope.upload = function (files, cb) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var params = { Key: file.name, ContentType: file.type, Body: file };
                    bucket.upload(params, function (err, data) {
                        console.log(data);
                        cb(data);
                    });
                }
            } else {
                cb(null);
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

        $scope.schedule_notification = function () {
            $scope.config.scheduled_notif.start_time = event_monitor.moment();
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
                var promises = NotifstaHttp.CreateScheduledNotification(message, start_time, channel_ids);
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
                notif.channel_id,
                notif.id
            );
            promise.success(function (resp) {
                console.log(resp);
                if (resp.status === "success") {
                    notif.start_time = event_monitor.moment(resp.data.start_time, moment.ISO8061);
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
        $scope.options = {
            scrollwheel: false,
            draggable: false,
            mapTypeControlOptions: {
                mapTypeIds: [ google.maps.TERRAIN ]
            }
        };
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
                    var lat = place.geometry.location.lat();
                    var lng = place.geometry.location.lng();
                    $.ajax({
                        url: "https://maps.googleapis.com/maps/api/timezone/json?location="+lat+"," + lng + " + &timestamp=" + (Math.round((new Date().getTime()) / 1000)).toString() + "&sensor=false",
                    }).done(function (response) {
                        if (response.timeZoneId != null) {
                            console.log(response.timeZoneId);
                            $scope.data.Event.timezone = response.timeZoneId;
                            //$scope.publish_updates();
                        }
                    });

                    $scope.$apply();
                    //$scope.publish_updates();
                }
            }
        }
        $scope.searchbox = { template: 'searchbox.tpl.html', events: events };


        //CALENDAR
        $scope.calendar_editable = true;
        function disable_all_events() {
            console.log('disabling events...');
            $scope.calendar_editable = false;
            $scope.data.Event.event_sources_arr.map(function (event_source) {
                event_source.events.map(function (event) {
                    event.editable = false;
                })
            })
            console.log($scope.data.Event.event_sources_arr);
        }
        function enable_all_events() {
            $scope.calendar_editable = true;
            $scope.data.Event.event_sources_arr.map(function (event_source) {
                event_source.events.map(function (event) {
                    event.editable = true;
                })
            })
            uiCalendarConfig.calendars.timetable_c.fullCalendar({ 'editable': false });
        }

        if ($scope.data.Event.event_sources_arr.length < 2) {
            $scope.data.Event.event_sources_arr = [{
                events: [],
                color: '#da4e4e',   // an option!
                textColor: 'white' // an option!
            }, {
                events: [],
            }]
        }

        function UpdateSubEvent(changed_event) {
            return $q(function (resolve, reject) {
                var promise = NotifstaHttp.PublishSubEventUpdate($scope.data.Event, changed_event);
                promise.success(function (e) {
                    if (e.status == 'success') {
                        toaster.pop('success', 'Successfuly updated timetable');
                        event_monitor.UpdateSubEvent(e.data);
                        refresh_calendar();

                        $scope.partial_subevent.start_time = null;
                        $scope.partial_subevent.end_time = null;
                        $scope.partial_subevent.name = null;
                        $scope.partial_subevent.description = null;
                        $scope.partial_subevent.location = null;
                        $scope.editing_subevent = false;
                        resolve();
                    } else {
                        console.log(e);
                        if (e.data) {
                            toaster.pop('error', e.data);
                        } else if (e.error) {
                            toaster.pop('error', e.error);
                        } else {
                            toaster.pop('error', 'Encountered an error');
                        }
                        reject();
                    }
                });

            })
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
                if (!$scope.data.Event.uiConfig) {
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
                            firstDay: event_monitor.moment($scope.data.Event.start_time).format('d'),
                            defaultDate: new Date($scope.data.Event.start_time),
                            scrollTime: event_monitor.moment($scope.data.Event.start_time).format('HH:mm:ss'),
                            snapDuration: { minutes: 5 },
                            allDaySlot: false,
                            slotDuration: { minutes: 15 },
                            dayClick: on_day_click,
                            eventClick: on_event_click,
                            eventDrop: on_event_change,
                            eventResize: on_event_change,
                            viewRender: on_view_change
                        }
                    }

                    setTimeout(function () {
                        refresh_calendar();
                    }, 1000);
                    first_time = false;
                } else {
                    uiCalendarConfig.calendars.timetable_c.fullCalendar('render');
                }

            }, 400);
        }
        $scope.timetable_clicked = function (ev) {
            var CALENDAR_LEFT_LABEL_WIDTH = 93;
            var w = $('.fc-day').width();
            var x_offset = 117;//$('.fc-widget-content').offset().left;
            var x_rel = ev.pageX - x_offset;
            var x_rel = Math.floor(x_rel / w) * w;
            if (x_rel - 350 > 0) {
                $scope.event_editor_popup.posX = x_rel - 400 + 20 + CALENDAR_LEFT_LABEL_WIDTH;
            } else {
                $scope.event_editor_popup.posX = x_rel + w + 40 + CALENDAR_LEFT_LABEL_WIDTH;
            }
            $scope.event_editor_popup.posX = x_rel + CALENDAR_LEFT_LABEL_WIDTH;
            $scope.event_editor_popup.posY = Math.min(ev.pageY - $('.fc-center').offset().top - 800, -400);
        }


        var on_day_click = function (date, jsEvent, view) {
            if (!$scope.calendar_editable) return;
            //disable_all_events();
            $scope.partial_subevent = {
                name: null,
                description: null,
                start_time: event_monitor.moment_no_convert(date),
                end_time: event_monitor.moment_no_convert(date).add(1, 'hour'),
                location: null
            }
            $scope.data.Event.event_sources_arr[1].events.push({
                title: '',
                start: event_monitor.moment($scope.partial_subevent.start_time),
                end: event_monitor.moment($scope.partial_subevent.end_time),
                allDay: false,
                partial: true
            });
            refresh_calendar();
            setTimeout(function () {
                show_subevent();
            }, 5);
        };

        var show_subevent = function () {
            setTimeout(function () {
                $scope.subevent_editor.$activate('name');
                //disable_all_events();
            }, 100);
            $scope.editing_subevent = true;
            $scope.subevent_editor.$hide();
            $scope.subevent_editor.$show();
        }
        var on_event_click = function (calEvent, jsEvent, view) {
            if (!$scope.calendar_editable) {
                jsEvent.stopPropagation()
                return;
            }
            calEvent.start_time = event_monitor.moment(calEvent.start);
            calEvent.end_time = event_monitor.moment(calEvent.end);
            for (var key in calEvent) {
                $scope.partial_subevent[key] = calEvent[key]
            }
            show_subevent();
        }

        var on_event_change = function (event, delta, revertFunc, jsEvent, ui, view) {
            if (event.partial) { //update the partial event 
                $scope.partial_subevent.start_time = event_monitor.moment_no_convert(event.start);
                $scope.partial_subevent.end_time = event_monitor.moment_no_convert(event.end);
            } else {
                console.log(event.start.format());
                event.start_time = event_monitor.moment_no_convert(event.start);
                event.end_time = event_monitor.moment_no_convert(event.end);
                UpdateSubEvent(event);
            }
        };

        //var on_event_resize = function (event, delta, revertFunc, jsEvent, ui, view) {
        //    if (event.partial) { //update the partial event 
        //        $scope.partial_subevent.start_time = event_monitor.moment(event.start.format('LLL'));
        //        $scope.partial_subevent.end_time = event_monitor.moment(event.end.format('LLL'));
        //    } else {
        //        event.start_time = event_monitor.moment(event.start.format('LLL'));
        //        event.end_time = event_monitor.moment(event.end.format('LLL'));
        //        UpdateSubEvent(event);
        //    }
        //};

        function on_view_change(view, element) {
            event_monitor.ConfigureTimetable();
            refresh_calendar();
        }

        $scope.cancel_subevent_editing = function () {
            //enable_all_events();
            $scope.editing_subevent = false;
            $scope.partial_subevent.start_time = null;
            $scope.partial_subevent.end_time = null;
            $scope.partial_subevent.name = null;
            $scope.partial_subevent.description = null;
            $scope.partial_subevent.location = null;
            $scope.data.Event.event_sources_arr[1].events.splice(0, 1);
            refresh_calendar();
        }

        $scope.save_subevent = function () {
            //enable_all_events();
            if ($scope.partial_subevent.id) {
                var event = $scope.partial_subevent;
                event.title = event.name;

                //We need to use the setters here because we are directly manipulating the FullCalendar FCMoment object
                //which is an augmented version of moment, and is something we do not have access to!
                var s = event_monitor.moment($scope.partial_subevent.start_time); //.zone(moment().zone());
                $scope.partial_subevent.start.set({
                    year: s.get('year'),
                    month: s.get('month'),
                    date: s.get('date'),
                    hour: s.get('hour'),
                    minute: s.get('minute')
                });
                var e = event_monitor.moment($scope.partial_subevent.end_time); //.zone(moment().zone());
                $scope.partial_subevent.end.set({
                    year: e.get('year'),
                    month: e.get('month'),
                    date: e.get('date'),
                    hour: e.get('hour'),
                    minute: e.get('minute')
                });
                return UpdateSubEvent($scope.partial_subevent);
            } else {
                return $q(function (resolve, reject) {
                    var promise = NotifstaHttp.CreateSubEvent($scope.data.Event, $scope.partial_subevent);
                    promise.success(function (ev) {
                        if (ev.status == 'success') {
                            $scope.data.Event.event_sources_arr[1].events.splice(0, 1);
                            event_monitor.AddSubEvent(ev.data);
                            refresh_calendar();
                            toaster.pop('success', 'Successfuly added new event');
                            $scope.partial_subevent.start_time = null;
                            $scope.partial_subevent.end_time = null;
                            $scope.partial_subevent.name = null;
                            $scope.partial_subevent.description = null;
                            $scope.partial_subevent.location = null;
                            $scope.editing_subevent = false;
                            resolve();
                        } else {
                            console.log(ev);
                            toaster.pop('error', ev.error);
                            console.log($scope.partial_subevent);
                            reject();
                        }
                    });

                })
            }
        }

        $scope.delete_subevent = function () {
            return $q(function (resolve, reject) {
                var promise = NotifstaHttp.DeleteSubEvent($scope.data.Event, $scope.partial_subevent);
                promise.success(function (ev) {
                    if (ev.status == 'success') {
                        event_monitor.RemoveSubEvent($scope.partial_subevent.id);
                        refresh_calendar();
                        toaster.pop('success', 'Successfuly deleted event');
                        $scope.partial_subevent.start_time = null;
                        $scope.partial_subevent.end_time = null;
                        $scope.partial_subevent.name = null;
                        $scope.partial_subevent.description = null;
                        $scope.partial_subevent.location = null;
                        $scope.editing_subevent = false;
                        resolve();
                    } else {
                        console.log(ev);
                        toaster.pop('error', ev.error);
                        console.log($scope.partial_subevent);
                        reject();
                    }
                });
            })
        }

        function refresh_calendar() {
            uiCalendarConfig.calendars.timetable_c.fullCalendar('refetchEvents');
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
        $scope.event_monitor = event_monitor;

    }]);
})();
