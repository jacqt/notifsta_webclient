var app = angular.module('notifsta', [
  'notifsta.controllers',
  'notifsta.services',
  'ngRoute',
  'ngAnimate',
  'chart.js',
  'facebook',
  'xeditable',
  'uiGmapgoogle-maps',
  'ngFileUpload',
  'toaster',
  'ui.calendar',
  'ui.bootstrap.datetimepicker',
]);

app.run(['editableOptions', function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
}]);

app.config(['FacebookProvider', function(FacebookProvider){
  FacebookProvider.init('1594616400794953');
}]);

app.config(['$sceDelegateProvider', function($sceDelegateProvider) {
     $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://api.notifsta.com/**']);
 }])

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.patch = {
        'Content-Type': 'application/json;charset=utf-8'
    }
}])
app.config(['$routeProvider', function($routeProvider){
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
app.run(['$rootScope', '$location', 'AuthService', function($rootScope, $location, AuthService){
  OKAY_URLS = ['/contact', '/', '/login', '', '/signup']
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
    if (!AuthService.GetCredentials().logged_in) {
      // no logged user, we should be going to #login if we're going to a
      // restricted url
      if (IsRestricted(next)) {
        $location.path( "/login" );
        // redirect to login
      } else {
        // OK url, no redirect needed
        // Check if we're going to the login page
      }

    } else {
      var splitted = next.split('#');
      if (splitted.length > 1){
        url_hash = splitted[1];
        if (url_hash == '/login' || url_hash == '/sign_up' || url_hash == '/'){
          $location.path('/dashboard');
        }
      }
    }
  });
}]);


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
app.animation('.fade-view', function() {
  return {
    enter : function(element, done) {
      console.log(window.location);
      if (window.location.hash == '#/login'){
        done();
        return;
      } 
      if (window.location.hash =='#/dashboard'){ //slide up if it's the dashboard for WOW factor
        jQuery(element).css({
          'z-index':101,
          'margin-top':600,
          width: '100%',
          opacity:0
        });
        jQuery(element).animate({
          'margin-top': 0,
          opacity:1
        }, done);
      } else { //just fade in
        jQuery(element).css({
          'z-index':101,
          width: '100%',
          opacity:0
        });
        jQuery(element).animate({
          opacity:1
        }, done);
      }
    },

    leave : function(element, done) {
      jQuery(element).css({
        position:'absolute',
        width: '100%',
        opacity:1,
        'z-index':100,
      });
      jQuery(element).animate({
        opacity:0
      }, done);
    }
  };
});   

//For autofocus TODO: move outside of app.js file
app.directive('focusMe', ['$timeout', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusMe, function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus();
            scope[attrs.focusMe] = false;
          });
        }
      });
    }
  };
}]);


app.directive('googlePlaces', function(){
  return {
    restrict:'E',
    replace:true,
    // transclude:true,
    scope: {location:'='},
    template: '<input id="google_places_ac" name="google_places_ac" type="text" class="input-block-level"/>',
    link: function($scope, elm, attrs){
      var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
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
      $scope.selected_event = null;
      $scope.LoggedIn = function(){
        return AuthService.GetCredentials().logged_in;
      }

      $scope.GetEventUrl = function(event_name){
        return '#/event_admin/event_name'
      }

      function UpdateUser(){
        if ($scope.LoggedIn()){
          var promise = NotifstaHttp.GetUser();
          promise.success(function(result){
            if (result.status == "success" ){
              $scope.data.user = result.data;
              $scope.selected_event = $scope.selected_event || $scope.data.user.events[0];
              for (var i = 0; i != $scope.data.user.subscriptions.length; ++i){
                var sub = $scope.data.user.subscriptions[i];
                for (var j = 0; j != $scope.data.user.events.length; ++j){
                  var event = $scope.data.user.events[j];
                  if (sub.event_id == event.id){
                    event.admin = sub.admin;
                  }
                }
              }
            } else {
              //User auth information out of date
              window.location = '#logout';
            }
          });
          promise.error(function(){
            window.location = '#logout';
          });
        }
      }

      //Try to get the user
      UpdateUser();

      ImcService.AddHandler('user state changed', function(){
        UpdateUser();
      });
    }]);

// See the Configuring section to configure credentials in the SDK
AWS.config.update({accessKeyId: 'AKIAIUGS47BYJKF524RQ', secretAccessKey: 'rwQKmnpjrrcxVC8DHGMP33pggqfLhLCMRozwSVgI'});
// Configure your region
AWS.config.region = 'us-east-1';
