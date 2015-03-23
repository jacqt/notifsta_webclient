/**Anthony Guo (anthony.guo@some.ox.ac.uk) 
 * Intermodule communicator service 
 */
(function(){
    var eventToCallbackMap = {};
    angular.module('notifsta.services').service('ImcService', function(){ 
        return {
            AddHandler: function(eventName, callback){
                if (eventToCallbackMap[eventName] == null){
                    eventToCallbackMap[eventName] = [callback];
                } else {
                    eventToCallbackMap[eventName].push(callback);
                }
            },
            FireEvent : function(eventName, data){
                var callbacks = eventToCallbackMap[eventName];
                if (callbacks == null){
                    return;
                }
                for (var i = 0; i != callbacks.length; ++i){
                    var callback = callbacks[i];
                    callback(data);
                }
            }
        }
    });
})();
