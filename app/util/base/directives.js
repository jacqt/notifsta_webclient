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
                old_value: moment()
            };
            scope.date = null;
            scope.hh_mm = moment('2015-01-01 00:00');
            function convert_to_date() {
                if (!scope.date) {
                    return null;
                }
                var day = moment(scope.date);
                var hh_mm = moment(scope.hh_mm);
                var dur = moment.duration({ hour: hh_mm.get('hour'), minute: hh_mm.get('minute') });
                var real_time = day.add(dur);
                return real_time.clone().toDate();
            }

            function convert_from_moment(real_time) {
                if (!real_time) {
                    return;
                }
                real_time = moment(real_time);
                var day = real_time.clone();
                day.set({
                    hour: 0,
                    minute: 0,
                    second: 0
                });

                var hh_mm = real_time.clone();
                hh_mm.set({
                    year: 1,
                    month: 1,
                    date: 1,
                });
                scope.date = day.clone().toDate();
                scope.hh_mm = hh_mm.clone().toDate();
                scope.datepicker.old_value = moment(convert_to_date());
            }
            scope.$watch(attrs.ngModel, function (v) {
                console.log('value changed, new value is: ' + v);
                if (!v) {
                    return;
                }
                if (!v.utc) {
                    v = moment(v);
                }
                if (!scope.datepicker.old_value || v.valueOf() != scope.datepicker.old_value.valueOf()) {
                    console.log(scope.datepicker.old_value.valueOf())
                    console.log(v.valueOf())
                    convert_from_moment(v);
                }
            });

            scope.$watch('date', function (v) {
                update();
            });

            function update() {
                console.log('updating');
                var refs = attrs.ngModel.split('.');
                var obj = scope;
                for (var i = 0; i != refs.length-1; ++i) {
                    obj = scope[refs[i]]
                }
                var new_val = moment(convert_to_date());
                var last_ref = refs[refs.length - 1];
                if (new_val && new_val.isValid()) {
                    if(obj[last_ref]){
                        if (new_val.utc() != moment(obj[last_ref]).utc()) {
                            obj[last_ref] = new_val.clone().toDate();
                            scope.datepicker.old_value = new_val.clone();
                        }
                    } else {
                        obj[last_ref] = new_val.clone().toDate();
                        scope.datepicker.old_value = new_val.clone();
                    }
                }
            }

            scope.open = function (ev) {
                scope.datepicker.opened = !scope.datepicker.opened;
                ev.stopPropagation();
            }


            scope.$watch('hh_mm', function (v) {
                update();
            });

        },
        template: '<input type="text" datepicker-popup="MMMM dd, yyyy" clear-text="Clear" ng-required="true" is-open="datepicker.opened" class="form-control datepicker" ng-model="date"/>' +
              '<span class="input-group-btn">' +
                '<button type="button" class="btn btn-default" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button>'+
              '</span><timepicker class="mytime" ng-model="hh_mm" ng-change="changed()" arrowkeys="false" show-meridian="false"></timepicker>',
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