/**
 * This creates a MapData object to be associated with the given MapControl.
 *
 * @class This class manages the map data.
 */
micello.maps.MapData = function(mapControl,view,mapCanvas,mapGUI,mapEvent) {
	/** @private */
	this.mapControl = mapControl;

	/** @private */
	this.view = view;

	/** @private */
	this.mapCanvas = mapCanvas;

	/** @private */
	this.mapGUI = mapGUI;
        
	/** @private */
	this.mapEvent = mapEvent;

	/** @private */
	this.community = null;

	/** @private */
	this.mapVersion = undefined;

	/** @private */
	this.entityVersion = undefined;

	/** @private */
	this.currentDrawing = null;

	/** transform info
	 * @private */
	this.ti = null;

	/** @private */
	this.currentLevel = null;

	/** @private */
	this.geomMap = null;

	/** @private */
	this.addrMap = null;

	/** @private */
	this.levelMap = null;

	/** @private */
	this.drawingMap = null;

	/** @private */
	this.groupMap = null;

	/** Used for the event argument.
	 * @private */
	this.event = {};

	/** This is a container for marker overlays that don't have a matching level yet. It is
	 * assumed their drawing is not loaded.
	 * @private */
	this.unloadedMOverlays = [];

	/** This is a container for geometry overlays that don't have a matching level yet. It is
	 * assumed their drawing is not loaded.
	 * @private */
	this.unloadedGOverlays = [];

	/** This is a container for inlays that don't have a matching level yet. It is
	 * assumed their drawing is not loaded.
	 * @private */
	this.unloadedInlays = [];

	/** This counter is used for assigning ids to overlay geometry.
	 * @private */
	this.nextId = micello.maps.MapData.INITIAL_ID;
}

/** Deafult zindex for items added with illegal or missing zindex.
 * @private */
micello.maps.MapData.DEFAULT_ZINDEX = 1;
/** The initial id for assigned ids. They count down from here.
 * @private */
micello.maps.MapData.INITIAL_ID = -1;
/** The deafult theme loaded if none is found.
 * @private */
micello.maps.MapData.DEFAULT_THEME_NAME = "General";

//===========================================
// Map Accessors
// ==========================================

/** This method converts from map coordinates to latitude and longitude. The return value
 * is a vector with the components [lat,lon]. */
micello.maps.MapData.prototype.mxyToLatLon = function(mx,my) {
	if(!this.ti) return null;
	var lat = mx * this.ti.mxToLat + my * this.ti.myToLat + this.ti.lat0;
	var lon = mx * this.ti.mxToLon + my * this.ti.myToLon + this.ti.lon0;
	return [lat,lon];
}

/** This method converts from latitude and longitde to map coordinates. The return value
 * is a vector with the components [mx,my]. */
micello.maps.MapData.prototype.latLonToMxy = function(lat,lon) {
	if(!this.ti) return null;
	lat -= this.ti.lat0;
	lon -= this.ti.lon0;
	var mx = lat * this.ti.latToMx + lon * this.ti.lonToMx;
	var my = lat * this.ti.latToMy + lon * this.ti.lonToMy;
	return [mx,my];
}

/**
 * This method retrieves the current community object.
 */
micello.maps.MapData.prototype.getCommunity = function() {
	return this.community;
}

/**
 * This method retrieves the current drawing object.
 */
micello.maps.MapData.prototype.getCurrentDrawing = function() {
	return this.currentDrawing;
}

/**
 * This method retrieves the current drawing level object.
 */
micello.maps.MapData.prototype.getCurrentLevel = function() {
	return this.currentLevel;
}

/**
 * This loads the community id into the map. The arguments drawing id and level id are optional
 * and can be left as undefined or null.
 * @param {object} communityId The community ID
 * @param {object} drawingId An optional parameter to specify the drawing ID if a specific drawing is desired.
 * @param {object} levelId An optional parameter to specify the level ID if a specific level is desired.
 * @param {int} mv An optional parameter to specify the map version to load
 * @param {int} ev An optional parameter to specify the entity version to load
 */
micello.maps.MapData.prototype.loadCommunity = function(communityId,drawingId,levelId,path) {

	var mapMgr = this;
	var onDownload = function(community) {
		community.path = path;
		mapMgr.setCommunity(community,drawingId,levelId);
		mapMgr.mapGUI.hideLoading();
	}

	var onError = function(msg) {
		micello.maps.onError(mapMgr.mapEvent,msg,"micello.maps.MapData.loadCommunity >> request");
		mapMgr.setCommunity(null);
		mapMgr.mapGUI.hideLoading();
	}

	if(this.community) {

		//close the existing community
		var oldLevel = this.currentLevel;

		//clear community data
		this.community = null;
		this.mapVersion = undefined;
		this.entityVersion = undefined;
		this.initCommunity();

		//update ui
		if(oldLevel) {
			this.mapCanvas.updatelevel(null,oldLevel);
		}
		this.view.updateDrawing(null);
		this.mapGUI.closeCommunity();

		//com events -- deprecatd
		this.event.comLoad = 1;
		if(this.mapChanged) {
			this.mapChanged(this.event);
		}
		this.event.drawChange = 0;
		this.event.comLoad = 0;
		this.event.drawLoad = 0;
                

	}
        
        /* Fire the event */
        var e = {};
        e.id = Number(communityId);
        this.mapEvent.dispatchEvent('communityLoadBegin', e);
        
	this.mapGUI.showLoading();
        
	micello.maps.request.loadCommunity(communityId,onDownload,onError,path);
}


