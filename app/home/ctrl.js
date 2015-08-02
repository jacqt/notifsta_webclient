/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for home page
 */
(function () {
    angular.module('notifsta.controllers').controller('HomeCtrl',
        ['$scope', 'NotifstaHttp', '$cookies', '$routeParams', function ($scope, NotifstaHttp, $cookies, $routeParams) {

            $scope.TITLE_NAME = '';
            switch ($routeParams.r) {
                case 'h':
                    $scope.TITLE_NAME = 'hackathon';
                    break;
                case 'f':
                    $scope.TITLE_NAME = 'festival';
                    break;
                default:
                    $scope.TITLE_NAME = 'hackathon'
                    break;
            }

            $scope.TITLE_NAME 
        $scope.event = {
            name: $routeParams.event_name,
            id: $routeParams.event_id,
            }
            $("a.scrollto").click(function (e) {
                e.preventDefault();
                var el = $($(this).attr("scroll-to"));

                $('html, body').animate({
                    scrollTop: el.offset().top - 53
                }, 1000);
            });

            //Make the feature tabs work
            for (var i = 1; i != 6; i++) {
                (function () {
                    var c = i;
                    $('#feature' + i + '_a').click(function (e) {
                        for (var j = 1; j != 6; j++) {
                            $('#feature' + j).removeClass('active');
                        }
                        $('#feature' + c).addClass('active');
                        e.preventDefault();
                    });
                })();
            }
        }]);
})();
