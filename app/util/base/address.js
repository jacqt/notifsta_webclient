/**Anthony Guo (anthony.guo@some.ox.ac.uk) 
 * Intermodule communicator service 
 */
(function(){
    var eventToCallbackMap = {};
    angular.module('notifsta.services').service('AddressService', function(){ 
        return {
            ShortenAddress: function(place){
                var partial_address = '';
                //var unwanted_types = ['country', 'political', 'postal_code']
                var unwanted_types = ['postal_code', 'political']
                for (var i = 0; i != place.address_components.length; ++i) {
                    var comp = place.address_components[i];
                    var unwanted = false;
                    for (var j = 0; j != comp.types.length; ++j) {
                        if (unwanted_types.indexOf(comp.types[j]) > -1) {
                            unwanted = true;
                            break;
                        }
                    }
                    if (unwanted) {
                        continue;
                    }
                    partial_address += ', ' + comp.long_name;
                }
                return partial_address
            },
        }
    });
})();
