if(!micello.maps.route) micello.maps.route = {};

/**
 * This is a field route object. A field route is a single route structure that
 * allows you to get a route from any start point to a given end point.
 *
 * This class allows you to load a field route and then update the display
 * using a position measurement.
 *
 * @class This class displays a field route.
 */
micello.maps.route.FieldRoute = function(mapData, mapEvent) {
	this.mapData = mapData;
	this.mapEvent = mapEvent;

	this.fieldRoute = null;
	this.numNodes = 0;

}

//===========================
// Constants
//===========================


micello.maps.route.FieldRoute.TYPE_MARKER_OVERLAY = 1;
micello.maps.route.FieldRoute.TYPE_GEOM_OVERLAY = 2;
micello.maps.route.FieldRoute.TYPE_GEOM_INLAY = 3;

micello.maps.route.FieldRoute.FIELD_ARROW_SPACING = 7.5;
micello.maps.route.FieldRoute.FIELD_ARROW_A = 1.5; //arrow point to tip meters
micello.maps.route.FieldRoute.FIELD_ARROW_B = -1.5; //arrow point to tail meters
micello.maps.route.FieldRoute.FIELD_ARROW_C = 2; //arrow width
micello.maps.route.FieldRoute.FIELD_OFFSET = 5;

micello.maps.route.FieldRoute.MAIN_ARROW_OFFSET = 10;
micello.maps.route.FieldRoute.MAIN_ARROW_LENGTH = 15;
micello.maps.route.FieldRoute.MAIN_ARROW_B = -5;
micello.maps.route.FieldRoute.MAIN_ARROW_C = 5;

//===================================================
// Field Route Init Methods
//===================================================

/** This method returns true if there is an active field route object loaded. */
micello.maps.route.FieldRoute.prototype.isActive = function() {
	return (this.fieldRoute != null);
}


/** This method updates the route display given a position update. */
micello.maps.route.FieldRoute.prototype.updateRouteDisplay = function(pos) {
	if(this.fieldRoute) {
		this.mapData.removeAnnotation("route");

		//implement this method to do any preprocessing
		this.onMeasUpdate(pos);

		//------------------
		// plot the current data
		//------------------

		//implement this to get the best current node
		var currentNode = this.getCurrentNode(pos);

		//plot the main arrow, get the start of the rest of the path
		var fieldStartNode = this.plotMainArrow(currentNode);

		//plot the rest of the path to the destination
		if(fieldStartNode) {
			var activeNodes = {};
			var levelNodes;
			var node;

			//get the path to the destination from the measurement nodes
			this.loadPathToDest(fieldStartNode,activeNodes);

			//add the overlay for each node
			for(var lk in activeNodes) {
				levelNodes = activeNodes[lk];
				for(var nk in levelNodes) {
					node = levelNodes[nk];
					this.placeOverlaysOnMap(node.overlays);
				}
			}
		}
	}
}


/** This method clears the active route. */
micello.maps.route.FieldRoute.prototype.clearFieldRoute = function() {
	//hide overlay
	this.mapData.removeAnnotation("route");
	this.fieldRoute = null;
}


/** This method reqeusts a field route to the given geometry. */
micello.maps.route.FieldRoute.prototype.requestFieldRouteToGeom = function(geom,lid,doIsoLevel) {

	//add marker, on single geometry
	var marker = {"id":geom.id,"mr":"RouteEnd","mt":1,"anm":"route"};
	this.mapData.addMarkerOverlay(marker,true);

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

	//set end
	this.getFieldRoute(ends);
}

//===================================================
// Private
//===================================================

//===================================================
// Route Display
//===================================================



/** This creates annotations for a link.
 * @private */
