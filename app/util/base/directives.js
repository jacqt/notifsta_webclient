var app = angular.module('notifsta.directives');


app.directive("ngTouchStart", [function () {
    return function (scope, elem, attrs) {
        elem.bind("touchstart click", function (e) {
            scope.$apply(attrs["ngTouchStart"]);
        });
    }
}])


app.directive("ngTouchEnd", [function () {
    return function (scope, elem, attrs) {
        elem.bind("touchend", function (e) {
            scope.$apply(attrs["ngTouchEnd"]);
        });
    }
}])
app.directive('combinedtpicker', [function () {

    return {
        restrict: 'A',
        require: '^ngModel',
        scope: true,
        link: function(scope, element, attrs){
            scope.datepicker = {
                opened: false,
            };
            scope.date = null;
            scope.hh_mm = moment('2015-01-01 00:00');

            var _temp = moment().format();
            var local_timezone = _temp.substring(_temp.length - 6, _temp.length);

            function ConvertToLocal(moment_obj){
                var stripped_time_string = StripTimezone(moment_obj);
                local_time_string = stripped_time_string + local_timezone;
                var m = moment(local_time_string);
                m.set({ 'second': 0 });
                return m;
            }

            function ConvertToOrigTz(moment_obj) {
                if (scope.timezone_offset) {
                    var stripped_time_string = StripTimezone(moment_obj);
                    orig_time_string = stripped_time_string + scope.timezone_offset;
                    var m = moment(orig_time_string, moment.ISO8061).tz(scope.timezone_name);
                    m.set({ 'second': 0 });
                    return m
                } else {
                    return moment_obj;
                }

            }

            function StripTimezone(moment_obj) {
                if (moment_obj) {
                    return moment_obj.format().substring(0, moment_obj.format().length-6);
                }
                return null;
            }

            function MomentsDifferent(moment1, moment2) {
                if (moment1 == moment2) {
                    return false;
                } else {
                    if (moment1 == null || moment2 == null) {
                        return true;
                    }
                    return moment1.format() !== moment2.format();
                }
            }

            function SetDate(moment_obj) {
                scope.moment_obj = moment_obj;
                scope.date = scope.moment_obj.format();
                scope.hh_mm = scope.moment_obj.format();
            }

            function MergeDateHHMM(date, hh_mm) {
                var m1 = moment(date);
                var m2 = moment(hh_mm);
                m1.set({
                    hour: 0,
                    minute: 0,
                    second: 0
                });
                var dur = moment.duration({ hour: m2.get('hour'), minute: m2.get('minute') });
                return m1.add(dur);
            }


            function update() {
                var refs = attrs.ngModel.split('.');
                var obj = scope;
                for (var i = 0; i != refs.length-1; ++i) {
                    obj = obj[refs[i]]
                }
                var last_ref = refs[refs.length - 1];

                scope.moment_obj = MergeDateHHMM(scope.date, scope.hh_mm);
                var new_val = ConvertToOrigTz(scope.moment_obj);
                if (new_val && new_val.isValid()) {
                    obj[last_ref] = new_val;
                }
            }

            scope.$watch(attrs.ngModel, function (v) {
                if (!v || ! v.utc) {
                    return;
                }
                var new_date = ConvertToLocal(v);
                if (MomentsDifferent(scope.moment_obj, new_date)){
                    SetDate(new_date);
                }
            });

            scope.$watch(attrs.minDate, function (v) {
                if (!v) {
                    return;
                }
                scope.minDate = v;
            });
            scope.$watch(attrs.tzName, function (tzName) {
                if (!tzName) {
                    return;
                }
                scope.timezone_name = tzName;
                scope.timezone_offset = moment().tz(tzName).format('Z');
                scope.tz_abbrv        = moment().tz(tzName).format('z');
            });
            scope.$watch(attrs.placeholder, function (v) {
                if (!v) {
                    return;
                }
                scope.datepicker.placeholder = v;
            });

            scope.$watch('date', function (v) {
                update();
            });
            scope.$watch('hh_mm', function (v) {
                update();
            });





            function getClone( moment_obj) {
                if (scope.timezone_offset) {
                    return moment_obj.clone().tz(scope.timezone_offset);
                } else {
                    return moment_obj.clone()
                }
            }

            scope.open = function (ev) {
                scope.datepicker.opened = !scope.datepicker.opened;
                ev.stopPropagation();
            }
        },
        template: '<input ng-focus="datepicker.opened = true" ' +
                         'placeholder="{{datepicker.placeholder}}" type="text" min-date="minDate" ' +
                         'show-weeks="false" is-open="datepicker.opened" show-button-bar="false" ' +
                         'datepicker-popup="MMMM dd, yyyy" clear-text="Clear" ng-required="true" ' +
                         'is-open="datepicker.opened" class="form-control datepicker" ng-model="date"/>' +
                  '<span class="input-group-btn">' +
                        '<button type="button" class="btn btn-default" ng-click="open($event)">' +
                        '<i class="glyphicon glyphicon-calendar"></i></button>' +
                  '</span>' +
                      '<timepicker class="mytime" ng-model="hh_mm" ng-change="changed()" arrowkeys="false" ' +
                                   'show-meridian="false">' +
                  '</timepicker>'+
                  '<span style="margin-left: 5px" layout="column" layout-align="center center"> {{ tz_abbrv }} <span> ',
    }
}])
app.directive('htmlEllipsis', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $timeout(function () {
                angular.element(element).ellipsis();
            }, 0);

        }
    };
}]);

//For autofocus TODO: move outside of app.js file
app.directive('focusMe', ['$timeout', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.focusMe, function (value) {
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                        scope[attrs.focusMe] = false;
                    });
                }
            });
        }
    };
}]);


app.directive('googlePlaces', function () {
    return {
        restrict: 'E',
        replace: true,
        // transclude:true,
        scope: { location: '=' },
        template: '<input id="google_places_ac" name="google_places_ac" type="text" class="input-block-level"/>',
        link: function ($scope, elm, attrs) {
            var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
                $scope.location = place.geometry.location.lat() + ',' + place.geometry.location.lng();
                $scope.$apply();
            });
        }
    }
});

//For ease of ng-enter
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});