/**
 * This sets the drawing and level. If the level id is not specified, a default is used.
 * @param {Drawing} drawing The drawing object to set
 * @param {integer} levelId An optional parameter for specifying the level id.
 */
micello.maps.MapData.prototype.setDrawing = function(drawing, levelId) {
	if(!drawing) return;

	this.currentDrawing = drawing;
	this.transformInfo = null;

	//make sure the drawing is loaded
	var levels = this.currentDrawing.l;

	//initialize transform info
	this.initTransform();

	//get start level
	var level;
	var bestZ = -999999; //uh, I should have a better number here
	if(levels) {
		var i;
		var cnt = levels.length;
		for(i=0;i<cnt;i++) {
			var l = levels[i];
			if(levelId) {
				if(l.id == levelId) {
					level = l;
					break;
				}
			}
			else {
				//best level if not specified
				if(l.z < 0) {
					if(l.z > bestZ) {
						level = l;
						bestZ = l.z;
					}
				}
				else {
					if((l.z < bestZ)||(bestZ < 0)) {
						level = l;
						bestZ = l.z;
					}
				}
			}
		}
	}

	if(!level) {
		//if level specified and not found
		micello.maps.onError(this.mapEvent,"Display level not found","micello.maps.MapData.setDrawing");
	}

	this.event.drawChange = 1;

	//update view and gui
	this.view.updateDrawing(this.currentDrawing);
	this.mapGUI.updateDrawing(this.currentDrawing);

        /* Fire the event */
        this.mapEvent.dispatchEvent('drawingLoaded', this.currentDrawing);
                
	this.setLevel(level);
}

/**
 * This sets the level.
 * @param {DrawingLevel} level The level to set
 */
micello.maps.MapData.prototype.setLevel = function(level) {

	var mapData = this;
	var oldLevel = this.currentLevel;

	//check if drawing is loaded
	if(!level.gList) {
		//level geom must be loaded
		var onDownload = function(levelGeom) {
			level.levelGeom = levelGeom;
			mapData.initLevel(level);
			mapData.event.levelGeomLoad = 1;
			mapData.setLevel(level);
			mapData.mapGUI.hideLoading();
		}
		var onError = function(msg) {
			micello.maps.onError(mapData.mapEvent,msg,"micello.maps.MapData.setLevel >> onError");
			mapMgr.mapGUI.hideLoading();
		}
		this.mapGUI.showLoading();
		var did = level.drawing.id;
		var cid = level.drawing.community.id;
		var path = level.drawing.community.path;
		micello.maps.request.loadLevelGeom(cid,did,level.id,onDownload,onError,path);

		//clear the current level
		this.currentLevel = null;
		//update ui
		if(oldLevel) {
			this.mapCanvas.updatelevel(this.currentLevel,oldLevel);
		}

		return;
	}
	else {
		this.currentLevel = level;

		//update gui and canvas
		this.mapGUI.updateLevel(this.currentLevel,oldLevel);
		this.mapCanvas.updatelevel(this.currentLevel,oldLevel);

		if(this.mapChanged) {
			this.mapChanged(this.event);

			//clear old flags
			this.event.drawChange = 0;
			this.event.comLoad = 0;
			this.event.drawLoad = 0;
		}
	}
        this.mapEvent.dispatchEvent('levelLoaded', this.currentLevel);
}

//================================
// Annotation Functions
// ===============================

/** This method adds a marker overlay to the map. A marker sits above the map and is tied
 * to the map by a single point. The marker does not scale as the map zooms in and out.
 * @param {MarkerOverlay} overlay The marker overlay to add
 */
micello.maps.MapData.prototype.addMarkerOverlay = function(overlay) {
		if(!this.community) return;

	//annotation id handling
	if(!overlay.aid) {
		overlay.aid = this.createId();
	}

	//try to add this to each level (may be pn multiple, in some cases)
	var d,l;
	var id,il;
	var drawings = this.community.d;
	var levels;
	var missingLevel = false;
	var finished = false;

	for(id = 0; (id < drawings.length)&&(!finished); id++) {
		d = drawings[id];
		levels = d.l;
		for(il = 0; (il < levels.length)&&(!finished); il++) {
			l = levels[il];
			if(l.gList) {
				finished = this.addMarkerToLevel(overlay,l);
			}
			else {
				missingLevel = true;
			}
		}
	}

	if((missingLevel)&&(!finished)) {
		this.unloadedMOverlays.push(overlay);
	}

}