micello.maps.route.FieldRoute.prototype.addLinkOverlays = function(n1,n2,metersPerMap) {
	//create the route line
	var geom = {
		"lid":n1.lid,
		"zi":2,
		"gt":1,
		"shp":[[0,n1.mx,n1.my],[1,n2.mx,n2.my]],
		"p":{
			"$style":"FieldStyle"
		},
		"anm":"route",
		"anntype":micello.maps.route.FieldRoute.TYPE_GEOM_OVERLAY
	};
	n1.overlays.push(geom);

	//add arrows evenly spaced along line
	var linkLength = n1.dm - n2.dm;
	if(linkLength <= 0) return;

	var arrowDistFromN2 = Math.ceil(n2.dm / micello.maps.route.FieldRoute.FIELD_ARROW_SPACING) * micello.maps.route.FieldRoute.FIELD_ARROW_SPACING - n2.dm;
	var fracDistFromN2;
	while(arrowDistFromN2 < linkLength) {
		//add an arrow here
		fracDistFromN2 = arrowDistFromN2/linkLength;
		this.addLinkArrow(n1,n2,fracDistFromN2,metersPerMap);
		arrowDistFromN2 += micello.maps.route.FieldRoute.FIELD_ARROW_SPACING
	}
}

/** This creates the arrow for a link annotation.
 * @private */
micello.maps.route.FieldRoute.prototype.addLinkArrow = function(n1,n2,fracDistFromN2,metersPerMap) {
	//base point
	var x0 = n2.mx + fracDistFromN2 * (n1.mx - n2.mx);
	var y0 = n2.my + fracDistFromN2 * (n1.my - n2.my);

	//direction vector, in meters
	var dx = (n2.mx - n1.mx);
	var dy = (n2.my - n1.my);
	var l = Math.sqrt(dx*dx + dy*dy);
	dx = metersPerMap * dx/l;
	dy = metersPerMap * dy/l;

	//arrow coords
	var xp = x0 + micello.maps.route.FieldRoute.FIELD_ARROW_A * dx;
	var yp = y0 + micello.maps.route.FieldRoute.FIELD_ARROW_A * dy;
	var xa = x0 + micello.maps.route.FieldRoute.FIELD_ARROW_B * dx + micello.maps.route.FieldRoute.FIELD_ARROW_C * dy;
	var ya = y0 + micello.maps.route.FieldRoute.FIELD_ARROW_B * dy - micello.maps.route.FieldRoute.FIELD_ARROW_C * dx;
	var xb = x0 + micello.maps.route.FieldRoute.FIELD_ARROW_B * dx - micello.maps.route.FieldRoute.FIELD_ARROW_C * dy;
	var yb = y0 + micello.maps.route.FieldRoute.FIELD_ARROW_B * dy + micello.maps.route.FieldRoute.FIELD_ARROW_C * dx;

	//arrow
	var geom = {
		"lid":n1.lid,
		"zi":2,
		"shp":[[0,xa,ya],[1,xp,yp],[1,xb,yb],[4]],
		"p":{
			"$style":"FieldStyle"
		},
		"anm":"route",
		"anntype":micello.maps.route.FieldRoute.TYPE_GEOM_OVERLAY
	};
	n1.overlays.push(geom);
}

/** This adds annotations to a level change object.
 * @private */
micello.maps.route.FieldRoute.prototype.addLevelChangeOverlays = function(node,metersPerMap) {
	var container = node.overlays;
	this.loadLevelChangeOverlays(container,node,metersPerMap)
}

/** This creates a level chance overlays and adds them to the given array.
 * @private */
micello.maps.route.FieldRoute.prototype.loadLevelChangeOverlays = function(container,node,metersPerMap) {

	var r = 5 * metersPerMap;

	var geom = {
		"lid":node.lid,
		"zi":2,
		"gt":1,
		"shp":[[0,node.mx-r,node.my],[1,node.mx,node.my-r],[1,node.mx+r,node.my],[1,node.mx,node.my+r],[4]],
		"p":{
			"$style":"FieldStyle"
		},
		"anm":"route",
		"anntype":micello.maps.route.FieldRoute.TYPE_GEOM_OVERLAY
	};
	container.push(geom);

	if((node.msg)&&(node.gid)) {
		var inlay = {
			"id":node.gid,
			"idat":"<div>" + node.msg + "</div>",
			"anm":"route",
			"anntype":micello.maps.route.FieldRoute.TYPE_GEOM_INLAY
		};
		container.push(inlay);
	}
}

/** This adds the destination overlays.
 * @private */
