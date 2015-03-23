/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Purpose of this service is to maintain the global state of the application.
 * Provides methods for updating
 */

(function(){
    angular.module('notifista.services').service('UserService', ['$cookies', 'NotifistaHttp', service]);
    function service($cookies, NotifistaHttp){
        function GetUserLoggedIn(){
            return ($cookies['user-id'] != null);
        }
        function GetEventLoggedIn(){
            return ($cookies['event-name'] != null);
        }

        //We wrap everything under a _data object so that we can perform databindings much more easily!
        //Otherwise, we will be assigning by value and things get messy quite quickly!
        var _data = {
            Event: null,
            User: {
                events: []
            }
        }
        var _websocket_enabled = false;
        

        //Perform a simple diff calculation to see new notifications
        //... or maybe the server should do this ?
        function ProcessEvents(events){
            events.map(function(event){
                event.new_messages = 3;
                return event;
            });
        }

        //Polls the server for more information
        function UpdateUserEvent(event){
            if (_websocket_enabled){ //no need to poll
                return;
            }

            event.channels.map(function(channel){
                var promise = NotifistaHttp.GetMessages(event.name, channel.name, _data.User.email);
                promise.success(function(messages){
                    channel.messages = messages.map(function(msg){
                        msg.time = moment(msg.createdAt).fromNow();
                        return msg;
                    });
                });
                promise.error(function(error){
                    channel.messages = [
                    {
                        time: 'N/A',
                        message: 'Error in getting data'
                    }
                    ]
                })
            });
        }


        function SetUser(email){
            var promise = NotifistaHttp.GetUser(email);
            promise.success(function(resp){
                console.log(resp.data);
                _data.User = resp.data;
                ProcessEvents(resp.data.events);
            });

            promise.error(function(err){
                console.log(err);
            });
        }

        return {
            //Used to set the user we would like to have info about
            SetUser: SetUser,

            //Used to update the current user 
            //Parameterized by an 'event' argument, (which is a reference
            //to an event in the current user object), which lets use
            //only make http requests for the event we care about
            UpdateUserEvent: UpdateUserEvent,

            //for data binding purposes
            data : _data
        }
    }
})();