/**
 * This method removes one ore more overlays either by specifying the overlay annotation id
 * or by specifying the overlay group name. The overlay annotation is set internally when the
 * overlay is added. Its is given by overlay.aid or overlay["aid"]. If this is used
 * the arugment byName should be false or just left undefined(missing). If the name is given,
 * the argument byName should be true.
 * @private
 */
micello.maps.MapData.prototype.removeMarkerOverlay = function(ref,byName) {
	if(!this.community) return;
	//remove from active geometry
	var drawing;
	var level;
	var markers;
	var marker;
	var localRef;
	var cnt = this.community.d.length;
	for(var id=0;id<cnt;id++) {
		drawing = this.community.d[id];
		if(drawing.l) {
			for(var il=0;il<drawing.l.length;il++) {
				level = drawing.l[il];
				markers = level.m;
				if(markers) {
					for(var ig = 0;ig<markers.length;ig++) {
						marker = markers[ig];
						localRef = byName ? marker.anm : marker.aid;
						if(localRef == ref) {
							markers.splice(ig,1);
							ig--;
							this.mapCanvas.removeMarker(marker);
						}
					}
				}
			}
		}
	}
	//check unloaded inlays for removals
	var i=0;
	while(i<this.unloadedMOverlays.length) {
		marker = this.unloadedMOverlays[i];
		localRef = byName ? marker.anm : marker.aid;
		if(localRef == ref) {
			this.unloadedMOverlays.splice(i,1);
		}
		else i++;
	}
}

/** This method adds a geometry overlay to the map. A geometry overlay is identical
 * to geometry on the map but is added at run time. The id parameter of the overlay should
 * not be set manually. It will be set automatically by the application.
 */
micello.maps.MapData.prototype.addGeometryOverlay = function(overlay) {
	if(!this.community) return;
	if(!overlay.lid) {
		micello.maps.onError(this.mapEvent,"missing overlay level","micello.maps.MapData.addGeometryOverlay");
		return;
	}
	//set overlay zi if it is null or in the range [0,1). 
	if((!overlay.zi)||((overlay.zi >= 0)&&(overlay.zi < 1))) {
		overlay.zi = micello.maps.MapData.DEFAULT_ZINDEX;
	}
	if(!overlay.id) {
		//create annotation id if there is none, and set it as the geom id too
		overlay.aid = this.createId();
		overlay.id = overlay.aid;
	}
	else {
		//make sure this is an overlay
		if(overlay.id > micello.maps.MapData.INITIAL_ID) {
			micello.maps.onError(this.mapEvent,"Invalid overlay id","micello.maps.MapData.addGeometryOverlay");
			return;
		}
		//make sure annotation id set
		if(overlay.id != overlay.aid) {
			micello.maps.onError(this.mapEvent,"Format error on geometry overlay.","micello.maps.MapData.addGeometryOverlay");
			return;
		}
		//remove it if it already exists - we shouldn't allow this really
		var geom = this.geomMap[overlay.id];
		if(geom) {
			this.removeGeometryOverlay(geom.aid);
		}
	}

	//try to add this to each level (may be pn multiple, in some cases)
	var d,l;
	var id,il;
	var drawings = this.community.d;
	var levels;
	var finished = false;

	for(id = 0; (id < drawings.length)&&(!finished); id++) {
		d = drawings[id];
		levels = d.l;
		for(il = 0; (il < levels.length)&&(!finished); il++) {
			l = levels[il];
			if(l.id == overlay.lid) {
				if(l.gList) {
					this.placeGeomOverlayOnLevel(overlay,l);
				}
				else {
					this.unloadedGOverlays.push(overlay);
				}
				finished = true;
			}
		}
	}
}

/**
 * This method removes one more overlays either by specifying the annotation id
 * or by specifying the overlay group name. The overlay annotation is set internally when the
 * overlay is added. Its is given by overlay.aid or overlay["aid"]. If this is used
 * the arugment byName should be false or just left undefined(missing). If the name is given,
 * the argument byName should be true.
 */