micello.maps.route.FieldRoute.prototype.addDestinationOverlays = function(node) {
	var overlay = {};
	overlay.mx = node.mx;
	overlay.my = node.my;
	overlay.lid = node.lid;
	overlay.mt = micello.maps.markertype.NAMED;
	overlay.mr = "RedPin";
	overlay.anm = "route";
	overlay.anntype = micello.maps.route.FieldRoute.TYPE_MARKER_OVERLAY;
	node.overlays.push(overlay);
}

/** This plots from a given node to the destination.
 * @private */
micello.maps.route.FieldRoute.prototype.loadPathToDest = function(n,activeNodes) {

	//make sure we have a place to put this node
	var levelNodes = activeNodes[n.lid];
	if(!levelNodes) {
		levelNodes = {};
		activeNodes[n.lid] = levelNodes;
	}

	if(!levelNodes[n.ind]) {
		levelNodes[n.ind] = n;

		//see if there is a next node
		var nextNodeId = n.nn;
		//see if we reached end
		if(nextNodeId == undefined) return;
		var nextLevelId = n.nl ? n.nl : n.lid;
		var nextNode = this.lookupNode(nextNodeId,nextLevelId);

		if(nextNode) {
			//recursively continue path
			this.loadPathToDest(nextNode,activeNodes);
		}
	}
}

/** This method creates the main display arrow.
 * @private */
micello.maps.route.FieldRoute.prototype.plotMainArrow = function(currentNode) {
	var startNode = currentNode;
	var startDist = 0;

	var arrowStartInfo = this.getAheadPoint(startNode,startDist,micello.maps.route.FieldRoute.MAIN_ARROW_OFFSET);
	var arrowEndInfo = this.getAheadPoint(arrowStartInfo.startNode,arrowStartInfo.linkDist,micello.maps.route.FieldRoute.MAIN_ARROW_LENGTH);

	this.createMainArrow(arrowStartInfo,arrowEndInfo);

	//set field arrow
	var fieldStartNode = arrowEndInfo.endNode;

	//special case of a route end
	if(!fieldStartNode) {
		fieldStartNode = arrowEndInfo.startNode;
	}

	return fieldStartNode;
}

/** This gets a point on the route a given distance forward.
* It returns a structure containing the info. If the point
* is not reached, the structure contains no end node, only a start.
*  @private */
micello.maps.route.FieldRoute.prototype.getAheadPoint = function(startNode,startDist,dist) {

	var currentNode = startNode;
	var linkStartDist = startDist;
	var nextNode;
	var pointInfo;

	while(true) {

		//if the start node return that point with no end
		if(currentNode.nn == undefined) {
			pointInfo = {};
			pointInfo.startNode = currentNode;
			pointInfo.endNode = null;
			pointInfo.linkDist = 0;
			pointInfo.mx = currentNode.mx;
			pointInfo.my = currentNode.my;
			return pointInfo;
		}

		var nl = currentNode.nl ? currentNode.nl : currentNode.lid;
		nextNode = this.lookupNode(currentNode.nn,nl);

		//level change case
		if(nl != currentNode.lid) {
			pointInfo = {};
			pointInfo.startNode = currentNode;
			pointInfo.endNode = nextNode;
			pointInfo.linkDist = 0;
			pointInfo.mx = currentNode.mx;
			pointInfo.my = currentNode.my;
			return pointInfo;
		}

		var linkLength = currentNode.dm - nextNode.dm;
		if(linkLength - linkStartDist >= dist) {
			var frac = (linkStartDist + dist) / linkLength;

			//solution is on this link
			pointInfo = {};
			pointInfo.startNode = currentNode;
			pointInfo.endNode = nextNode;
			pointInfo.linkDist = frac * linkLength;
			pointInfo.mx = currentNode.mx + frac * (nextNode.mx - currentNode.mx);
			pointInfo.my = currentNode.my + frac * (nextNode.my - currentNode.my);
			return pointInfo;
		}
		else {
			//go to next link
			dist -= (linkLength - linkStartDist);
			linkStartDist = 0;
			currentNode = nextNode;
		}
	}
}

