/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Model of the admin interface
 */

(function(){
    angular.module('notifsta.services').service('EventService', ['$cookies', 'NotifstaHttp', 'ParseHttp', service]);
    function service($cookies, NotifstaHttp, ParseHttp){
        function GetEventLoggedIn(){
            return ($cookies['event-name'] != null);
        }


        //We wrap everything under a _data object so that we can perform databindings more easily
        //Otherwise, we will be assigning by value and things get messy quite quickly
        var _data = {
            Event: {
                channels: []
            },
        }
        var _websocket_enabled = false;
        
        function SetEvent(event_name){
            var promise = NotifstaHttp.GetEvent(event_name);
            promise.success(function(resp){
                console.log(resp);
                _data.Event = resp.data;
                console.log(_data);
            });
            
            promise.error(function(err){
            })
        }

        function SetState(event_name){
            SetEvent(event_name);
        }

        function GetUser(callback){ 
            var p = NotifstaHttp.GetUser();
            p.success(function(e){
                _data.User = e.data;
                if (callback){
                    callback();
                }
            })
            p.error(function(e){
                console.log(e);
            })
        }

        function UpdateEvent(){
            var event = _data.Event;
            if (_websocket_enabled){ //no need to poll
                return;
            }

            if (!event){
                return;
            }
            //var promise = NotifstaHttp.GetEvent(_data.Event.id);
            //promise.success(function(e){
                //console.log(e);
            //});
            //
            
            var total_broadcasts = 0;
            var channels_processed = 0;
            event.channels.map(function(channel){
                var promise = NotifstaHttp.GetMessages(channel.id);
                promise.success(function(e){
                    var messages = e.data;
                    channel.messages = messages.map(function(msg){
                        msg.time = moment(msg.created_at).fromNow();
                        total_broadcasts += 1;
                        return msg;
                    });
                    channels_processed += 1;
                    if (channels_processed == event.channels.length){
                        event.total_broadcasts = total_broadcasts;
                    }
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

        var promise = ParseHttp.GetData();
        promise.success(function(data){
            console.log("successfully queried parse")
            console.log(data);
        });
        promise.error(function(err){
            //error is in err
            console.log('failed to query parse');
            console.log(err);
        })


        return {
          SetEvent: SetEvent,
            //Used to set the event we would like to have info about
            SetState: SetState,

            //Used to get updated information about the event
            UpdateEvent: UpdateEvent,

            //for data binding purposes
            data : _data
        }
    }
})();