micello.maps.MapData.prototype.removeGeometryOverlay = function(ref,byName) {
	if(!this.community) return;
	//remove from active geometry
	var drawing;
	var level;
	var gList;
	var removed;
	var tagName = byName ? "anm" : "aid";
	var i;
	var cnt = this.community.d.length;
	for(i=0;i<cnt;i++) {
		drawing = this.community.d[i];
		if(drawing.l) {
			var il;
			var cntl = drawing.l.length;
			for(il=0;il<cntl;il++) {
				level = drawing.l[il];
				gList = level.gList;
				if(gList) {
					do {
						removed = gList.remove(ref,tagName);
						if(removed) {
							//remove from geom map
							this.removeFromObjectMap(removed,level);
							//trigger a redraw
							this.mapCanvas.invalidateGeom(removed,removed.lid);
						}
					} while(removed);
				}
			}
		}
	}
	//check unloaded inlays for removals
	var localRef
	var overlay;
	i = 0;
	while(i<this.unloadedGOverlays.length) {
		overlay = this.unloadedGOverlays[i];
		localRef = byName ? overlay.anm : overlay.aid;
		if(localRef == ref) {
			this.unloadedGOverlays.splice(i,1);
		}
		else i++;
	}
}

/**
 * This inserts an inlay object into the the map. An inlay has the same parameters as a 
 * geometry overlay except an inlay is used to modify the parameters of an existing geometry object
 * rather than create a new one. The id paramter of the inlay determines which object is modified.
 *
 * Note that no precautions are taken
 * to prevent an inlay from being applied multiple times. If one is, they can be removed in a
 * single call by name or multiple calls of remove by inlay object.
 * @param {Inlay} inlay The inlay to add
 */
micello.maps.MapData.prototype.addInlay = function(inlay) {
	if(!this.community) return;

	//make sure needed variables are set
	if(!inlay.id) {
		micello.maps.onError(this.mapEvent,"missing inlay id","micello.maps.MapData.addInlay");
		return;
	}

	//annotation id
	if(!inlay.aid) {
		inlay.aid = this.createId();
	}

	if(!inlay.zi) inlay.zi = micello.maps.MapData.DEFAULT_ZINDEX;

	//try to add this to each level (may be pn multiple, in some cases)
	var d,l;
	var id,il;
	var drawings = this.community.d;
	var levels;
	var missingLevel = false;
	var finished = false;

	for(id = 0; (id < drawings.length)&&(!finished); id++) {
		d = drawings[id];
		levels = d.l;
		for(il = 0; (il < levels.length)&&(!finished); il++) {
			l = levels[il];
			if(l.gList) {
				finished = this.addInlayToLevel(inlay,l);
			}
			else {
				missingLevel = true;
			}
		}
	}

	if((missingLevel)&&(!finished)) {
		this.unloadedInlays.push(inlay);
	}

}

/**
 * This method removes one ore more inlays either by specifying the annotation
 * or by specifying the overlay group name. The annotation id is set internally when the
 * overlay is added. Its is given by inlay.aid or inlay["aid"]. If this is used
 * the arugment byName should be false or just left undefined(missing). If the name is given,
 * the argument byName should be true.
 */
micello.maps.MapData.prototype.removeInlay = function(ref,byName) {
	if(!this.community) return;
	var drawing;
	var level;
	var geomArray;
	var geom;
	var lcnt;
	var gcnt;
	var dcnt = this.community.d.length;
	var gList;
	//check active geometry
	for(var id=0;id<dcnt;id++) {
		drawing = this.community.d[id];
		if(drawing.l) {
			lcnt = drawing.l.length;
			for(var il=0;il<lcnt;il++) {
				level = drawing.l[il];
				gList = level.gList;
				if(gList) {
					for(gList.start(); ((geomArray = gList.currentList()) != null); gList.next()) {
						gcnt = geomArray.length;
						for(var ig=0;ig<gcnt;ig++) {
							//linear search for matching geom.
							geom = geomArray[ig];

							//remove inlay from geom
							var inlayList = geom.inlayList;
							if(inlayList) {
								var ii;
								var match;
								//remove any inlays, starting at end
								var startIndex;
								var updated = false;
								for(ii = inlayList.length - 1; ii > 0; ii--) {
									var inlayInfo = inlayList[ii];
									var inlay = inlayInfo.inlay;
									if(byName) {
										match = inlay.anm == ref;
									}
									else {
										match = inlay.aid == ref;
									}
									if(match) {
										inlayList.splice(ii,1);
										startIndex = ii;
										updated = true;
									}
								}

								//go back and update inlay from smallest index that was changed
								if(updated) {
									this.updateInlayList(geom,startIndex)
									this.mapCanvas.invalidateGeom(geom,level.id);
								}
							}
						}
					}
				}
			}
		}
	}
	//check unloaded inlays for removals
	var i = 0;
	var localRef;
	var inlay;
	while(i<this.unloadedInlays.length) {
		inlay = this.unloadedInlays[i];
		localRef = byName ? inlay.anm : inlay.aid;
		if(localRef == ref) {
			this.unloadedInlays.splice(i,1);
		}
		else i++;
	}
}

/** This method takes an annotation list object and shows the annotations on the map.
 * If the name argument is not null it will be used as the annotation name for each object. */
