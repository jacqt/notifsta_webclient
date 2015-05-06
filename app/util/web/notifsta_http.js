/* Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Library wrapper around Notifsta' HTTP REST Api
 */

(function(){
  angular.module('notifsta.services').service('NotifstaHttp', ['$http', 'AuthService', 'ImcService', service]);
  var BASE_URL = 'http://api.notifsta.com';

  //List of callbacks that required authentication, but
  //the authentication details were not available at call time
  var auth_required_callbacks = [];

  function ProcessCallbackBacklog(){
    auth_required_callbacks.map(function(callback){
      callback();
    });
  }

  function service($http, AuthService, ImcService){
    // ------------------------------------------------------------ //
    // Authorization
    //
    function HandleLoginPromise(promise){
      promise.success(function(e){
        console.log(e.data);
        if (e.data){
          AuthService.SetUserEmail(e.data.email);
          AuthService.SetUserToken(e.data.authentication_token);
          AuthService.SetUserId(e.data.id);
          ImcService.FireEvent('user state changed');
          ProcessCallbackBacklog();
        }
      })
    }

    function Login(email, password){
      var req = {
        url: BASE_URL + '/v1/auth/login',
        method: 'GET',
        params: {
          email: email,
          password: password
        }
      };
      var promise = $http(req);
      HandleLoginPromise(promise);
      return promise;
    }

    function FacebookLogin(email, facebook_id, facebook_token){
      var req = {
        url: BASE_URL + '/v1/auth/facebook',
        method: 'GET',
        params: {
          email: email,
          facebook_id: facebook_id,
          facebook_token: facebook_token
        }
      };
      var promise = $http(req);
      HandleLoginPromise(promise);
      return promise;
    }

    // ------------------------------------------------------------ //
    // API Calls to retrieve information

    function GetEvent(id){
      var req = {
        url: BASE_URL + '/v1/events/'+ id,
        method: 'GET',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token,
        }
      }
      return $http(req);
    }

    function GetUser(){
      var req = {
        url: BASE_URL + '/v1/users/' + AuthService.GetCredentials().user_id,
        method: 'GET',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token,
        }
      };
      console.log(req);
      var promise = $http(req)
      return promise;
    }

    function GetNotifications(id){ 
      var req = {
        url: BASE_URL + '/v1/channels/' + id + '/notifications',
        method: 'GET',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token
        }
      }
      return $http(req);
    }

    function GetNotification(id){
      var req = {
        url: BASE_URL + '/v1/notifications/' + id ,
        method: 'GET',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token
        }
      }
      return $http(req);
    }

    function GetResponses(id){
      var req = {
        url: BASE_URL + '/v1/notifications/' + id  + '/responses',
        method: 'GET',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token
        }
      }
      return $http(req);
    }


    // ------------------------------------------------------------ //
    // API Calls to create objects in the database

    function CreateNotification(message, channel_ids){
      return channel_ids.map(function(channel_id){
        var req = {
          url: BASE_URL + '/v1/channels/' + channel_id + '/notifications',
          method: 'POST',
          params: {
            'user_email': AuthService.GetCredentials().user_email,
            'user_token': AuthService.GetCredentials().user_token,
            'notification[notification_guts]': message,
            'notification[type]': 'Message'
          }
        }
        return $http(req);
      })
    }

    function CreateSurvey(question, options, channel_ids){
      return channel_ids.map(function(channel_id){
        var req = {
          url: BASE_URL + '/v1/channels/' + channel_id + '/notifications',
          method: 'POST',
          params: {
            'user_email': AuthService.GetCredentials().user_email,
            'user_token': AuthService.GetCredentials().user_token,
            'notification[type]': 'Survey',
            'notification[notification_guts]': question,
            'options[]': options
          }
        }
        return $http(req);
      })
    }

    function SubmitResponse(notif_id, option_id){
      var req = {
        url: BASE_URL + '/v1/notifications/' + notif_id + '/responses',
        method: 'POST',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token,
          'option_id': option_id
        }
      }
      return $http(req);
    }

    function CreateUser(user){
      var req = {
        url: BASE_URL + '/v1/auth/register',
        method: 'POST',
        params: {
          'email': user.email,
          'password': user.password
        }
      }
      var promise = $http(req);
      HandleLoginPromise(promise);
      return promise;
    }
    function CreateEvent(event){
      var req = {
        url: BASE_URL + '/v1/events/',
        method: 'POST',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token,
          'event[name]': event.name,
          'event[description]': event.description,
          'event[cover_photo_url]': event.cover_photo_url,
          'event[event_map_url]': event.event_map_url,
          'event[start_time]': moment(event.start_time).utc().toString(),
          'event[end_time]': moment(event.end_time).utc().toString(),
          'event[address]': event.address,
        }
      }
      return $http(req);
    }

    function CreateSubEvent(event, subevent){
      if (!subevent.end_time){
        subevent.end_time = moment(subevent.start_time).add(2, 'hours').format();
      }
      subevent.start_time = moment(subevent.start_time).format();
      console.log(subevent);
      var req = {
        url: BASE_URL + '/v1/events/' + event.id + '/subevents',
        method: 'POST',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token,
          'name': subevent.name,
          'location': subevent.location,
          'description': subevent.description,
          'start_time': moment(subevent.start_time).utc().toString(),
          'end_time': moment(subevent.end_time).utc().toString(),
        }
      }
      return $http(req);
    }

    /* FIXME */
    function CreateChannel(event_id, channel_name){
      throw "CREATE CHANNEL NOT IMPLEMENTED";
      return $http.post('/api/v1/event/channel', {
        name : name
      });
    }

    // ------------------------------------------------------------ //
    // API Calls to edit objects in the database
    function PublishEventUpdate(event){
      var req = {
        url: BASE_URL + '/v1/events/' + event.id,
        method: 'POST',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token,
          'event[name]': event.name,
          'event[description]': event.description,
          'event[cover_photo_url]': event.cover_photo_url,
          'event[event_map_url]': event.event_map_url,
          'event[start_time]': moment(event.start_time).utc().toString(),
          'event[end_time]': moment(event.end_time).utc().toString(),
          'event[address]': event.address
        }
      }
      return $http(req);
    }
    
    function PublishSubEventUpdate(event, subevent){

      var req = {
        url: BASE_URL + '/v1/subevents/' + subevent.id,
        method: 'POST',
        params: {
          'user_email': AuthService.GetCredentials().user_email,
          'user_token': AuthService.GetCredentials().user_token,
          'name': subevent.name,
          'description': subevent.description,
          'start_time': moment(subevent.start_time.toString()).utc().toString(),
          'end_time': moment(subevent.end_time.toString()).utc().toString(),
          'location': subevent.location,
        }
      }
      console.log(req.params);
      return $http(req);
    }

    return {
      //Login:
      // Takes email and password strings
      // Returns the http promise object created
      // Will also alter the credentials object that holds the user 
      // token and user email
      Login: Login,

      //FacebookLogin:
      // Takes a email, facebook id, and a facebook access token
      // and does the same thing as Login
      FacebookLogin: FacebookLogin,

      //CreateEvent - CURRENTLY NOT WORKING
      // Creates an event given an event name
      CreateEvent: CreateEvent,

      //CreateChannel - CURRENTLY NOT WORKING
      // Creates a channel given an event id and channel name
      CreateChannel: CreateChannel,

      //GetEvent - CURRENTLY NOT TESTED
      // Gets an event object given an event id
      GetEvent: GetEvent,

      //CreateNotification 
      // Given a message, and a list of channel_ids, returns a list of
      // promises, each one being a promise for a corresponding channel id
      CreateNotification: CreateNotification,

      //CreateSurvey 
      // Given a question, a list of options, and a list of channel_ids, returns a list of
      // promises, each one being a promise for a corresponding channel id
      CreateSurvey: CreateSurvey,

      //SubmitResponse
      // Given a notif id and a option id, submits the response to the server 
      SubmitResponse: SubmitResponse,

      //GetNotifications:
      // Given an event_id, get all notifications in the event
      GetNotifications: GetNotifications,

      //GetNotification:
      // Given an notif_id, gets the notification
      GetNotification: GetNotification,

      //GetResponse:
      // Given an notif_id, gets the notification
      GetResponses: GetResponses,

      //CreateEvent:
      // Given an event object, create the event
      CreateEvent: CreateEvent,
      
      //CreateSubEvent:
      // Given an event object, and the new subevent create the subevent
      CreateSubEvent: CreateSubEvent,

      //CreateUser:
      // Given a user object with email and password fields, create a user 
      CreateUser: CreateUser,

      //GetUser - gets the current user
      GetUser: GetUser,

      //PublishEventUpdate: updates an event
      PublishEventUpdate: PublishEventUpdate,

      //PublishEventUpdate: updates an event in a timetable
      PublishSubEventUpdate: PublishSubEventUpdate,
    }
  }

})();
