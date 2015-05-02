/// <reference path="service.js"/>
/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 *
 */


(function () {
    angular.module('notifsta.controllers').controller('AdminCtrl',
        ['$scope', 'NotifstaHttp', 'EventMonitor', '$cookies', '$timeout', '$routeParams', 'toaster', 'ImcService', '$compile',
    function ctrl($scope, NotifstaHttp, EventMonitor, $cookies, $timeout, $routeParams, toaster, ImcService, $compile) {
        //TESTING PURPOSES ONLY
        //var p = NotifstaHttp.LoginEvent('event1', 'asdfasdf');
        $scope.event = {
            name: $routeParams.event_name,
            id: $routeParams.event_id
        }
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
        $scope.sending_survey = false;

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
            var promise = NotifstaHttp.PublishEventUpdate($scope.data.Event);
            promise.success(function (e) {
                if (e.status == 'success') {
                    toaster.pop('success', 'Successfuly updated event');
                } else {
                    toaster.pop('error', e.error);
                }

            });
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
                if (data) {
                    $scope.data.Event.cover_photo_url = data.Location;
                    $scope.cover_photo_editor.$hide();
                    $scope.publish_updates();
                }
            });
        });

        $scope.$watch('event_map_files', function () {
            $scope.upload($scope.event_map_files, function (data) {
                if (data) {
                    $scope.data.Event.event_map_url = data.Location;
                    $scope.event_map_editor.$hide();
                    $scope.publish_updates();
                }
            });
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
            }
        };

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
            if ($scope.sending_survey) {
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


        $scope.selected_none = function () {
            return $scope.data.Event.channels.filter(function (e) { return e.selected }).length == 0;
        }

        $scope.data = event_monitor._data;
        $scope.GetNotifResponses = event_monitor.GetNotifResponses;

        /* GOOGLE MAPS */
        $scope.options = { scrollwheel: false };
        var events = {
            places_changed: function (searchBox) {
                var places = searchBox.getPlaces();
                if (places.length > 0) {
                    var place = places[0];
                    var lat = place.geometry.location.lat();
                    var lng = place.geometry.location.lng();
                    $scope.data.Event.map.center.latitude = lat;
                    $scope.data.Event.map.center.longitude = lng;
                    $scope.data.Event.map.zoom = 15;
                    $scope.data.Event.marker.coords.latitude = lat;
                    $scope.data.Event.marker.coords.longitude = lng;
                    $scope.data.Event.address = place.name + ', ' + place.formatted_address;
                    $scope.publish_updates();
                }
            }
        }
        $scope.searchbox = { template: 'searchbox.tpl.html', events: events };


        //CALENDAR
        $scope.calendar_editable = true;
        function disable_all_events() {
            $scope.calendar_editable = false;
            $scope.data.Event.event_sources.map(function (event_source) {
                event_source.events.map(function (event) {
                    event.editable = false;
                })
            })
        }
        function enable_all_events() {
            $scope.calendar_editable = true;
            $scope.data.Event.event_sources.map(function (event_source) {
                event_source.events.map(function (event) {
                    event.editable = true;
                })
            })
        }

        if ($scope.data.Event.event_sources.length < 2) {
            $scope.data.Event.event_sources = [{
                events: [],
                color: 'darkorange',   // an option!
                textColor: 'white' // an option!
            }, {
                events: [],
                color: 'white',
                textColor: 'black',
                borderColor: 'orange'
            }]
        }

        function UpdateSubEvent(changed_event) {
            console.log(changed_event);
            changed_event.start_time = moment(changed_event.start).format('LLL');
            changed_event.end_time = moment(changed_event.end).format('LLL');
            var promise = NotifstaHttp.PublishSubEventUpdate($scope.data.Event, changed_event);
            promise.success(function (e) {
                if (e.status == 'success') {
                    toaster.pop('success', 'Successfuly updated timetable');
                } else {
                    console.log(e);
                    toaster.pop('error', e.error);
                }
            });
        }

        $scope.event_editor_popup = {
            posX: 0,
        }
        $scope.timetable_clicked = function (ev) {
            if (!$scope.calendar_editable) return;
            console.log(ev);
            var CALENDAR_LEFT_LABEL_WIDTH = 53;
            var w = $('.fc-col0').width();
            var x_offset = $('.fc-col0').offset().left;
            var x_rel = ev.pageX - x_offset;
            var x_rel = Math.floor(x_rel / w) * w;
            console.log(x_rel);
            if (x_rel - 350 > 0) {
                $scope.event_editor_popup.posX = x_rel - 400 - 20  + CALENDAR_LEFT_LABEL_WIDTH;
            } else {
                $scope.event_editor_popup.posX = x_rel + w + 20 + CALENDAR_LEFT_LABEL_WIDTH;
            }
            console.log(ev.pageY);
            console.log($('.fc-header').offset().top);
            $scope.event_editor_popup.posY =  ev.pageY - $('.fc-header').offset().top - 670;
        }


        $scope.on_day_click = function (date, jsEvent, view) {
            if (!$scope.calendar_editable) return;
            $scope.partial_subevent = {
                name: null,
                description: null,
                start_time: moment(date).format('LLL'),
                location: null
            }
            $scope.data.Event.event_sources[1].events.push({
                title: '',
                start: $scope.partial_subevent.start_time,
                allDay: false
            });

            $scope.show_subevent();
        };

        $scope.show_subevent = function () {
            setTimeout(function () {
                $scope.editing_subevent = true;
                disable_all_events();
            }, 100);
            $scope.subevent_editor.$show();
        }
        $scope.on_event_click = function (calEvent, jsEvent, view) {
            if (!$scope.calendar_editable) return;
            $scope.partial_subevent = calEvent;
            $scope.show_subevent();
        }

        $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
            if (!$scope.calendar_editable) return;
            event.end_time = event.end;
            console.log('droppin');
            UpdateSubEvent(event);
        };

        $scope.on_event_resize = function (event, delta, revertFunc, jsEvent, ui, view) {
            if (!$scope.calendar_editable) return;
            UpdateSubEvent(event);
        };

        $scope.cancel_subevent_editing = function () {
            enable_all_events();
            $scope.editing_subevent = false;
            $scope.data.Event.event_sources[1].events.splice(0, 1);
        }

        $scope.save_subevent = function () {
            enable_all_events();
            if ($scope.partial_subevent.id) {
                var event = $scope.partial_subevent;
                event.title = event.name + ' - ' + event.description;
                UpdateSubEvent($scope.partial_subevent);
                $scope.partial_subevent = null;
                $scope.editing_subevent = false;
            } else {
                var promise = NotifstaHttp.CreateSubEvent($scope.data.Event, $scope.partial_subevent);
                promise.success(function (ev) {
                    if (ev.status == 'success') {
                        var new_event = ev.data;
                        new_event.title = ev.data.name + ' - ' + ev.data.description;
                        new_event.start = moment(new_event.start_time).format('LLL');
                        new_event.end = moment(new_event.end_time).format('LLL');
                        new_event.allDay = false;
                        $scope.data.Event.event_sources[0].events.push(new_event);
                        toaster.pop('success', 'Successfuly added new event');
                        $scope.partial_subevent = null;
                        $scope.editing_subevent = false;
                        $scope.data.Event.event_sources[1].events.splice(0, 1);
                    } else {
                        console.log(ev);
                        toaster.pop('error', ev.error);
                    }
                });
            }
        }

        ImcService.AddHandler('event_loaded ' + $scope.event.id, function (data) {
            $scope.timetable_c.fullCalendar('gotoDate', new Date($scope.data.Event.start_time));
        });

        if ($scope.data.Event.start_time) {
            setTimeout(function () {
                $scope.timetable_c.fullCalendar('gotoDate', new Date($scope.data.Event.start_time));
            }, 100);
        }

        $scope.data.Event.uiConfig = {
            calendar: {
                height: 650,
                editable: true,
                defaultView: 'agendaWeek',
                header: {
                    left: 'month agendaWeek agendaDay',
                    center: 'title',
                    right: 'today prev,next'
                },
                snapMinutes: 10,
                dayClick: $scope.on_day_click,
                eventClick: $scope.on_event_click,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.on_event_resize
            }
        }

        $scope.editing_subevent = false;

    }]);
})();
