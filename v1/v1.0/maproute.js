if(!micello.maps.route) micello.maps.route = {};

micello.maps.route.MapRoute = function(mapData, mapEvent) {
	this.mapData = mapData;
	this.mapEvent = mapEvent;
	this.routeActive = false;

	this.routeTo = null;
	this.routeFrom = null;

	this.doEnhancedNav = false;
}

/** This method indicats whether normal or enhanced nav should be used. */
micello.maps.route.MapRoute.prototype.isActive = function(doEnhancedNav) {
	this.doEnhancedNav = doEnhancedNav;
}


micello.maps.route.MapRoute.prototype.isActive = function() {
	return this.routeActive;
}

//----------------------
// Routes
//----------------------

/** This method reqeusts navigation from the given geometry. If both the
 * from and to are set, a network request will be made and the route plotted on the map. */
micello.maps.route.MapRoute.prototype.requestNavToGeom = function(geom,lid,doIsoLevel) {

	var temp = {};
	temp.t = "gid";
	if (geom.gid) {
		temp.gid = geom.gid;
	}
	else {
		temp.gid = geom.id;
	}


	if((doIsoLevel)&&(lid)) {
		temp.lid = lid;
	}
	if((geom.l)&&(lid)) {
		temp.alt = {};
		temp.alt.t = "mc";
		temp.alt.mx = geom.l[0];
		temp.alt.my = geom.l[1];
		temp.alt.lid = lid;
	}
	var ends = [];
	ends.push(temp);
	this.requestNavTo(ends);
}

/** This method reqeusts navigation from the given geometry. If both the
 * from and to are set, a network request will be made and the route plotted on the map. */
micello.maps.route.MapRoute.prototype.requestNavFromGeom = function(geom,lid,doIsoLevel) {
	var temp = {};
	temp.t = "gid";

        if (geom.gid) {
            temp.gid = geom.gid;
        } else {
            temp.gid = geom.id;
        }

	if((doIsoLevel)&&(lid)) {
		temp.lid = lid;
	}
	if((geom.l)&&(lid)) {
		temp.alt = {};
		temp.alt.t = "mc";
		temp.alt.mx = geom.l[0];
		temp.alt.my = geom.l[1];
		temp.alt.lid = lid;
	}
	var starts = [];
	starts.push(temp);
	this.requestNavFrom(starts);
}

/** This method requests a route to a destination. The argument is a list of route
 * point objects. */
micello.maps.route.MapRoute.prototype.requestNavTo = function(routeTo) {
	//remove old pin placements and route
	this.mapData.removeAnnotation("route");
	//set end
	this.routeTo = routeTo;
	this.setRouteMarker(true);
	//set rest of route
	//update rest of route
	if((this.routeTo)&&(this.routeFrom)&&(this.routeTo.gid == this.routeFrom.gid)&&(this.routeTo.gid)) {
		this.routeFrom = null;
	}
	else if(this.routeFrom) {
		this.setRouteMarker(false);
		this.getRoute();
	}
	this.mapEvent.dispatchEvent('routeTo', routeTo);
}

/** This method requests a route from a location. The argument is a list of route
 * point objects. */
micello.maps.route.MapRoute.prototype.requestNavFrom = function(routeFrom) {
	//remove old pin placements and route
	this.mapData.removeAnnotation("route");
	//set start
	this.routeFrom = routeFrom;

	this.setRouteMarker(false);
	//update rest of route
	if((this.routeTo)&&(this.routeFrom)&&(this.routeTo.gid == this.routeFrom.gid)&&(this.routeTo.gid)) {
		this.routeTo = null;
	}
	else if(this.routeTo) {
		this.setRouteMarker(true);
		this.getRoute();
	}
    this.mapEvent.dispatchEvent('routeFrom', routeFrom);
}


/** This method clears the active route and the current from and to data. */
micello.maps.route.MapRoute.prototype.clearRoute = function() {
	//hide overlay
	this.routeTo = null;
	this.routeFrom = null;
	this.routeActive = false;
	this.mapData.removeAnnotation("route");
	this.mapEvent.dispatchEvent('routeCleared');
}

//private

/** This internal method reqeusts navigation from the given geometry. If both the
 * from and to are set, a network request will be made and the route plotted on the map.
 * @private
 */
