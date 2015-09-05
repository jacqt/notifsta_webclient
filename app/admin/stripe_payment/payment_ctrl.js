(function () {
    angular.module('notifsta.controllers').controller('PaymentCtrl', ['$scope',  'NotifstaHttp', 'AuthService', controller]);

    function controller($scope, NotifstaHttp, AuthService){

        $scope.paid = false;
        var handler = StripeCheckout.configure({
            key: 'pk_live_miNtXLcbswFUTsqjpYtTWv4x',
            image: 'assets/home_images/square_logo.png',
            token: function(token) {
                $scope.loading = true;
                console.log(token);
                var p = NotifstaHttp.SendPaymentToken(token.id);
                p.success(publish_event);
                p.error(function(err) {
                    console.log("ERROR: ", err);
                    $scope.loading = false;
                });
            }
        });

        $scope.payNow = function (e) {
            // Open Checkout with further options
            handler.open({
                name: 'Notifsta',
                email: AuthService.GetCredentials().user_email,
                description: 'Publish your event!',
                amount: 10000
            });
            e.preventDefault();
        }

        function publish_event() {
            $scope.data.Event.published = true;
            $scope.publish_updates().success(function() {
                $scope.paid = true
                $scope.loading = false;
            });
        }


        $(window).on('popstate', function() {
            console.log('wth');
            handler.close();
        });
    }

})();

