/**
 * @namespace This is the main micello namespace.
*/
var micello = {
}

/**
 * @namespace This is the micello namespace for the maps API.
*/
micello.maps = {
}

/** query param table
 * @private*/
micello.maps.queryParamTable = [];

/**  This function adds a server pattern and key to the query param table.
 * @private */
micello.maps.addServer = function(serverPattern, key) {
	var serverEntry = {};
	serverEntry.urlPattern = serverPattern;
	serverEntry.params = [["key",key]];
	micello.maps.queryParamTable.push(serverEntry);
}

micello.maps.init = function(key,callback) {
	micello.maps.addServer(micello.maps.BASE_SERVER,key);

	window.onload = callback;
}


