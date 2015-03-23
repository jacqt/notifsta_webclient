/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Purpose of this service is to deal with desktop notifications
 */

(function(){
    angular.module('notifista.services').service('AuthService', 
        ['NotifstaAdapter', service]);
    function service(NotifistaAdapter){

        function FireNotification(data){
            throw "FireNotification not implemented"
        }


        return {
            // Function to send a desktop notification
            FireNotification : FireNotification
        }
    }
})();