micello.maps.route.MapRoute.prototype.getRoute = function() {

	if((!this.routeFrom)||(!this.routeTo)) return;

	this.routeActive = true;

	var community = this.mapData.getCommunity();
	var cid = community.id;
	var path = community.path;
	var adjustments = micello.maps.routeAdjustments;

	var instance = this;
	var routeCallback = function(route) {
		instance.mapData.removeAnnotation("route");
		instance.mapData.showAnnotation(route,"route");
		instance.mapEvent.dispatchEvent('routeReceived', route);
	}
	var onError = function(msg) {
		micello.maps.onError(instance.mapEvent,msg,"micello.maps.MapControl.getRoute >> onError");
	}
	micello.maps.route.routeRequest(cid,this.routeFrom,this.routeTo,adjustments,"annotation",routeCallback,onError,path);

}

/** This internal method places a route start and marker. The argument isDest
* tells if this is the start or end marker.
 * @private
 */
micello.maps.route.MapRoute.prototype.setRouteMarker = function(isDest) {
	var geomId = null;
	var markerName;
	var routePoint;
	if(isDest) {
		routePoint = this.routeTo;
		markerName = "RouteEnd";
	}
	else {
		routePoint = this.routeFrom;
		markerName = "RouteStart";
	}

	if((routePoint != null)&&(routePoint.length == 1)) {
		geomId = routePoint[0].gid;

		if(geomId) {
			var marker = {"id":geomId,"mr":markerName,"mt":1,"anm":"route"};
			//add marker, on single geometry
			this.mapData.addMarkerOverlay(marker,true);
		}
	}
}

/** This method downloads the entity info for the given geometry. */
micello.maps.route.routeRequest = function(communityId,routeStarts,routeEnds,adjustments,format,onDownload,onError,path) {

	if((communityId)&&(routeEnds)) {
		var routeType = (routeStarts != null) ? "route" : "field_route";

		//create the body json
		var bodyJson = {};
		bodyJson.type = routeType;
		bodyJson.form = format;
		bodyJson.version = "v5";

		if(routeStarts) {
			bodyJson.start = routeStarts;
		}
		bodyJson.end = routeEnds;

		//get the meta data urls
		var navPropMapUrl = micello.maps.navPropMapUrl ? micello.maps.navPropMapUrl :  micello.maps.HOST_URL + "/meta/navpropmap/v5/" + micello.maps.navPropMapName;
		navPropMapUrl = micello.maps.request.appendAuthParams(navPropMapUrl);
		bodyJson.navPropMapUrl = navPropMapUrl;

		var navStringsUrl = micello.maps.navStringsUrl ? micello.maps.navStringsUrl : micello.maps.HOST_URL + "/meta/strings/v5/nav/" + micello.maps.navStringsName;
		navStringsUrl = micello.maps.request.appendAuthParams(navStringsUrl);
		bodyJson.navStringsUrl = navStringsUrl;

		if(this.doEnhancedNav) {
			bodyJson.enhanced = true;
		}

		if(adjustments) {
			bodyJson.adjusts = adjustments;
		}

		//convert the body to a string
		var body = micello.maps.route.jsonToString(bodyJson);

		path = micello.maps.request.pathConstruct(communityId, path);

		var onReqDownload = function(data) {
			if(data.success) {
				if(data.annotation) {
					//annotation object
					onDownload(data.annotation);
				}
				if(data.json) {
					//data object
					onDownload(data.json);
				}
			}
			else {
				var msg = data.msg ? data.msg : "Unknown error";
				onError(msg);
			}

		}
		var url = micello.maps.COM_SERVICE_URL + '/route'+ path.fullPath + "/" + micello.maps.lang;

		micello.maps.request.loadDataObject(url,onReqDownload,onError,"POST",body);
	}
}

/** quick and dirty to string method for json. The str argument can be null. */
micello.maps.route.jsonToString = function(obj,str) {
	if(!str) str = "";
	var first = true;
	if(obj instanceof Array) {
		str += '[';
		for(var i in obj) {
			if(first) {
				first = false;
			}
			else {
				str += ',';
			}
			str = micello.maps.route.jsonToString(obj[i],str);
		}
		str += ']';
	}
	else if(typeof(obj) == "string") {
		str += '"';
		str += obj;
		str += '"';
	}
	else if(obj instanceof String) {
		str += '"';
		str += obj.toString();
		str += '"';
	}
	else if(obj instanceof Object) {
		str += '{';
		for(var i in obj) {
			if(first) {
				first = false;
			}
			else {
				str += ',';
			}
			str += '"';
			str += i;
			str += '":';
			str = micello.maps.route.jsonToString(obj[i],str);
		}
		str += '}';
	}
	else {
		str += obj;
	}
	return str;
}



