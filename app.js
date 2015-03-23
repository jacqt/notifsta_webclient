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
        .when('/event_admin', {
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
    OKAY_URLS = ['/contact', '/', '/login']
    function IsRestricted(url){
        var url_hash = url.split('#')[1];
        console.log(url_hash);
        for (var i = 0; i != OKAY_URLS.length; ++i){
            if (url_hash == OKAY_URLS[i]){
                return false;
            }
        }
        return true;
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
    ['$scope', 'NotifstaHttp', 'AuthService',  function($scope, NotifstaHttp, AuthService, attrs) {
        $scope.LoggedIn = function(){
            return AuthService.GetCredentials().logged_in;
        }

        if ($scope.LoggedIn){
            NotifstaHttp.GetUser();
        }
    }]);