micello.maps.MapData.prototype.showAnnotation = function(annObj,name) {
	var go = annObj.g;
	var gi = annObj.i;
	var mo = annObj.m;

	var obj;
	var i;
	if(go) {
		for(i=0;i<go.length;i++) {
			obj = go[i];
			if(name) obj.anm = name;
			this.addGeometryOverlay(obj);
		}
	}
	if(gi) {
		for(i=0;i<gi.length;i++) {
			obj = gi[i];
			if(name) obj.anm = name;
			this.addGeometryOverlay(obj);
		}
	}
	if(mo) {
		for(i=0;i<mo.length;i++) {
			obj = mo[i];
			if(name) obj.anm = name;
			this.addMarkerOverlay(obj);
		}
	}
}


/** This method removes all annotation objects grouped by the given name.
 */
micello.maps.MapData.prototype.removeAnnotation = function(name) {
	this.removeInlay(name,true);
	this.removeGeometryOverlay(name,true);
	this.removeMarkerOverlay(name,true);
}

//=================================
// Internal Methods
//=================================

/**
 * This sets the given community. If the drawing ID and level ID are included, an effort
 * will be made to open that drawing and level of the community. Otherwise defaults will be selected.
 * @private
 */
micello.maps.MapData.prototype.setCommunity = function(community,drawingId,levelId) {
	
	if(community == null) {
		micello.maps.onError(this.mapEvent,"null community!","micello.maps.MapData.setCommunity");
		return;
	}

	this.community = community;
	this.mapVersion = this.community.mv;
	this.entityVersion = this.community.ev;
	this.initCommunity();

	//clean this up!!!
	var drawings = community.d;
	if(drawings == null) {
		micello.maps.onError(this.mapEvent,"no drawings!","micello.maps.MapData.setCommunity");
		return;
	}

	var drawing;
	var i;
	var cnt;
	if(drawingId) {
		cnt = drawings.length;
		for(i=0;i<cnt;i++) {
			if(drawings[i].id == drawingId) {
				drawing = drawings[i];
			}
		}
	}
	if(!drawing) {
		cnt = drawings.length;
		for(i=0;i<cnt;i++) {
			if(drawings[i].r) {
				drawing = drawings[i];
			}
		}
	}

	if(!drawing) {
		micello.maps.onError(this.mapEvent,"no root drawing found","micello.maps.MapData.setCommunity");
		this.currentDrawing = null;
		return;
	}

	//flag the community load
	this.event.comLoad = 1;
        this.mapEvent.dispatchEvent('communityLoaded', this.community);
        
	//update gui
	this.mapGUI.updateCommunity(this.community);

	this.setDrawing(drawing,levelId);
}

//---------------
// Internal annotation methods
//---------------

/** This adds the marker to a single level. The return value is true if
 * the marker does not need to be added to any other levels. False is
 * returned if it is not known if the marker is on any other levels.
 * To call this function, it should be verified the level is loaded.
 * @private */
micello.maps.MapData.prototype.addMarkerToLevel = function(overlay, level) {
	var g;
	var igr;
	var groupList;
	var activeOverlay;
	var finished = false;

	//if no level info, get it from geom (or address in the future)
	if(!overlay.lid) {
		if(!overlay.iso) {
			groupList = level.groupMap[overlay.id];
		}
		if(groupList) {
			//add to each geometry in group;
			for(igr=0;igr<groupList.length;igr++) {
				g = groupList[igr];
				//create a copy of the marker for this geometry
				activeOverlay = this.getCopy(overlay);
				activeOverlay.id = g.id;
				activeOverlay.lid = null; //clear this so we know if it was not loaded
				this.loadLocationFromGeomAndLevel(activeOverlay,g,level);
			}
		}
		else {
			//this is a single geom or otherwise non-group overlay

			g = level.geomMap[overlay.id];
			if(g) {
				//add overlay
				activeOverlay = overlay;
				this.loadLocationFromGeomAndLevel(activeOverlay,g,level);

				//flag as finished!
				finished = true;
			}
		}
	}
	else {
		if(level.id == overlay.lid) {
			activeOverlay = overlay;
			finished = true;
		}
	}

	if((activeOverlay)&&(activeOverlay.lid)) {
		this.placeMarkerOnLevel(activeOverlay,level);
	}

	return finished;
}


/** This method adds a overlay that has been verified to have a geom id, to the geometry.
 * @private
 */
micello.maps.MapData.prototype.loadLocationFromGeomAndLevel = function(overlay,geom,level) {

	//get coordinates from geom
	if((geom.mx)&&(geom.my)) {
		overlay.mx = geom.mx;
		overlay.my = geom.my;
	}
	else {
		//micello.maps.onError(this.mapEvent,"no geometry coordinates","micello.maps.MapData.loadLocationFromGeomAndLevel");
		return;
	}

	//get level from geom
	overlay.lid = level.id;
}

/** This method adds a overlay to the given level, once a position is found.
 * @private
 */
