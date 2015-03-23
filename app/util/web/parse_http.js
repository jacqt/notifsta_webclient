/* Service to interface with parse's api */
(function(){
    angular.module('notifsta.services').service('ParseHttp', ['$http', service]);
    function service($http){
        // PROBABLY A BETTER IDEA TO MOVE THIS TO THE SERVER SIDE.
        // DON'T WANT TO MAKE OUR MASTER KEY PUBLICALY AVAILABLE
        var APP_ID = 'zV50kkuGI8esJY0D6eAoy90bMgX3G2jWeTOTe1Rw';
        var MASTER_KEY = 'LSjlnMISaVqKMKkRnQKmaZX0gWahZFSNCJUSF6Gq';

        var _parse = Parse(APP_ID, MASTER_KEY);

        function Parse(app_id, master_key){
            this.app_id = app_id;
            this.master_key = master_key;
        }

        function GetData(){
            var req = {
                method: 'POST',
                url: 'https://api.parse.com/1/events/AppOpened',
                headers: {
                    'X-Parse-Application-Id': APP_ID,
                    'X-Parse-REST-API-Key': MASTER_KEY, 
                    "Content-Type" : "application/json"
                },
                data: {},
            }
            return $http(req);
        }
        return {
            GetData: GetData
        }
    }
})();

