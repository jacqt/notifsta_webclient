/* Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Wrapper around websocket and the basic http request to provide
 * a unified interface for getting information
 */

(function(){
    angular.module('notifsta.services').service('NotifstaAdapter', 
        ['$http', 'AuthService', 'NotifstaHttp', 'NotifstaWebsocket', service]);
    function service($http, AuthService, NotifstaHttp, NotifstaWebsocket){

        var EDT = {
            new_notification: {
                callbacks: [],

            },
            logged_in: {
                callbacks: []
            }
        }

        function SubscribeToNotifications(){
            //Check if we have websockets
            if (NotifstaWebsocket.WebsocketEnabled()){
                //Use websockets

            } else {
                //Use polling fallback
                throw "Polling fallback not implemented"
            }
        }


        function AddHandler(event_name, callback){
            if (!EDT[event_name]){
                throw "Event " + event_name + " is not a valid event";
            }
            EDT[event_name].callbacks.push(callback);
        }


        return {
            // Starts either a websocket connection or a polling loop for notifications
            SubscribeToNotifications: SubscribeToNotifications,

            //----------------------------------------------------------------//
            // Proxy some methods directly to NotifstaHttp

            //Login:
            // Takes email and password strings
            // Returns the http promise object created
            // Will also alter the credentials object that holds the user 
            // token and user email
            Login: NotifstaHttp.Login,

            //CreateEvent - CURRENTLY NOT WORKING
            // Creates an event given an event name
            CreateEvent: NotifstaHttp.CreateEvent,

            //CreateChannel - CURRENTLY NOT WORKING
            // Creates a channel given an event id and channel name
            CreateChannel: NotifstaHttp.CreateChannel,

            //GetEvent - CURRENTLY NOT TESTED
            // Gets an event object given an event id
            GetEvent: NotifstaHttp.GetEvent,

            //CreateNotification 
            // Given a message, and a list of channel_ids, returns a list of
            // promises, each one being a promise for a corresponding channel id
            CreateNotification: NotifstaHttp.CreateNotification,

            //GetMessages:
            // Given an event_id, get all messages in the event
            GetMessages: NotifstaHttp.GetMessages,

            //GetUser - gets the current user
            GetUser: NotifstaHttp.GetUser,
        }
    }

})();
