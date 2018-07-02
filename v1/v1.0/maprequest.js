/**
 * @namespace This is a namespace that contains some static network request functions.
 */
micello.maps.request = {}

/** This is teh url for the logo.
 * @private */
micello.maps.request.LOGO_URL = micello.SCRIPT_URL + "/resources/logo.png";

/** This is teh url for the the close image.
 * @private */
micello.maps.request.CLOSE_URL = micello.SCRIPT_URL + "/resources/close10.png";

/** This is teh url for the callout.
 * @private */
micello.maps.request.CALLOUT_URL = micello.SCRIPT_URL + "/resources/callout34.png";

/** This is teh url for the callout.
 * @private */
micello.maps.request.LOADING_URL = micello.SCRIPT_URL + "/resources/mload.gif";

/**
 * This method downloads a community, given by the community ID.
 * The values mv and ev (map version and entity version) are optional.
 */
micello.maps.request.loadCommunity = function(communityId,onDownload,onError,path) {
	path = micello.maps.request.pathConstruct(communityId, path);
	var url = micello.maps.HOST_URL + path.fullPath + "/v5_map/com-map/" + micello.maps.lang;
	micello.maps.request.doRequest(url,onDownload,onError,"GET");
}

/** This method downloads the drawing entity.
 * The values mv and ev (map version and entity version) are optional. */
micello.maps.request.loadDrawingEntity = function(communityId,drawingId,onDownload,onError,path) {
	path = micello.maps.request.pathConstruct(communityId, path);
	var url = micello.maps.HOST_URL + path.fullPath + "/v5_map/drawing-entity/" + drawingId + "/" + micello.maps.lang;
	micello.maps.request.doRequest(url,onDownload,onError,"GET");
}

/** This method downloads the level geometry.
 * The values mv and ev (map version and entity version) are optional.
 **/
micello.maps.request.loadLevelGeom = function(communityId,drawingId,levelId,onDownload,onError,path) {
	path = micello.maps.request.pathConstruct(communityId, path);
	var url = micello.maps.HOST_URL + path.fullPath + "/v5_map/level-geom/" + levelId + "/" + micello.maps.lang;
	micello.maps.request.doRequest(url,onDownload,onError,"GET");
}

/** This method downloads the json object from a plain url. The argument mehdo is optional and can be "GET" or "POST".
 * It defaults to "GET". The argument body is optional and only used on a "POST" request. */
micello.maps.request.loadDataObject = function(url,onDownload,onError,method,body) {
	if(!method) method = "GET";
	micello.maps.request.doRequest(url,onDownload,onError,method,body);
}

/** This method downloads the entity info for the given geometry.
 * The values mv and ev (map version and entity version) are optional.*/
micello.maps.request.loadDetail = function(communityId,geomList,entityList,doCommunity,onDownload,onError,path) {
	path = micello.maps.request.pathConstruct(communityId, path);

	var onReqDownload = function(data) {
		onDownload(data);
	}

	var queryParams = "";
	if((geomList)&&(geomList.length > 0)) {
		queryParams += "gid=" + geomList.toString();
	}
	if((entityList)&&(entityList.length > 0 )) {
		if(queryParams.length > 0) queryParams += "&";
		queryParams += "eid=" + entityList.toString();
	}
	if(doCommunity) {
		if(queryParams.length > 0) queryParams += "&";
		queryParams += "c=true";
	}

	var url = micello.maps.COM_SERVICE_URL + '/detailv5'+ path.fullPath + "/" + micello.maps.lang + "?" + queryParams;

	micello.maps.request.doRequest(url,onReqDownload,onError,"GET");
}


/** This method dsubmits a user problem report. Either the geom, community or neither should be 
 * populated. It is not necessasry to populate both the geometry and the community. */
