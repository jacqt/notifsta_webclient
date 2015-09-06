/* Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Library wrapper around Notifsta' Websocket Api
 */

(function(){
    angular.module('notifsta.services').service('NotifstaWebsocket', 
        ['$http', 'AuthService', 'ImcService', service]);
    var WEBSOCKET_URL = 'api.notifsta.com:3001';
    var WEBSOCKET_URL = 'ws://websocket.notifsta.com/websocket';

    function service($http, AuthService, ImcService){
        function WebsocketEnabled(){
            return true;
        }
        function SubscribeToNotifications(guid){
            // connect to websocket for notifications after initial load
            var dispatcher = new WebSocketRails(WEBSOCKET_URL);

            //TODO: Fix this to the correct string pending backend update
            var notif_socket = dispatcher.subscribe(guid); 

            notif_socket.on_success = function(){
                console.log('Successfully connected to websocket');
            }

            if ("Notification" in window) {
                // if notifications are avail, immediately request
                Notification.requestPermission()
            }

            notif_socket.bind('new', function(notif){
                ImcService.FireEvent('event_' + guid + ' notif', notif);
            });
        }

        return {
            // Function to return whether websockets are enabled
            // Currently a dummy function that returns true
            WebsocketEnabled: WebsocketEnabled,
            SubscribeToNotifications: SubscribeToNotifications
        }

    }

})();