micello.maps.MapData.prototype.placeMarkerOnLevel = function(overlay,level) {

	//add to object map
	if(!level.m) {
		//add marker array for this level
		level.m = [overlay];
	}
	else {
		//add to marker array
		level.m.push(overlay);
	}

	this.mapCanvas.addMarker(overlay);

}



/** This adds the marker to a single level. The return value is true if
 * the marker does not need to be added to any other levels. False is
 * returned if it is not known if the marker is on any other levels.
 * To call this function, it should be verified the level is loaded.
 * @private
 * */
micello.maps.MapData.prototype.addInlayToLevel = function(inlay, level) {
	var g;
	var igr;
	var groupList;
	var activeInlay;
	var finished = false;

	//if no level info, get it from geom (or address in the future)

	if(!inlay.iso) {
		groupList = level.groupMap[inlay.id];
	}
	if(groupList) {
		//add to each geometry in group;
		for(igr=0;igr<groupList.length;igr++) {
			g = groupList[igr];
			//create a copy of the marker for this geometry
			activeInlay = this.getCopy(inlay);
			activeInlay.id = g.id;
			this.addIndividualInlay(activeInlay,g,level);
		}
	}
	else {
		//this is a single geom or otherwise non-group overlay

		g = level.geomMap[inlay.id];
		if(g) {
			//add overlay
			activeInlay = inlay;
			this.addIndividualInlay(activeInlay,g,level);

			//flag as finished!
			finished = true;
		}
	}

	return finished;
}

/** This adds an inlay to a single geometry, without checks.
 * @private */
micello.maps.MapData.prototype.addIndividualInlay = function(inlay,g,level) {

	if(!g.inlayList) {
		//add the base inlay info
		var props = g.p;
		if(!props) props = {};
		g.inlayList = [{"props":props}];
	}

	var inlayList = g.inlayList;

	var i;
	var inlayInfo;
	var addIndex = 0; //0 is invalid add location
	for(i = 1; i < inlayList.length; i++) {
		inlayInfo = inlayList[i];
		if(inlay.zi < inlayInfo.inlay.zi) {
			addIndex = i;
			break;
		}
	}
	if(addIndex == 0) {
		addIndex = inlayList.length;
	}
	
	//get new inlay info
	var newInlayInfo = {"inlay":inlay};
	inlayList.splice(i,0,newInlayInfo);
	//redo this and all later inlays
	this.updateInlayList(g,addIndex);
	//invalidate the goemetry
	this.mapCanvas.invalidateGeom(g,level.id);
}

/** This updates the geometry by executing the inlay at the start index and all later ones.
 * @private
 * */
micello.maps.MapData.prototype.updateInlayList = function(mapGeom,startIndex) {
	var inlayList = mapGeom.inlayList;
	var inlayInfo;
	var i;
	var prevInlay = inlayList[startIndex - 1];
	var oldProps = prevInlay.props;
	if(startIndex == inlayList.length) {
		//just restore the latest properties
		inlayInfo = inlayList[startIndex - 1];
	}
	else {
		//we need to reapply some of the inlays
		for(i = startIndex; i < inlayList.length; i++) {
			//update this inlay
			inlayInfo = inlayList[i];
			this.applyInlay(oldProps,inlayInfo);
			//prepare for next
			oldProps = inlayInfo.props;
		}
	}
	mapGeom.p = inlayInfo.props;
}

/**
 * This method processes an inlay for the given geometry.
 * @private
 */
micello.maps.MapData.prototype.applyInlay = function(oldProps,inlayInfo) {
	var newProps;
	var i;
	var inlay = inlayInfo.inlay;
	//replace
	if(inlay.pr) {
		newProps = inlay.pr;
	}
	else {
		newProps = this.getCopy(oldProps);
	}
	//override
	if(inlay.po) {
		for(i in inlay.po) {
			newProps[i] = inlay.po[i];
		}
	}
	//delete
	if(inlay.pd) {
		for(i = 0; i < inlay.pd.length; i++) {
			delete newProps[inlay.pd[i]];
		}
	}
	//store the old info
	inlayInfo.props = newProps;
}

/** This adds a geomery overlay to a level. The overlay should be for this
 *level and the level should be loaded.
 * @private
 * */
micello.maps.MapData.prototype.placeGeomOverlayOnLevel = function(overlay, level) {
	//add to object map
	this.addToObjectMap(overlay,level);
	//put in level
	level.gList.add(overlay);
	this.mapCanvas.invalidateGeom(overlay,overlay.lid);
}


/**
 * This method makes a copy of an object.
 * @private
 */
micello.maps.MapData.prototype.getCopy = function(obj) {
	var newObj = new Object();
	var i;
	for(i in obj) {
		newObj[i] = obj[i];
	}
	return newObj;
}

//-----------------------
// general
//-----------------------

