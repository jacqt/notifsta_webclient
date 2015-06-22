(function () {
    angular.module('notifsta.controllers').controller('AddAdminsCtrl', ['$scope', 'toaster', '$mdDialog', 'AuthService', controller]);
    function controller($scope, toaster, $mdDialog, AuthService) {
        var self = this;

        $scope.searchText = null;
        $scope.selectedItem = null;

        $scope.input = {}
        $scope.users = [];
        $scope.admin_users = [];
        $scope.AddUserAsAdmin = function () {
            console.log($scope.input);
            var matching_items = $scope.users.filter(function (user) {
                return user.value == $scope.input.email
            });
            if (matching_items.length == 0) { // not a valid item
                return toaster.pop('error', 'Suggested email not subscribed to your event')
            }
            var promise = $scope.event_monitor.FlipUserAdminFlag(matching_items[0]);
            promise.then(
                function success() {
                    toaster.pop('success', 'Sucessfully added admin')
                    UpdateUsers();
                    $scope.input.email = '';
                    $scope.input.item = '';
                },
                function error() {
                    toaster.pop('error', 'Unsucessfully added admin')
                });
        }

        $scope.ConfirmRemoveUserAdminPrivilege = function (admin_user) {
            if (admin_user.email == AuthService.GetCredentials().user_email) {
                return toaster.pop('error', 'I\'m sorry Dave. I\'m afraid I can\'t do that.');
            }
            var confirm = $mdDialog.confirm()
                            .title('Confirm')
                            .content('Are you sure you want to disable this user\'s admin privileges?')
                            .ariaLabel('Confirm')
                            .ok('Yes')
                            .cancel('No')
                            .targetEvent(event)
            $mdDialog.show(confirm).then(
                function confirmed() {
                    var promise = $scope.event_monitor.FlipUserAdminFlag(admin_user);
                    promise.then(
                        function success() {
                            toaster.pop('success', 'Sucessfully removed admin')
                            UpdateUsers();
                        },
                        function error() {
                            toaster.pop('error', 'Unsucessfully removed admin')
                    });
                },
                function declined() {
                    ;
                });

        }
        function UpdateUsers() {
            if (!$scope.data.Event.subscribed_users) return;

            $scope.users = $scope.data.Event.subscribed_users.map(function (p) {
                p.value = p.email;
                p.display = p.email;
                return p;
            })

            $scope.admin_users = $scope.users.filter(function (user) {
                return user.admin;
            });
            var options = {
                keys: ['email'],
            };
            $scope.fuse = new Fuse($scope.users, options);
        }

        $scope.$watch('data.Event.subscribed_users', function (newVal) {
            UpdateUsers();
        });


        $scope.querySearch = function (query) {
            return $scope.fuse.search(query).slice(0, 4);
        }

        /**
         * Create filter function for a query string 
         *
         */
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(user) {
                return (user.value.indexOf(lowercaseQuery) != -1) && (!user.admin);
            };
        }
    }
})();