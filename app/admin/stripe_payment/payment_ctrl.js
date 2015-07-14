(function () {
    angular.module('notifsta.controllers').controller('PaymentCtrl', ['$scope',  controller]);

    function controller($scope){

        $scope.paid = false;
        var handler = StripeCheckout.configure({
              key: 'pk_test_6pRNASCoBOKtIshFeQd4XMUh',
              image: 'assets/home_images/square_logo.png',
              token: function(token) {
                  console.log(token);
                  $scope.paid = true;
              }
          });
        
        $scope.payNow = function (e) {
            // Open Checkout with further options
            $scope.data.Event.published = true;
            $scope.publish_updates()

            //handler.open({
            //    name: 'Notifsta',
            //    description: 'Publish your event!',
            //    amount: 5000
            //});
            //e.preventDefault();
        }
        $(window).on('popstate', function() {
            handler.close();
        });
    }

})();

