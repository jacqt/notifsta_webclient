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

            MY_TZ_FORM = 'YYYY-MM-DD HH:mm:ss Z';


            // time string must be informat yyyy-mm-dd hh:mm 
            function DateTimeModel(timeString) {
                // TODO add a regexp to validate the timeString input
                if (!timeString) {
                    this.model = {};
                } else {
                    this.model = {
                        valid: true,
                        second: 0,
                        minute: timeString.substring(14,16),
                        hour: timeString.substring(11,13),
                        day: timeString.substring(8,10),
                        month: timeString.substring(5,7),
                        year: timeString.substring(0,4)
                    }
                }
                this.onChangeCallback = function () { };
            }

            DateTimeModel.prototype.getDate = function() {
                if (!this.model.valid) {
                    return null;
                }
                var tstring = [
                    this.model.year,
                    this.model.month,
                    this.model.day
                ].join('-') + 'T00:00:00';
                var t = moment(tstring);
                tstring += t.format('Z');
                console.log(tstring);
                return moment(tstring, moment.ISO_8601).format();
            }

            DateTimeModel.prototype.getHHMM = function() {
                if (!this.model.valid) {
                    return null;
                }
                var tstring = [
                    this.model.year,
                    this.model.month,
                    this.model.day
                ].join('-') + 'T' + this.model.hour + ':' + this.model.minute + ':00';
                var t = moment(tstring);
                tstring += t.format('Z');
                console.log(this.model, moment(tstring, moment.ISO_8601));
                return moment(tstring, moment.ISO_8601)
            }

            // other must be an instance of DateTimeModel
            DateTimeModel.prototype.equals = function (other) {
                if (!this.model.valid) {
                    return false;
                }
                for (var key in this.model) {
                    if (this.model.hasOwnProperty(key)) {
                        if (this.model[key] != other.model[key]) {
                            console.log(this.model[key, other.model[key]]);
                            return false
                        }
                    }
                }
                return true;
            }

            // other must be an instance of DateTimeModel
            DateTimeModel.prototype.updateWith = function (other) {
                for (var key in other.model) {
                    if (other.model.hasOwnProperty(key)) {
                        this.model[key] = other.model[key];
                    }
                }
                this.model.valid = true;
                this.onChangeCallback();
            }

            // tz must be in the format '+hh:mm'
            DateTimeModel.prototype.getMomentObjTz = function (tzName) {
                // TODO add a regexp to validate the tz input
                var tz = moment
                var tstring = [
                    this.model.year,
                    this.model.month,
                    this.model.day
                ].join('-') + ' ' + this.model.hour + ':' + this.model.minute + ':00';
                console.log(tstring, moment.tz(tstring, moment.ISO_8601, tzName).format(), tzName);
                return moment.tz(tstring, moment.ISO_8601, tzName);
            }


            scope.current_model = new DateTimeModel(null);
            scope.current_model.onChangeCallback = function () {
                scope.date = scope.current_model.getDate();
                scope.hh_mm = scope.current_model.getHHMM();
            }
            scope.date = null;
            scope.current_model.onChangeCallback();
            scope.hh_mm = moment('2015-01-01 00:00');

            var _temp = moment().format();
            var local_timezone = _temp.substring(_temp.length - 6, _temp.length);

            function StripTimezone(moment_obj) {
                if (moment_obj) {
                    return moment_obj.format().substring(0, moment_obj.format().length-6);
                }
                return null;
            }

            function update() {
                if (!scope.date || !scope.hh_mm) {
                    var new_val = null;
                } else {
                    var date = moment(scope.date);
                    var hh_mm = moment(scope.hh_mm);
                    scope.current_model.model.year = date.format('YYYY');
                    scope.current_model.model.month = date.format('MM');
                    scope.current_model.model.day = date.format('DD');
                    scope.current_model.model.hour = hh_mm.format('HH');
                    scope.current_model.model.minute = hh_mm.format('mm');

                    var new_val = scope.current_model.getMomentObjTz(scope.tzName);
                }
                if (new_val && new_val.isValid()) {
                    var refs = attrs.ngModel.split('.');
                    var obj = scope;
                    for (var i = 0; i != refs.length-1; ++i) {
                        obj = obj[refs[i]]
                    }
                    var last_ref = refs[refs.length - 1];
                    obj[last_ref] = new_val;
                }
            }

            scope.$watch(attrs.ngModel, function (v) {
                if (!v) {
                    return;
                }

                var newDTModel = new DateTimeModel(StripTimezone(moment(v)));

                if (!scope.current_model.equals(newDTModel)) {
                    console.log(scope.current_model.model, newDTModel.model);
                    scope.current_model.updateWith(newDTModel);
                }
            });

            scope.$watch(attrs.minDate, function (v) {
                if (!v) {
                    return;
                }
                scope.minDate = v;
            });

            scope.timezone_offset = function (m) {
                var tzName;
                if (scope.tzName) {
                    tzName = scope.tzName
                    return m.tz(tzName).format('Z')
                } else {
                    return m.format('Z')
                }
            };

            scope.$watch(attrs.tzName, function (tzName) {
                if (!tzName) {
                    return;
                }
                scope.tzName = tzName;
                scope.timezone_name = tzName;
                scope.tz_abbrv = moment().tz(tzName).format('z');
                update();
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


            scope.open = function (ev) {
                scope.datepicker.opened = !scope.datepicker.opened;
                ev.stopPropagation();
            }
        },
        template: '<input ng-click="datepicker.opened = true" ' +
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