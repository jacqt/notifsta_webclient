/* Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Library wrapper around Notifsta' Websocket Api
 */

(function(){
    angular.module('notifsta.services').service('NotifstaWebsocket', ['$http', 'AuthService', service]);
    var WEBSOCKET_URL = 'http://notifsta.com:3001';

    // connect to websocket for notifications after initial load
    var dispatcher = new WebSocketRails(WEBSOCKET_URL);
    var notif_socket = dispatcher.subscribe('messages_' + this.props.event_name);

    if ("Notification" in window) {
      // if notifications are avail, immediately request
      Notification.requestPermission()
    }

    notif_socket.bind('new', function(m){
      // look up channel first
      state = this.state.channels_data;
      state["_" + m.channel_id].messages.unshift(m.message);
      console.log("received one");

      //TODO Move bottom code outside of here
      if ("Notification" in window) {
        var opts = {
          icon: 'http://notifsta.com/icon.png'
        }
        var notification = new Notification(m.message.message_guts, opts);
      }
    });

    function service($http, AuthService){

        return {
            SubscribeToNotifications: SubscribeToNotifications
        }

    }

})();
