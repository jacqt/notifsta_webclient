/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Purpose of this service is to deal with desktop notifications
 */

(function(){
    angular.module('notifsta.services').service('DesktopNotifs', 
        ['ImcService', service]);
    function service(NotifistaAdapter){
        function RequestNotification() {
            if ("Notification" in window) {
                // if notifications are avail, immediately request
                Notification.requestPermission()
            }
        }
        function FireNotification(notification){
            if ("Notification" in window) {
                var opts = {
                    icon: 'assets/home_images/square_logo.png'
                }
                var notification = new Notification(notification.notification_guts, opts);
                setTimeout(function(){
                    notification.close();
                }, 5 * 1000);
            }
        }

        return {
            // Function to send a desktop notification
            FireNotification : FireNotification,

            RequestNotification: RequestNotification
        }
    }
})();