/** This method creates the renders the main display arrow.
 * @private */
micello.maps.route.FieldRoute.prototype.createMainArrow = function(arrowStartInfo,arrowEndInfo) {
	var lid = arrowStartInfo.startNode.lid;
	var level = this.lookupLevel(lid);
	var metersPerMap = level.s;

	//base point
	var x1 = arrowStartInfo.mx;
	var y1 = arrowStartInfo.my;
	var x2 = arrowEndInfo.mx;
	var y2 = arrowEndInfo.my;

	//direction vector, in meters
	var dx = (x2 - x1);
	var dy = (y2 - y1);
	var l = Math.sqrt(dx*dx + dy*dy);

	//plot the arrow only if we have a non-zero vector (so we know which way it faces)
	if(l != 0) {

		dx = metersPerMap * dx/l;
		dy = metersPerMap * dy/l;

		//arrow coords
		var xa = x2 + micello.maps.route.FieldRoute.MAIN_ARROW_B * dx + micello.maps.route.FieldRoute.MAIN_ARROW_C * dy;
		var ya = y2 + micello.maps.route.FieldRoute.MAIN_ARROW_B * dy - micello.maps.route.FieldRoute.MAIN_ARROW_C * dx;
		var xb = x2 + micello.maps.route.FieldRoute.MAIN_ARROW_B * dx - micello.maps.route.FieldRoute.MAIN_ARROW_C * dy;
		var yb = y2 + micello.maps.route.FieldRoute.MAIN_ARROW_B * dy + micello.maps.route.FieldRoute.MAIN_ARROW_C * dx;

		//shaft
		var shaft = {
			"lid":lid,
			"zi":2,
			"gt":1,
			"shp":[[0,x1,y1],[1,x2,y2]],
			"p":{
				"$style":"MainStyle"
			},
			"anm":"route",
			"anntype":micello.maps.route.FieldRoute.TYPE_GEOM_OVERLAY
		};
		this.mapData.addGeometryOverlay(shaft);

		//arrow
		var arrow = {
			"lid":lid,
			"zi":2,
			"shp":[[0,xa,ya],[1,x2,y2],[1,xb,yb],[4]],
			"p":{
				"$style":"MainStyle"
			},
			"anm":"route",
			"anntype":micello.maps.route.FieldRoute.TYPE_GEOM_OVERLAY
		};
		this.mapData.addGeometryOverlay(arrow);
	}

	//check if the end point is a level change, if so we will add a level change object
	var overlays;
	if((arrowEndInfo.endNode)&&(arrowEndInfo.startNode.lid != arrowEndInfo.endNode.lid)) {
		overlays = [];
		this.loadLevelChangeOverlays(overlays,arrowEndInfo.startNode,metersPerMap);
		this.placeOverlaysOnMap(overlays);
	}
	else if((arrowStartInfo.endNode)&&(arrowStartInfo.startNode.lid != arrowStartInfo.endNode.lid)) {
		overlays = [];
		this.loadLevelChangeOverlays(overlays,arrowStartInfo.startNode,metersPerMap);
		this.placeOverlaysOnMap(overlays);
	}
}

/** This places the annotations for a node onto the map.
 * The argument should be an array of annotations.
 *  @private */
micello.maps.route.FieldRoute.prototype.placeOverlaysOnMap = function(overlays) {
	for(var i = 0; i < overlays.length; i++) {
		var overlay = overlays[i];

		if(overlay.anntype == micello.maps.route.FieldRoute.TYPE_MARKER_OVERLAY) {
			this.mapData.addMarkerOverlay(overlays[i]);
		}
		else if(overlay.anntype == micello.maps.route.FieldRoute.TYPE_GEOM_OVERLAY) {
			this.mapData.addGeometryOverlay(overlays[i]);
		}
		else if(overlay.anntype == micello.maps.route.FieldRoute.TYPE_GEOM_INLAY) {
			this.mapData.addInlay(overlays[i]);
		}
	}
}

//=======================================================
// Node selection implemenetation
//=======================================================

/** This method does preprocessing on the measurement.
 * @private */
