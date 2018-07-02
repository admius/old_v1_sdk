//If the map is dynamically loaded, this code should be called when finished loading

if(micello.maps.loading.key) micello.maps.addServer(micello.maps.BASE_SERVER,micello.maps.loading.key);

if(micello.maps.initCallback) {
	micello.maps.initCallback();
}


