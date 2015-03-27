var app = angular.module('notifsta', [
    'notifsta.controllers',
    'notifsta.services',
    'ngRoute',
    'ngAnimate',
    'chart.js'
]);

app.config(function($routeProvider){
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

        // -----------------------------------------------//
        // Everybody

        // route for logging in
        .when('/login', {
            templateUrl: 'app/login/main.html',
            controller: 'LoginCtrl'
        })

        // route for logging out
        .when('/logout', {
            templateUrl: 'app/logout/main.html',
            controller: 'LogoutCtrl'
        })
})


//Make sure that we're logged in when making route change
app.run(function($rootScope, $location, AuthService){
    OKAY_URLS = ['/contact', '/', '/login', '']
    function IsRestricted(url){
        var splitted = url.split('#');
        if (splitted.length > 1){
            url_hash = splitted[1];
            for (var i = 0; i != OKAY_URLS.length; ++i){
                if (url_hash == OKAY_URLS[i]){
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
    // register listener to watch route changes
    $rootScope.$on("$locationChangeStart", function(event, next, current) {
        console.log(next);
        if (!AuthService.GetCredentials().logged_in) {
            // no logged user, we should be going to #login if we're going to a
            // restricted url
            if (IsRestricted(next)) {
                $location.path( "/login" );
                // redirect to login
            } else {
                // OK url, no redirect needed
            }
        }         
    });
})


// For animatig slide up and slide downs
app.animation('.slide', function() {
    var NG_HIDE_CLASS = 'ng-hide';
    return {
        beforeAddClass: function(element, className, done) {
            if(className === NG_HIDE_CLASS) {
                element.slideUp(done);
            }
        },
        removeClass: function(element, className, done) {
            if(className === NG_HIDE_CLASS) {
                element.hide().slideDown(done);
            }
        }
    }
});


//For autofocus TODO: move outside of app.js file
app.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusMe, function(value) {
        if(value === true) { 
          console.log('value=',value);
          $timeout(function() {
            element[0].focus();
            scope[attrs.focusMe] = false;
          });
        }
      });
    }
  };
});

//For ease of ng-enter
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

angular.module('notifsta.services', ['ngCookies']);

angular.module('notifsta.controllers', ['ngCookies']);

angular.module('notifsta').controller('MainController',
    ['$scope', 'ImcService','NotifstaHttp', 'AuthService',  
    function($scope, ImcService, NotifstaHttp, AuthService, attrs) {
        $scope.data = {};
        $scope.LoggedIn = function(){
            return AuthService.GetCredentials().logged_in;
        }

        $scope.GetEventUrl = function(event_name){
            return '#/event_admin/event_name'
        }

        function UpdateUser(){
            var promise = NotifstaHttp.GetUser();
            promise.success(function(result){
                if (result.status == "success"){
                    $scope.data.user = result.data;
                    for (var i = 0; i != $scope.data.user.subscriptions.length; ++i){
                        var sub = $scope.data.user.subscriptions[i];
                        for (var j = 0; j != $scope.data.user.events.length; ++j){
                            var event = $scope.data.user.events[j];
                            if (sub.event_id == event.id){
                                event.admin = sub.admin;
                                console.log(event.admin);
                            }
                        }
                    }
                } else {
                    throw "Unexpected error in retrieving user data"
                }
            })
        }

        //Try to get the user
        UpdateUser();

        ImcService.AddHandler('user state changed', function(){
            UpdateUser();
        });
    }]);