micello.maps.route.FieldRoute.prototype.onMeasUpdate = function(pos) {

}

/** This method returns the closest nodes.
 * @private */
micello.maps.route.FieldRoute.prototype.getCurrentNode = function(pos) {
	var dm = this.fieldRoute.d;
	var d;
	var lm;
	var l;
	var nm;
	var n;
	var metersPerMap;
	var distMeters
	var bestDist = Number.MAX_VALUE;
	var bestNode = null;

	//get the closest node
	for(var dKey in dm) {
		d = dm[dKey];
		metersPerMap = d.s;
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			if(l.lid == pos.lid) {
				nm = l.n;
				for(var nKey in nm) {
					n = nm[nKey];
					distMeters = this.getDistMeters(n.mx,n.my,pos.mx,pos.my,metersPerMap);
					if(distMeters < bestDist) {
						bestDist = distMeters;
						bestNode = n;
					}
				}
			}
		}
	}

	return bestNode;
}

//======================================================
// Utilities
//======================================================

/** This looks up a field route level object.
 * @private */
micello.maps.route.FieldRoute.prototype.lookupLevel = function(lid) {
	var dm = this.fieldRoute.d;
	var d;
	var l;
	for(var dKey in dm) {
		d = dm[dKey];
		l = d.lvl[lid];
		if(l) return l;
	}
	return null;
}

/** This looks up a field route node object.
 * @private */
micello.maps.route.FieldRoute.prototype.lookupNode = function(nid,lid) {
	var l = this.lookupLevel(lid);
	if(l) {
		return l.n[nid];
	}
	else {
		return null;
	}
}

/** This method gets the distance in meters between two points.
 * @private */
micello.maps.route.FieldRoute.prototype.getDistMeters = function(mx1,my1,mx2,my2,metersPerMap) {
	return metersPerMap * Math.sqrt(Math.pow(mx2-mx1,2) + Math.pow(my2-my1,2));
}

//======================================================
// OVERRIDES TO MAP API METHODS
//======================================================



/** This method requests a field route
 * @private */
micello.maps.route.FieldRoute.prototype.getFieldRoute = function(routeEnds) {

	var community = this.mapData.getCommunity();
	var cid = community.id;
	var path = community.path;
	var adjustments = micello.maps.routeAdjustments;

	var fieldRouteInstance = this;
	var routeCallback = function(route) {
		this.mapData.removeAnnotation("route");
		fieldRouteInstance.setFieldRoute(route);
	}
	micello.maps.route.routeRequest(cid,null,routeEnds,adjustments,"json",routeCallback,path);
}


/** This method does initial processing of the field route object. Here
 * the return value from the route callback should be
 *  @private */
micello.maps.route.FieldRoute.prototype.setFieldRoute = function(route) {
	this.fieldRoute = route;

	var dm = this.fieldRoute.d;
	var d;
	var lm;
	var l;
	var nm;
	var n,destN;
	var lid;
	var metersPerMap;
	var nodeCount = 0;
	for(var dKey in dm) {
		d = dm[dKey];
		metersPerMap = d.s;
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			//add the scale to each level
			l.s = metersPerMap;
			lid = parseInt(lKey);
			l.lid = lid;
			nm = l.n;
			for(var nKey in nm) {
				n = nm[nKey];
				nodeCount++;

				//some added info for each node
				n.lid = lid; //level id
				n.ind = parseInt(nKey); //node index (only valid with level info)
				n.measProb = 0;
				n.evolvedProb = 1; //set all nodes to the same probability - we should renormalize, but we don't really need to.

				n.overlays = [];
				var nn = n.nn;
				var nl = n.nl;
				if(!nl) {
					//non level change
					destN = nm[nn];
					if(destN) {
						//normal point
						this.addLinkOverlays(n,destN,metersPerMap);
					}
					else {
						//destination
						this.addDestinationOverlays(n);

						//place these overlays now
						this.placeOverlaysOnMap(n.overlays);
					}
				}
				else {

					//level change
					this.addLevelChangeOverlays(n,metersPerMap);
				}

			}
		}
	}
	this.numNodes = nodeCount;
}