micello.maps.request.userInput = function(text,geom,community) {
alert("User input not implemented");
//	if(text) {
//
//		var onDownload = function(data) {
//			micello.maps.mapproblem.onSuccess();
//		}
//		var onFailure = function(msg) {
//			micello.maps.mapproblem.onFailure();
//		}
//                //userinput/problem/community/{cid}[/geom/{gid}]
//		var url = micello.maps.HOST_URL + "/v3_java/userinput/problem/community/" + community.cid;
//		if(geom) { url +=  "/geom/"  + geom.id; }
//		url += "?" + micello.maps.request.getStdParams();
//
//		micello.maps.request.doRequest(url,onDownload,onFailure,"POST",text);
//
//	}
}

/**
 * This method does ah HTTP request to the given URL. On success, the requeted data
 * is passed to the function onDownload. On failure, a msg is passed to the function
 * onFailure. The argument httpMethod determimes the request method ("get" or "post")
 * and the argument body gives the http body to be sent with the request.
 */
micello.maps.request.doRequest= function(url,onDownload,onFailure,httpMethod,body) {
	var xmlhttp;
	var doIe = false;

	url = micello.maps.request.appendAuthParams(url);
	url = micello.maps.request.fixProtocol(url);

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
				msg = "Error in request: " + data.error;
				onFailure(msg);
			}
			else {
				onDownload(data);
			}
		}
		
		xmlhttp.onerror = function() {
			msg = "Error in http request. Status: " + xmlhttp.status;
			onFailure(msg);
		}

		xmlhttp.ontimeout = function(){return;}
		xmlhttp.onprogress = function(){return;}
	}

	xmlhttp.open(httpMethod,url,true);
        
	if (!doIe) {
		if(httpMethod == "POST") {
			xmlhttp.setRequestHeader("Content-Type","text/plain");
		}
	}

	if(!doIe) {
		xmlhttp.send(body);
	} else {
		setTimeout(function(){
			xmlhttp.send(body);
		}, 0);
	}
}

/**
 * This method adds query parameters from the query param table.
 */
micello.maps.request.appendAuthParams = function(url) {
	for(var i = 0; i < micello.maps.queryParamTable.length; i++) {
		var serverEntry = micello.maps.queryParamTable[i];
		if(url.indexOf(serverEntry.urlPattern) === 0) {
			url = micello.maps.request.appendParamList(url,serverEntry.params);
		}
	}
	return url;
}

/**
 * This method adds the listed query params to the url. It only adds a parameter
 * if it is not already in the url
 * @private
 */
micello.maps.request.appendParamList = function(url, paramList) {
	var splitUrl  = url.split("?");
	var queryString = splitUrl.length > 1 ? splitUrl[1] : "";
	var param;
	for(var i = 0; i < paramList.length; i++) {
		param = paramList[i];
		if(queryString.indexOf(param[0] + "=") === -1) {
			queryString += param[0] + "=" + param[1];
		}
	}
	return (queryString.length > 0) ? splitUrl[0] + "?" + queryString : url;
}

/**
 * This method fixes the protocol if the protocol shoudl be https but is http.
 */
micello.maps.request.fixProtocol = function(url) {
	if(micello.maps.PROTOCOL == "https") {
		var splitUrl  = mrkr.src.split(":");
		if(splitUrl[0] == "http") {
			url = micello.maps.PROTOCOL + ":" + splitUrl[1];
		}
	}
	return url;
}



/* This method constructs the path portion of the URLs to find data files
 * 
 * @param {object} path This is the object which holds the relevant details for the path construction including ev (entity version - optional), 
 * mv (map version - optional), subpath (optional), root path, and unversioned (boolean)
 */
micello.maps.request.pathConstruct = function(communityId, path) {

	var fp = '';
	if( typeof path === 'undefined') {
		path = {};
	}
	//Root path 
	if( path.rootPath ) {
		fp += path.rootPath+'/';
	} else {
		fp += '/map/';
	}
	
	//Community ID
	fp += communityId+'/';
	
	//MV, EV and unversioned handler
	if( path.unversioned === true ) {
		fp += path.subPath;
	} else {
		if(path.mv === undefined) path.mv = '-';
		if(path.ev === undefined) path.ev = '-';
		fp += 'mv/'+path.mv+'/ev/'+path.ev;
		if( path.subPath ) {
			fp += '/'+path.subPath;
		}
	}
	
	path.fullPath = fp;
	return path;

}