/**
 * This method clears and reloads the object maps for the community, and does
 * any other needed initialization. It can also be called to cleaer all community info from
 * this object if the community is null.
 * @private
 */
micello.maps.MapData.prototype.initCommunity = function() {
	//clear old variables
	this.currentLevel = null;
	this.currentDrawing = null;
	this.geomMap = {};
	this.levelMap = {};
	this.drawingMap = {};
	this.groupMap = {};
	this.unloadedMOverlays = [];
	this.unloadedGOverlays = [];
	this.unloadedInlays = [];

	var d;
	if((this.community)&&(this.community.d)) {
		//get drawing list
		var i;
		var cnt = this.community.d.length;
		for(i=0;i<cnt;i++) {
			d = this.community.d[i];
			d.community = this.community;
			this.initDrawing(d);
		}
	}

}

/**
 * This method initializes the levels in a drawing
 * @private
 */
micello.maps.MapData.prototype.initDrawing = function(drawing) {
	var l;

	this.drawingMap[drawing.id] = drawing;
	//if loaded, get the levels
	if(drawing.l) {
		var il;
		var cntl = drawing.l.length;
		for(il=0;il<cntl;il++) {
			l = drawing.l[il];
			if(l.id) {
				l.drawing = drawing;
				this.levelMap[l.id] = {"l":l, "d":drawing};
			}
		}
	}
}

/**
 * This method initializes the entities for a drawing.
 * @private
 */
micello.maps.MapData.prototype.initEntities = function(drawingEntities) {
	var d;
	var entity;

	d = this.drawingMap[drawingEntities.id];
	d.entities = drawingEntities;
	for(var i = 0; i < drawingEntities.e.length; i++) {
		entity = drawingEntities.e[i];
		entity.g = [];
	}

	
	var l;
	for(var i = 0; i < d.l.length; i++) {
		l = d.l[i];
		this.matchLevel(l);
	}
}

/**
 * This method imatches the level to the entities for the drawing.
 * @private
 */
micello.maps.MapData.prototype.matchLevel = function(level) {
	//make sure the level has been initialized
	if(!level.gList) return;

	var drawingEntities = level.drawing.entities;

	var entity;
	//if loaded, get the levels
	for(var i = 0; i < drawingEntities.e.length; i++) {
		entity = drawingEntities.e[i];
		//match main addresses
		if(entity.a) {
			this.entityMatchLookup(entity,entity.a,level,true);
		}
		//match internal addresses
		if(entity.ia) {
			this.entityMatchLookup(entity,entity.ia,level,false);
		}
	}
}

/**
 * Match entity and geom.
 * @private
 */
micello.maps.MapData.prototype.entityMatchLookup = function(entity,addresses,level,isMainAddress) {
	var geom;
	var geomList;
	var address;

	for(var j = 0; j < addresses.length; j++) {
		address = addresses[j];
		geom = null;
		geomList = null;

		//match this address
		if(address.substr(0,3) === "$id") {
			//id address
			var idString = address.substr(4);
			//first check if this is grouped
			geomList = level.groupMap[idString];
			geom = level.geomMap[idString];
		}
		else {
			geom = level.addressMap[address];
		}

		if(geomList) {
			//match to all in list
			for(var ig = 0; ig < geomList.length; ig++) {
				geom = geomList[ig];
				this.entityGeomMatch(entity, geom, isMainAddress, level);
			}
		}
		else if(geom) {
			//match to this geom
			this.entityGeomMatch(entity, geom, isMainAddress, level);
		}
	}
}

/**
 * Match entity and geom.
 * @private
 */
micello.maps.MapData.prototype.entityGeomMatch = function(entity,geom,isMain,level) {
	if(isMain) {
		entity.g.push(geom);
		if(!geom.me) {
			geom.me = [];
		}
		geom.me.push(entity);
	}
	else {
		entity.ig.push(geom);
		if(!geom.ie) {
			geom.ie = [];
		}
		geom.ie.push(entity);
	}
	this.mapCanvas.invalidateGeom(geom,level.id);
}

/**
 * This method initializes the geometry in a level.
 * @private
 */
