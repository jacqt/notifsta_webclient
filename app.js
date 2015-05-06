var app = angular.module('notifsta', [
  'notifsta.services',
  'notifsta.directives',
  'notifsta.controllers',
  'ngRoute',
  'ngAnimate',
  'chart.js',
  'facebook',
  'xeditable',
  'uiGmapgoogle-maps',
  'ngFileUpload',
  'toaster',
  'ngMaterial',
  'ui.calendar',
  'ui.bootstrap.datetimepicker',
]);
app.run(['editableOptions', 'editableThemes', function(editableOptions, editableThemes) {
  editableThemes['angular-material'] = {
    formTpl:      '<form class="editable-wrap"></form>',
    noformTpl:    '<span class="editable-wrap"></span>',
    controlsTpl:  '<md-input-container placeholder="asdf" class="editable-controls" ng-class="{\'md-input-invalid\': $error}"></md-input-container>',
    inputTpl:     '',
    errorTpl:     '<div ng-messages="{message: $error}"><div class="editable-error" ng-message="message">{{$error}}</div></div>',
    buttonsTpl:   '<span class="editable-buttons"></span>',
    submitTpl:    '<md-button type="submit" class="md-primary">save</md-button>',
    cancelTpl:    '<md-button type="button" class="md-warn" ng-click="$form.$cancel()">cancel</md-button>'
  };

  editableOptions.theme = 'bs3';
}]);

app.config(['FacebookProvider', function (FacebookProvider) {
    FacebookProvider.init('1594616400794953');
}]);

app.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://api.notifsta.com/**']);
}])

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.patch = {
        'Content-Type': 'application/json;charset=utf-8'
    }
}])
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider

    // route for the home page
    .when('/', {
        templateUrl: 'app/home/main.html',
        controller: 'HomeCtrl'
    })

    // route for the dashboard
    .when('/dashboard', {
        templateUrl: 'app/dashboard/main.html',
        controller: 'DashboardCtrl'
    })

    // -----------------------------------------------//
    // Normal non-admin users
    //

    // route for normal panel of an event
    .when('/event/:event_name', {
        templateUrl: 'app/event/main.html',
        controller: 'EventCtrl'
    })

    // -----------------------------------------------//
    // Admin users
    //

    // route for admin console of an event
    .when('/event_admin/:event_name', {
        templateUrl: 'app/admin/main.html',
        controller: 'AdminCtrl'
    })

    // route for admin stat panel of an event
    .when('/event_admin/:event_name/:notif_id', {
        templateUrl: 'app/notif_stats/main.html',
        controller: 'NotifStatsCtrl'
    })

    // route for creating events
    .when('/create_event', {
        templateUrl: 'app/create_event/main.html',
        controller: 'CreateEventCtrl'
    })

    // -----------------------------------------------//
    // Everybody

    // route for privacy policy
    .when('/contact', {
        templateUrl: 'app/contact/main.html',
    })
    // route for privacy policy
    .when('/privacy', {
        templateUrl: 'app/privacy/main.html',
    })

    // route for logging in
    .when('/login', {
        templateUrl: 'app/login/main.html',
        controller: 'LoginCtrl'
    })

    // route for the sign up page
    .when('/signup', {
        templateUrl: 'app/signup/main.html',
        controller: 'SignupCtrl'
    })


    // route for logging out
    .when('/logout', {
        templateUrl: 'app/logout/main.html',
        controller: 'LogoutCtrl'
    })
}])


