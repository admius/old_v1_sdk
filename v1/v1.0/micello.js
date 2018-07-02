/**
 * The version of the micello maps API.
 * @constant
*/
micello.maps.version = "1.0";

/** @private */
micello.maps.PROTOCOL = "http";
if( location.protocol == "https:") { micello.maps.PROTOCOL = "https"; }

/** @private */
micello.maps.BASE_SERVER = "http://eng.micello.com";
/** @private */
micello.maps.HOST_URL = micello.maps.BASE_SERVER + "/mfs/ms/v1/mfile";
/** @private */
micello.maps.COM_SERVICE_URL = micello.maps.BASE_SERVER + "/comdata";
/** @private */
micello.maps.SEARCH_URL = micello.maps.BASE_SERVER + "/search";

/** @private */
micello.msgs = new Array();
/** @private */
micello.logDiv = null;
/** @private */
micello.log = function(msg) {
	if(this.logDiv) {
            console.log(msg);
		this.msgs.push(msg);
		this.logDiv.innerHTML = msg + "<br>" + this.logDiv.innerHTML;
	}
}

/** Gets the path for a given script.
 * @private */
micello.getScriptPath = function(scriptObjects,scriptName){
	// Check document for our script
	for (i=0; i<scriptObjects.length; i++) {
		var path = scriptObjects[i].src;
		var baseLength = path.length-scriptName.length;
		if(path.substr(baseLength) == scriptName) {
			return path.substr(0, baseLength);
		}
	}
	//script not found
	return null;
}

/** This function gets the url of the script directory.
 * @private */
micello.getScriptUrl = function() {
	var scriptObjects = document.getElementsByTagName('script');
	var files = ["micellomap_impl.js","combined.js","micello.js","micellomap.css"];
	var i;
	var url;
	for(i = 0; i < files.length; i++) {
		url = micello.getScriptPath(scriptObjects,files[i]);
		if(url != null) return url
	}
	micello.maps.errorHandler("Error: api context not found!");
	return "";
}

/** This method is a convenience function to package an error event. */
micello.maps.onError = function(eventManager,msg,location) {
	var e = {
		"msg":msg,
		"location":location
	}
	eventManager.dispatchEvent("mapError",e);
}

/** @private */
micello.SCRIPT_URL = micello.getScriptUrl();

//theme base paths
micello.maps.themeMapUrl = undefined; //micello.maps.HOST_URL + "/meta/thememap/v5/Standard";
micello.maps.themeMapName = "Standard";
micello.maps.themeUrl = undefined; //micello.maps.HOST_URL + "/meta/theme/v5/Standard";
micello.maps.themeName = "Standard";
micello.maps.stringsUrl = undefined; //micello.maps.HOST_URL + "/meta/strings/v5/sdk/Standard";
micello.maps.stringsName = "Standard";
micello.maps.navPropMapUrl = undefined; //micello.maps.HOST_URL + "/meta/navpropmap/v5/Standard";
micello.maps.navPropMapName = "Standard";
micello.maps.navStringsUrl = undefined; //micello.maps.HOST_URL + "/meta/strings/v5/nav/Standard";
micello.maps.navStringsName = "Standard";

/** The language for the sdk */
micello.maps.lang = "en";
micello.maps.defaultLang = undefined;

/** routing settings */
micello.maps.routeAdjustments = undefined;