micello.maps.MapData.prototype.initLevel = function(level) {
	var g;
	var levelGeom = level.levelGeom;
	var temp;
	if(levelGeom) {
		//initialize the zlist for this level
		level.gList = new micello.maps.ZList(levelGeom.g);
		level.geomMap = {};
		level.addressMap = {};
		level.groupMap = {};
		//create object maps
		var ig;
		var cntg = levelGeom.g.length;
		for(ig=0;ig<cntg;ig++) {
			g = levelGeom.g[ig];

			//initialize shape type and geom type
			this.initShape(g);

			//geom map
			level.geomMap[g.id] = g;
			g.lvl = level;

			//address map
			if(g.a) {
				var fa = micello.maps.createFullAddress(g.a);
				level.addressMap[fa] = g;
			}

			//group map (geometries from a given group on this level)
			//there really should only be one per level,
			//but we will allow for multiple
			if(g.gid) {
				temp = level.groupMap[g.gid];
				if(temp) {
					temp.push(g);
				}
				else {
					temp = [g];
					level.groupMap[g.gid] = temp;
				}
			}
		}

		//matching
		if(level.drawing.entities) {
			//if entities are present match them
			this.matchLevel(level);
		}
		else {
			//request entities
			//level geom must be loaded
			var mapData = this;
			var onDownload = function(drawingEntities) {
				mapData.initEntities(drawingEntities);
			}
			var onError = function(msg) {
				micello.maps.onError(mapData.mapEvent,msg,"micello.maps.MapData.initLevel >> onError");
			}
			var did = level.drawing.id;
			var cid = level.drawing.community.id;
			var path = level.drawing.community.path;

			micello.maps.request.loadDrawingEntity(cid,did,onDownload,onError,path);
		}

		//add unloaded annotations
		var i;
		var a;

		if(this.unloadedMOverlays.length > 0) {
			for(i = 0; i < this.unloadedMOverlays.length; i++) {
				a = this.unloadedMOverlays[i];
				this.addMarkerToLevel(a,level);
			}
		}

		if(this.unloadedGOverlays.length > 0) {
			for(i = 0; i < this.unloadedGOverlays.length; i++) {
				a = this.unloadedGOverlays[i];
				if(a.lid == level.id) {
					this.placeGeomOverlayOnLevel(a,level);
				}
			}
		}

		if(this.unloadedInlays.length > 0) {
			for(i = 0; i < this.unloadedInlays.length; i++) {
				a = this.unloadedInlays[i];
				this.addInlayToLevel(a,level);
			}
		}
	}
}

/** This method makes sure the shape has the proepr information.
 * @private */
micello.maps.MapData.prototype.initTransform = function() {
	var ti = {};
	var t = this.currentDrawing.t;
	ti.mxToLon = t[0];
	ti.myToLon = t[2];
	ti.mxToLat = t[1];
	ti.myToLat = t[3];
	ti.lon0 = t[4];
	ti.lat0 = t[5];

	var det = ti.mxToLon * ti.myToLat - ti.mxToLat * ti.myToLon;
	ti.lonToMx = ti.myToLat / det;
	ti.lonToMy = -ti.mxToLat / det;
	ti.latToMx = -ti.myToLon / det;
	ti.latToMy = ti.mxToLon / det;

	this.ti = ti;
}

/** This method makes sure the shape has the proepr information.
 * @private */
micello.maps.MapData.prototype.initShape = function(geom) {
	//initialize shape type and geom type - apply defaults if they are missing
	if(geom.st == null) {
		if(geom.shp) geom.st = 2; //path
		else geom.st = 0;
	}
	if(geom.gt == null) {
		if(geom.st != 0) geom.gt = 2; //area
		else geom.gt = 0;
	}
}
/** This method adds an geometry overlay to the geometry object map.
 * @private */
micello.maps.MapData.prototype.addToObjectMap = function(overlay,level) {
	if(!overlay.id) return;

	//initialize shape type and geom type
	this.initShape(overlay);

	level.geomMap[overlay.id] = overlay;
	overlay.lvl = level;

	//save the group info
	if(overlay.gid) {
		var temp = level.groupMap[overlay.gid];
		if(temp) {
			temp.push(overlay);
		}
		else {
			temp = [overlay];
			level.groupMap[overlay.gid] = temp;
		}
	}
}

/** This method removes an geometry overlay object from the geometry object map.
 * @private */
micello.maps.MapData.prototype.removeFromObjectMap = function(overlay,level) {
	if(!overlay.id) return;

	//check if entry exists - geom can be on two levels
	delete level.geomMap[overlay.id];
	delete overlay.lvl;

	//save the group info
	if(overlay.gid) {
		var list = level.groupMap[overlay.gid];
		if(list) {
			var i;
			var newList = [];
			for(i = 0; i < list.length; i++) {
				if(list[i] != ovelay.id) newList.push(list[i]);
			}
		}
		if(newList.length == 0) delete this.groupMap[overlay.gid];
		else level.groupMap[overlay.gid] = newList;
	}
}

/** This method gets the geometry group list for a given geometry.
 * @private */
micello.maps.MapData.prototype.getGeometryGroupList = function(geomId) {
	var lookupGeomInfo = this.geomMap[geomId];
	var lookupGeom = null;
	if(lookupGeomInfo) lookupGeom = lookupGeomInfo.g;

	if((lookupGeom)&&(lookupGeom.gid)) {
		return this.groupMap[lookupGeom.gid];
	}
	else return null;
}

/** This method returns an unused id.
 * @private
 */
micello.maps.MapData.prototype.createId = function() {
	return this.nextId--;
}


