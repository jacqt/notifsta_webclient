/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Purpose of this service is to maintain the global state of the application.
 * Provides methods for updating
 */

(function(){
    angular.module('notifsta.services').service('AuthService', 
        ['$cookies', service]);
    function service($cookies){
        function GetCredentials(){
            var cookies = $cookies.getAll();
            var user_email = cookies.user_email;
            var user_token = cookies.user_token;
            var user_id = cookies.user_id;
            var logged_in = (user_email !== undefined 
                && user_token !== undefined
                && user_id !== undefined);
            return {
                user_email: user_email,
                user_token: user_token,
                user_id: user_id,
                logged_in: logged_in
            }
        }

        function SetUserEmail(user_email){
            $cookies.put('user_email', user_email);
        }

        function SetUserId(user_id){
            $cookies.put('user_id', user_id);
        }

        function SetUserToken(user_token){
            $cookies.put('user_token', user_token);
        }

        function Logout(){
            $cookies.remove('user_email');
            $cookies.remove('user_token');
            $cookies.remove('user_id');
        }

        return {
            // A JSON object containing the credentials of the current
            // user logged in. 
            //
            // This data is taken from cookies.
            //
            // Contains the following fields
            //    logged_in: Boolean
            //    user_email: String
            //    user_token: String
            GetCredentials : GetCredentials,

            // Function to set the user_email
            SetUserEmail: SetUserEmail,

            // Function to set the user_token
            SetUserToken: SetUserToken,

            // Function to set the user_token
            SetUserId: SetUserId,

            // Function to logout
            // This deletes the cookies.
            Logout: Logout
        }
    }
})();
