
/**Anthony Guo (anthony.guo@some.ox.ac.uk) 
 */
(function(){
    angular.module('notifsta.services').service('WindowSizeService', ['$window', function($window){ 
        var w = angular.element($window);
        _window_size = {
            width: w.width(),
            height: w.height()
        };

        w.bind('resize', function () {
            _window_size.width = w.width();
            _window_size.height = w.height();
        });
        return {
            window_size: _window_size,
        }
    }]);
})();


