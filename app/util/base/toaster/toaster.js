/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Purpose of this service is to duplicate the old angular toaster API, BUT use angular materials' toaster
 * Provides methods for updating
 */

(function () {
    angular.module('notifsta.services').service('toaster',
        ['$mdToast', '$animate', service]);
    function service($mdToast, $animate) {
        function pop(type, message) {
            console.log('Popping the toaster!');
            $mdToast.show({
                controller: 'ToastCtrl',
                templateUrl: 'app/util/base/toaster/toaster.html',
                hideDelay: 2000,
                position: 'top right',
                locals: { message: message, type: type},
            });
        }
        return {
            pop: pop,
        }
    }

    angular.module('notifsta.services').controller('ToastCtrl',
        ['$scope', '$mdToast', 'message', 'type',
        function ($scope, $mdToast, message, type) {
            $scope.closeToast = function () {
                $mdToast.hide();
            };
            $scope.message = message;
            $scope.toaster_style = {};
            switch (type) {
                case 'error':
                    $scope.toaster_style['background-color'] = 'rgb(218, 78, 78)';
                    break;
                case 'success':
                    $scope.toaster_style['background-color'] = 'rgb(57, 142, 179)';
                    break;
                default:
                    break;
            }
        }]);
})();
