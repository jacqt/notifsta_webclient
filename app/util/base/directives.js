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
            scope.date = null;
            scope.hh_mm = moment('2015-01-01 00:00');
            function convert_to_moment() {
                if (!scope.date) {
                    return null;
                }
                var day = moment(moment(scope.date).format('LLL'));
                var hh_mm = moment(scope.hh_mm);
                var dur = moment.duration({ hour: hh_mm.get('hour'), minute: hh_mm.get('minute') });
                var real_time = day.add(dur).zone(moment().zone());
                return real_time;
            }

            function convert_from_moment(real_time) {
                if (!real_time) {
                    return;
                }
                console.log(real_time);
                real_time = moment(real_time);
                console.log(real_time);
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
                scope.date = day.toDate();
                scope.hh_mm = hh_mm.toDate();
            }
            scope.$watch(attrs.ngModel, function (v) {
                console.log('value changed, new value is: ' + v);
                if (!v) {
                    return;
                }
                if (!v.utc) {
                    v = moment(v);
                }
                if (!old_value || v.utc() != old_value.utc()) {
                    console.log(v);
                    convert_from_moment(v);
                }
            });
            var old_value = null;

            scope.$watch('date', function (v) {
                update();
            });

            function update() {
                var refs = attrs.ngModel.split('.');
                var obj = scope;
                for (var i = 0; i != refs.length-1; ++i) {
                    obj = scope[refs[i]]
                }
                var new_val = convert_to_moment();
                var last_ref = refs[refs.length - 1];
                if (new_val) {
                    if(obj[refs[last_ref]]){
                        if (new_val.utc() != obj[refs[last_ref]].utc()) {
                            obj[refs[refs.length - 1]] = new_val;
                            old_value = new_val;
                        }
                    } else {
                        obj[refs[refs.length - 1]] = new_val;
                        old_value = new_val;
                    }
                }

            }

            scope.$watch('hh_mm', function (v) {
                update();
            });

        },
        template: '<input type="date" clear-text="Clear" class="form-control datepicker" ng-model="date"/> <timepicker class="mytime" ng-model="hh_mm" ng-change="changed()" arrowkeys="false" show-meridian="false"></timepicker>',

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