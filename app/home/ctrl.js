/** Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Controller for home page
 */
(function () {
    angular.module('notifsta.controllers').controller('HomeCtrl',
        ['$scope', 'NotifstaHttp', '$cookies', function ($scope, NotifstaHttp, $cookies) {
            $("a.scrollto").click(function (e) {
                e.preventDefault();
                var el = $($(this).attr("scroll-to"));

                console.log('clicking a scroll to button');
                console.log(el.offset().top);
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
                        console.log(c);
                        $('#feature' + c).addClass('active');
                        e.preventDefault();
                    });
                })();
            }
        }]);
})();