//Make sure that we're logged in when making route change
app.run(['$rootScope', '$location', 'AuthService', function ($rootScope, $location, AuthService) {
    OKAY_URLS = ['/contact', '/', '/login', '', '/signup', '/privacy']
    function IsRestricted(url) {
        var splitted = url.split('#');
        if (splitted.length > 1) {
            url_hash = splitted[1];
            for (var i = 0; i != OKAY_URLS.length; ++i) {
                if (url_hash == OKAY_URLS[i]) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    // register listener to watch route changes
    $rootScope.$on("$locationChangeStart", function (event, next, current) {
        var splitted = next.split('#');
        if (!AuthService.GetCredentials().logged_in) {
            // no logged user, we should be going to #login if we're going to a
            // restricted url
            if (IsRestricted(next)) {
                $location.path("/login");
                // redirect to login
            } else {
                // OK url, no redirect needed
                // Check if we're going to the login page
            }
            if (splitted[1] == '/') {
                $(".navbar").removeClass("fus-navbar-solid");
            } else {
                $(".navbar").addClass("fus-navbar-solid");
            }
        } else {
            var h = splitted[1].split('/');
            if (h.length > 1 && h[1] == 'event_admin' || h[1] == 'event') {
                $(".navbar").removeClass("fus-navbar-solid");
            } else {
                $(".navbar").addClass("fus-navbar-solid");
            }
            if (splitted.length > 1) {
                url_hash = splitted[1];
                if (url_hash == '/login' || url_hash == '/sign_up' || url_hash == '/') {
                    $location.path('/dashboard');
                }
            }
        }
    });
}]);


// For animatig slide up and slide downs
app.animation('.slide', function () {
    var NG_HIDE_CLASS = 'ng-hide';
    return {
        beforeAddClass: function (element, className, done) {
            if (className === NG_HIDE_CLASS) {
                element.slideUp(done);
            }
        },
        removeClass: function (element, className, done) {
            if (className === NG_HIDE_CLASS) {
                element.hide().slideDown(done);
            }
        }
    }
});
app.animation('.fade-view', function () {
    return {
        enter: function (element, done) {
            if (window.location.hash == '#/login') {
                done();
                return;
            }
            if (window.location.hash == '#/dashboard') { //slide up if it's the dashboard for WOW factor
                jQuery(element).css({
                    'z-index': 101,
                    'margin-top': 600,
                    width: '100%',
                    opacity: 0
                });
                jQuery(element).animate({
                    'margin-top': 60,
                    opacity: 1
                }, done);
            } else { //just fade in
                jQuery(element).css({
                    'z-index': 101,
                    width: '100%',
                    opacity: 0
                });
                jQuery(element).animate({
                    opacity: 1
                }, done);
            }
        },

        leave: function (element, done) {
            jQuery(element).css({
                position: 'absolute',
                width: '100%',
                opacity: 1,
                'z-index': 100,
            });
            jQuery(element).animate({
                opacity: 0
            }, done);
        }
    };
});

angular.module('notifsta.directives', []);

angular.module('notifsta.services', ['ngCookies']);

angular.module('notifsta.controllers', ['notifsta.services', 'ngCookies', 'ngFileUpload']);

angular.module('notifsta.controllers').controller('MainController',
  ['$scope', 'ImcService', 'NotifstaHttp', 'AuthService',
    function ($scope, ImcService, NotifstaHttp, AuthService, attrs) {
        $scope.on_homepage = function () {
            if (AuthService.GetCredentials().logged_in) {
                return false;
            } else {
                return (window.location.hash == '#/');
            }
        }
        $scope.data = {};
        $scope.selected_event = null;
        $scope.LoggedIn = function () {
            return AuthService.GetCredentials().logged_in;
        }

        $scope.GetEventUrl = function (event_name) {
            return '#/event_admin/event_name'
        }

        function UpdateUser() {
            if ($scope.LoggedIn()) {
                var promise = NotifstaHttp.GetUser();
                promise.success(function (result) {
                    if (result.status == "success") {
                        $scope.data.user = result.data;
                        $scope.selected_event = $scope.selected_event || $scope.data.user.events[0];
                        for (var i = 0; i != $scope.data.user.subscriptions.length; ++i) {
                            var sub = $scope.data.user.subscriptions[i];
                            for (var j = 0; j != $scope.data.user.events.length; ++j) {
                                var event = $scope.data.user.events[j];
                                if (sub.event_id == event.id) {
                                    event.admin = sub.admin;
                                }
                            }
                        }
                    } else {
                        //User auth information out of date
                        window.location = '#logout';

                    }
                    console.log(result.data);
                });
                promise.error(function () {
                    window.location = '#logout';
                });
            }
        }

        //Try to get the user
        UpdateUser();

        ImcService.AddHandler('user state changed', function () {
            UpdateUser();
        });
    }]);

// See the Configuring section to configure credentials in the SDK
AWS.config.update({ accessKeyId: 'AKIAIUGS47BYJKF524RQ', secretAccessKey: 'rwQKmnpjrrcxVC8DHGMP33pggqfLhLCMRozwSVgI' });
// Configure your region
AWS.config.region = 'us-east-1';
