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

/** This method must be called to set the api key and to define the callback that
 * should be called when the map scripts have completed loading. For multi server access,
 * pass the value of key as null and explicitly populate the query param table instead.*/
micello.maps.init = function(key,callback) {
	//we have to wait until we know the server to populate the query param table
	micello.maps.loading.key = key;

	//if loading already happened call callback
	if(micello.maps.MapControl) {
		callback();
	}
	else {
		micello.maps.initCallback = callback;
	}
}

// ----------- START LOADING NAMESPACE CODE ---------------------------

/**
 * @namespace This is the namespace used for loading the api
 * to avoid collisions with the dynamically loaded sdk code.
*/
micello.maps.loading = {
}

/** @private */
micello.maps.loading.PROTOCOL = "http";
if( location.protocol == "https:") { micello.maps.loading.PROTOCOL = "https"; }

/** @private */
micello.maps.loading.VERSION_SERVER = "eng.micello.com/mfs/ms/v1/mfile";
/** @private */
micello.maps.loading.MAJORVERSION = 1;

if( typeof SDKVERSION === 'undefined' ) {
    micello.maps.loading.VERSION = '-';
} else {
    micello.maps.loading.VERSION = SDKVERSION;
}

/** @private */
micello.maps.loading.loadInit = function() {

//	var t = (new Date()).getTime();
//	var canvas = document.createElement("canvas");
//	var c = (canvas.getContext) ? 1 : 0;

	var url = micello.maps.loading.PROTOCOL + "://" + micello.maps.loading.VERSION_SERVER +
		"/webmapversion/scriptrequest/" + micello.maps.loading.MAJORVERSION + "/"
		+ micello.maps.loading.VERSION;

	micello.maps.loading.networkRequest(url,micello.maps.loading.loadInit2,micello.maps.errorHandler, "GET");
}

/** @private */
micello.maps.loading.loadInit2 = function(data) {
	var head = document.getElementsByTagName("head")[0];
	if(!head) {
		micello.maps.onMapError("Error: head element not found!");
		return;
	}

	var i;
	var scriptArray = data.scripts;
	if(scriptArray) {
		for(i = 0; i < scriptArray.length; i++) {
			micello.maps.loading.addScript(head,scriptArray[i]);
		}
	}
	var cssArray = data.css;
	if(cssArray) {
		for(i = 0; i < cssArray.length; i++) {
			micello.maps.loading.addCss(head,cssArray[i]);
		}
	}
}

/** @private */
micello.maps.loading.addScript = function(head,url) {
	url = micello.maps.loading.fixProtocol(url);
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = url;
	head.appendChild(script);
}

/** @private */
micello.maps.loading.addCss = function(head,url) {
	url = micello.maps.loading.fixProtocol(url);
	var csslink = document.createElement("link");
	csslink.rel = "stylesheet";
	csslink.type = "text/css";
	csslink.href = url;
	head.appendChild(csslink);
}

/**
 * This method fixes the protocol if the protocol shoudl be https but is http.
 */
micello.maps.loading.fixProtocol = function(url) {
	if(micello.maps.PROTOCOL == "https") {
		var splitUrl  = mrkr.src.split(":");
		if(splitUrl[0] == "http") {
			url = micello.maps.loading.PROTOCOL + ":" + splitUrl[1];
		}
	}
	return url;
}

/** @private */
micello.maps.loading.networkRequest = function(url,onDownload,onFailure,httpMethod,body) {
	var xmlhttp;
	var doIe = false;

	if(window.XDomainRequest) {
		// code for IE6, IE5
		xmlhttp=new XDomainRequest();
                xmlhttp.timeout = 10000;
		doIe = true;
	}
	else if(window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}
	else {
		onFailure("This browser is not supported.");
		return;
	}
        
	if(!doIe) {
		//standard xmlhttp
		xmlhttp.dataManager = this;

		xmlhttp.onreadystatechange=function() {
			var msg;
			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
				var data = eval('(' + xmlhttp.responseText + ')');
//data.error = true;
				if(data.error) {
					msg = "Error in request: " + data.error;
					onFailure(msg);
				}
				else {
					onDownload(data);
				}
			}
			else if(xmlhttp.readyState==4  && xmlhttp.status >= 400)  {
				msg = "Error in http request. Status: " + xmlhttp.status;
				onFailure(msg);
			}
		}
	}
	else {
		//microsort xdomainrequest
		xmlhttp.onload = function() {
			var data = eval('(' + xmlhttp.responseText + ')');
			if(data.error) {
				var msg = "Error in request: " + data.error;
				onFailure(msg);
			}
			else {
				onDownload(data);
			}
		}
		xmlhttp.onerror = function() {
			var msg = "Error in http request. Status: " + xmlhttp.status;
			onFailure(msg);
		}
	}

	xmlhttp.open(httpMethod,url,true);
        
        if (!doIe) {
            if(httpMethod == "POST") {
                xmlhttp.setRequestHeader("Content-Type","text/plain");
            }
        }
        
	xmlhttp.send(body);
}

/** @private */
micello.maps.loading.errorHandler = function(msg) {

    //This produces the error to the screen
    e = document.createElement("div");
    e.innerHTML = "Micello Map: " + msg;
    e.setAttribute("id", "micello-map-msg");
    e.style.top = 0;
    e.style.left = 0;
    e.style.padding = "7px";
    e.style.border = "1px solid #666";
    e.style.backgroundColor = "#fff";
    e.style.position = "absolute";
    document.body.appendChild(e);

    setTimeout(function(e){
        var eM = document.getElementById("micello-map-msg");
        eM.style.display = "none";
    }, 7000);

}


micello.maps.loading.loadInit();

//----------- END LOADING NAMESPACE CODE ---------------------------


