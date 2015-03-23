var app = angular.module('notifsta', [
    'notifsta.controllers',
    'notifsta.services',
    'ngRoute'
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

        // route for admin console of an event
        .when('/event_admin/:event_name', {
            templateUrl: 'app/admin/main.html',
            controller: 'AdminCtrl'
        })

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
                } else {
                    throw "Unexpected error in retrieving user data"
                }
            })
        }

        if ($scope.LoggedIn){
            UpdateUser();
        }

        ImcService.AddHandler('user state changed', function(){
            UpdateUser();
        });
    }]);
