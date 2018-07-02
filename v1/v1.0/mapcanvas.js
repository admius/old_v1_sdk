/**
 * This constructor takes the map control, canvas element and view for the
 * map. It should not be called explicitly. It should be called by the map control.
 *
 * @class This class manages rendering the map. It takes source map data from the MapData object,
 * including any annotations (overlays and inlays), and it presents a view of the map as defined from
 * the MapView object. The MapTheme is controlled from the MapCanvas Object.
 * NOTE: Severa constants defined in the constandts
 * file are hardcoded here for performance reasons, rather than using the value assigned to the
 * constant.
 */
micello.maps.MapCanvas = function(mapControl,mapElement,mapEvent) {

	/** @private */
	this.TILE_SIZE = 256;
	/** @private */
	this.DRAW_WAIT = 10;
	/** @private */
	this.TILE_FACTOR = 2;
	/** @private */
	this.IMAGE_DRAW_WAIT = 500;

	/** This is the map control
	 * @private */
	this.mapControl = mapControl;
        
	/** This is the map event handler
	 * @private */
	this.mapEvent = mapEvent;

	//this is needed for the renderer
	var instance = this;
	var redrawMap = function() {
		micello.maps.asynchDraw.waitDraw(instance,instance.IMAGE_DRAW_WAIT,mapControl.mapName);
	}

	/** This is the map renderer
	 * @private */
	this.mapRenderer = new micello.maps.MapRenderer(redrawMap);

	/** This is the map view.
	 * @private */
	this.view = null;

	/** This is the map data.
	 * @private */
	this.data = null;

	/** This is the element which holds the map. */
	this.mapElement = mapElement;

	/** This is the list of tiles
	 * @private */
	this.tileMap = {};

	/** This is the theme map.
	 * @private */
	this.themeMap = null;

	/** These are the popups that are on the map.
	 * @private */
	this.popups = [];

	/**
	 * This method is a callback for when the user clicks on the map. It is called after the low level
	 * mouse click obejct is processed to see which map object is clicked.
	 * @param {number} mapX The X coordinate clicked in map space.
	 * @param {number} mapY The X coordinate clicked in map space.
	 * @param {Object} This is a map object that was clicked by the mouse. It will be either
	 * a geometry or a marker.
	 * @event  */
	this.onMapClick = null;

	/** @private */
	this.minMapX = 0;
	/** @private */
	this.minMapY = 0;
	/** @private */
	this.maxMapX = 0;
	/** @private */
	this.maxMapY = 0;

}

/** This is the default zindex for a marker.
 * @private */
micello.maps.MapCanvas.DEFAULT_MARKER_ZI = 1;

//=================================
//public functions
//=================================

micello.maps.MapCanvas.prototype.getMapRenderer = function() {
	return this.mapRenderer;
}

micello.maps.MapCanvas.prototype.setThemeMap = function(themeMap) {
	this.themeMap = themeMap;
	this.mapRenderer.setThemeMap(themeMap);
}

/**
 * This method creates a popup which is tied to the map. This method should be used
 * rather than the constructor for the popup in order to instatiate a popup.
 * This does not make the popup visible. Control of the popup is done through the popup methods.
 * @returns {MapPopup} A new map popup object
 */
micello.maps.MapCanvas.prototype.createPopup = function() {
	var popup = new micello.maps.MapPopup(this,this.mapElement,this.view);
	this.popups.push(popup);
	return popup;
}

/**
 * This method removes a popup from the map. This method is not intended to hide
 * a popup. For control of the popup itself see the popup interface. Once a popup is
 * removed from the map it can not be added again.
 * @param {MapPopup} popup The popup to remove
 */
micello.maps.MapCanvas.prototype.removePopup = function(popup) {
	popup.setActive(false);
	var i;
	var cnt = this.popups.length;
	for(i=0;i<cnt;i++) {
		if(this.popups[i] == popup) this.popups.splice(i,1);
	}
}

/** This method clears any cached render data. It should be called when the
 * theme or theme map is changed.
 */
micello.maps.MapCanvas.prototype.clearRenderCache = function() {
	var community = this.data.getCommunity();
	if(community) {
		var drawings = community.d;
		for(var id = 0; id < drawings.length; id++) {
			var drawing = drawings[id];
			var levels = drawing.l;
			for(var il = 0; il < levels.length; il++) {
				var level = levels[il];
				for(var gid in level.geomMap) {
					var geom = level.geomMap[gid];
					delete geom.renderCache;
				}
			}
		}
		//trigger a fresh draw
		mapCanvas.clearTileCache();
		mapCanvas.drawMap();
	}
}

//=================================
//private functions
//=================================

// redraw

/** This method triggers a redraw of the map. It will only redraw
 * tiles in the screen view that are either missing or invalidated.
 * The draw is done asynchronously. The theme must be set before the
 * draw will occur.
 * @private */
micello.maps.MapCanvas.prototype.drawMap = function() {
	micello.maps.asynchDraw.waitDraw(this,this.DRAW_WAIT,this.mapControl.mapName);
}

//markers

/**
 * This method adds a marker to the map display, creating an HTML element for it.
 * Visibility of the marker is managed by the map canvas according to the active level.
 * @param {MarkerOverlay} marker The marker to add
 * @private
 */
micello.maps.MapCanvas.prototype.addMarker = function(marker) {
	if(!marker.mr) return;

	var mrkr;
	if(marker.mt == micello.maps.markertype.NAMED) {
		//lookup marker from theme
		if((this.themeMap)&&(this.themeMap.isLoaded())) {
			mrkr = this.themeMap.getMarker(marker.mr);
		}
	}
	else if(marker.mt == micello.maps.markertype.IMAGE) {
		//marker provided
		mrkr = marker.mr;
	}

	if(mrkr) {
		var element = document.createElement("img");
		var url = micello.maps.request.fixProtocol(mrkr.src);
		element.src = url;
		element.mapTarget = true;
		element.mapObject = marker;
		element.id = "marker" + marker.aid;

		element.onmousedown = function(e) {
			if(e.preventDefault) e.preventDefault();
		}

		marker.cx = 0;
		marker.cy = 0;
		if(mrkr.ox != null) marker.ox = mrkr.ox;
		else marker.ox = 0;
		if(mrkr.oy != null) marker.oy = mrkr.oy;
		else marker.oy = 0;
		if(marker.zi == null) marker.zi = micello.maps.MapCanvas.DEFAULT_MARKER_ZI;
		marker.element = element;

		element.style.position = "absolute";
		element.style.zIndex = marker.zi;
		element.style.top = "0px";
		element.style.left = "0px";

		//this is the html default, we will overwrite it immediately
		marker.visible = true;

		//check if we need to show this item
		var currentLevel = this.data.getCurrentLevel();
		this.updateMarker(marker,currentLevel);
		this.mapElement.appendChild(element);
	}

}

/** This method updates a marker for a change in level or zoom.
 * @private */
micello.maps.MapCanvas.prototype.updateMarker = function(marker,level) {
	if((!level)||(level.id != marker.lid)) {
		//make not visible if necessary
		if(marker.visible) {
			marker.visible = false;
			marker.element.style.display = "none";
		}
	}
	else if(marker.element) {
		//make it visible if necessary
		if(!marker.visible) {
			marker.visible = true;
			marker.element.style.display = "block";
		}

		//update position if necessary
		var containerX = this.view.mapToCanvasX(marker.mx,marker.my);
		var containerY = this.view.mapToCanvasY(marker.mx,marker.my);
		if((containerX != marker.cx)||(containerY != marker.cy)) {
			marker.element.style.left = String(containerX - marker.ox) + "px";
			marker.element.style.top = String(containerY - marker.oy) + "px";
			marker.cx = containerX;
			marker.cy = containerY;
		}
	}
}

/**
 * This method removes a marker from the map.
 * @param {MarkerOverlay} marker The marker to remove
 * @private
 */
micello.maps.MapCanvas.prototype.removeMarker = function(marker) {
	if (marker.element) this.mapElement.removeChild(marker.element);
	//remove the reference to the img element
	delete marker.element;
}

/** This method returns the center X Map coordinate for a marker. It returns Number.NaN if
 * the value could not be calculated.
 * @private */
micello.maps.MapCanvas.prototype.getMarkerCenterX = function(marker) {
	if((!marker.ox)||(!marker.element)) return Number.NaN;
	return marker.mx - marker.ox + marker.element.offsetWidth/2;
}

/** This method returns the center Y Map coordinate for a marker. It returns Number.NaN if
 * the value could not be calculated.
 * @private */
micello.maps.MapCanvas.prototype.getMarkerCenterY = function(marker) {
	if((!marker.oy)||(!marker.element)) return Number.NaN;
	return marker.my - marker.oy + marker.element.offsetHeight/2;
}

/**
 * This method updates the location and visible status of the popups. It should
 * be called when the level changes or the zoom changes. The currentLevel should be the active
 * level. The oldLevel should be the previous level if the level changed, otherwise it should be null.
 * @private */
micello.maps.MapCanvas.prototype.updateDomOverlays = function(currentLevel,oldLevel) {
	var i;
	var markers;
	var cnt = this.popups.length;
	for(i=0;i<cnt;i++) {
		this.popups[i].update();
	}
	if(currentLevel) {
		markers = currentLevel.m;
		if(markers) {
			cnt = markers.length;
			for(i=0;i<cnt;i++) {
				this.updateMarker(markers[i],currentLevel);
			}
		}
	}
	if(oldLevel) {
		markers = oldLevel.m;
		if(markers) {
			cnt = markers.length;
			for(i=0;i<cnt;i++) {
				this.updateMarker(markers[i],currentLevel);
			}
		}
	}
}

// redraw trigger methods

/** This method invalidates the map for the given geometry object. This will force a redraw of a tile.
 * @private */
micello.maps.MapCanvas.prototype.invalidateGeom = function(geom,lid) {

	//clear the render cache
	delete geom.renderCache;

	//make sure we have the bounding box
	if(!geom.mm) {
		this.mapRenderer.loadGeomMinMax(geom);
	}

	var tile;
	var mapChanged = false;
	for(var i in this.tileMap) {
		tile = this.tileMap[i];
		if((tile.lid == lid)&&(!tile.invalid)&&(tile.mapIntersects(geom.mm))) {
			tile.invalid = true;
			if(tile.connected) {
				mapChanged = true;
			}
		}
	}
	if(mapChanged) {
		//asynchronous redraw
		this.drawMap();
	}
}

/** This method should be called if the level is updated.
 * @private */
micello.maps.MapCanvas.prototype.updatelevel = function(currentLevel,oldLevel) {
	this.updateDomOverlays(currentLevel,oldLevel);
	if(currentLevel) this.drawMap();
	else this.clearCanvas();
}

/** This map should be called when the map is panned with the new coordinates of the view window
 * in map div element coordinates. This will check if any redraw needs to be done.
 * @private */
micello.maps.MapCanvas.prototype.onPan = function(minPixX,minPixY,maxPixX,maxPixY) {
	if((minPixX < this.minPixX)||(minPixY < this.minPixY)||
		(maxPixX > this.maxPixX)||(maxPixY > this.maxPixY)) {
		//map needs to be updated
		this.drawMap();
	}
}

/** This map should be called when the zoom changes, so the screen can be redrawn and popups recalculated.
 * If the view is panned and zoomed, only this function needs to be called instead of calling it and on pan.
 * @private */
micello.maps.MapCanvas.prototype.onZoom = function() {
	//remvoe the tiles
	this.prepareZoomCache();
	this.updateDomOverlays(this.data.getCurrentLevel(),null);
	this.drawMap();
}

/** Sets the intermediate state for a zoom transition. */
micello.maps.MapCanvas.prototype.prepareZoomCache = function() {
	if(micello.maps.MapGUI.setCssScale) {
		this.zoomCached = true;
		var newZoom = this.view.getZoom();
		for(var i in this.tileMap) {
			tile = this.tileMap[i];
			if(tile.connected) {
				tile.setZoomCache(newZoom);
			}
		}
	}
	else {
		//if no css scale, just remove old images
		var tile;
		for(var i in this.tileMap) {
			tile = this.tileMap[i];
			if(tile.connected) {
				tile.disconnect();
			}
		}
	}
}

/** Clears the intermediate state from a zoom transition. */
micello.maps.MapCanvas.prototype.clearZoomCache = function() {
	if(micello.maps.MapGUI.setCssScale) {
		this.zoomCached = false;
		for(var i in this.tileMap) {
			tile = this.tileMap[i];
			if(tile.zoomCache) {
				tile.clearZoomCache(true);
			}
		}
	}
}


//rendering functions

/** This method is called asynchronously to do the draw.
 * @private */
micello.maps.MapCanvas.prototype.drawMapExe = function() {
	if(!this.themeMap) return;
	
	var mapUpdated = false;

	//get the current level info
	var level = this.data.getCurrentLevel();
	if(!level) return;

	//init
	var mapElementWidth = this.mapElement.offsetWidth;
	var mapElementHeight = this.mapElement.offsetHeight;

	var viewportWidth = this.view.getViewportWidth();
	var viewportHeight = this.view.getViewportHeight();
	var mapToCanvasTransform = this.view.getM2C();

	//get the range of tiles to map
	var displayX = this.view.getViewportX();
	if(displayX < 0) displayX = 0;
	var displayY = this.view.getViewportY();
	if(displayY < 0) displayY = 0;
	var displayMaxX = displayX + viewportWidth;
	if(displayMaxX > mapElementWidth) displayMaxX = mapElementWidth;
	var displayMaxY = displayY + viewportHeight;
	if(displayMaxY > mapElementHeight) displayMaxY = mapElementHeight;

	//get the active tile range
	var minX = Math.floor(displayX / this.TILE_SIZE);
	var minY = Math.floor(displayY / this.TILE_SIZE);
	var maxX = Math.floor(displayMaxX / this.TILE_SIZE);
	var maxY = Math.floor(displayMaxY / this.TILE_SIZE);

//clean this all up
this.minPixX = minX * this.TILE_SIZE;
this.minPixY = minY * this.TILE_SIZE;
this.maxPixX = (maxX + 1) * this.TILE_SIZE;
this.maxPixY = (maxY + 1) * this.TILE_SIZE;

var maxTileCount = (maxX - minX + 1)*(maxY - minY + 1) * this.TILE_FACTOR;

	//working variables
	var key;
	var tile;
	var timeStamp = new Date().getTime();
	var redrawTile = null;
	var createX;
	var createY;
	var createKey = null;

	//lookup the active tiles
	for(var x = minX; x <= maxX; x++) {
		for(var y = minY; y<= maxY; y++) {
			key = micello.maps.MapTile.getKey(this.view,level.id,x,y);
			tile = this.tileMap[key];
			if(tile) {
				//active tile found
				//update timestamp
				tile.timeStamp = timeStamp;
				if(tile.zoomCache) {
					tile.clearZoomCache(false);
				}

				//check if a redraw is needed
//update redraw choice logic!!!
				if(tile.invalid) {
					//tile invalidated
					if(!redrawTile) {
						redrawTile = tile;
					}
				}
				else if(!tile.connected) {
					//tile valid but disconnected - connect it
					tile.connect();
				}
			}
			else {
				//tile not found - make this tile, either from an old, unused tile or a new instantiation
//update draw tile choice logic - record last tile to create
				createX = x;
				createY = y;
				createKey = key;
			}
		}
                
	}

	if((this.zoomCached)&&(!redrawTile)&&(!createKey)) {
		this.clearZoomCache();
	}
	//disconnect unneeded
	//if we need a tile, get one - also, remove any unused tiles
	//(and get some other info in case it is needed)
	var oldestTime;
	var srcTile = null;
	var tileCount = 0;

	for(var i in this.tileMap) {
		tileCount++;
		tile = this.tileMap[i];
		if((tile.timeStamp < timeStamp)&&(!tile.zoomCache)) {
			//unused tile
			if(tile.connected) {
				//disconnect it
				tile.disconnect();
			}
			//find the oldest unused tile
			if((!srcTile)||(tile.timeStamp < oldestTime)) {
				oldestTime = tile.timeStamp;
				srcTile = tile;
			}
		}
	}

	//process
	if(redrawTile) {
		//redraw the tile if there are any to redraw
		this.mapRenderer.drawTile(level,redrawTile,mapToCanvasTransform);
		mapUpdated = true;
	}
	else if(createKey != null) {
		if((!srcTile)||(tileCount < maxTileCount)) {
			//no unused tiles found, create a new one
//we need logic to decide ho many extra tiles to create - now we have none, until the window shrinks
			srcTile = new micello.maps.MapTile(this.mapElement,this.TILE_SIZE,this.TILE_SIZE,0);
		}
		else {
			//an unused tile found,delete it from its key and use it
			delete this.tileMap[srcTile.key];
		}

		//save this to the map
		srcTile.init(this.view,level.id,createX,createY);
		this.tileMap[srcTile.key] = srcTile;

		//call the asynchronous draw (if needed, tile will be added there)
		this.mapRenderer.drawTile(level,srcTile,mapToCanvasTransform);
		mapUpdated = true;
	}
        
	//if we updated the map, check if we need anymore updates
	if(mapUpdated) {
		this.drawMap();
	}
        
}

/** This method clears all tiles from the screen.
 * @private */
micello.maps.MapCanvas.prototype.clearTileCache = function() {
	for(var i in this.tileMap) {
		var tile = this.tileMap[i];
		tile.invalid = true;
		tile.connected = false;
	}
}

/** This method clears all tiles from the screen.
 * @private */
micello.maps.MapCanvas.prototype.clearCanvas = function() {
	for(var i in this.tileMap) {
		tile = this.tileMap[i];
		if(tile.connected) {
			//disconnect it
			tile.disconnect();
		}
	}
}


//-------------------------
// Click Handlers
//-------------------------

/**
 * This function takes a mouse click in view box coordinates from the UI and processes it. If an element
 * was clicked that is defined from map object, then the map object is passed in the argument.
 * @private
 */
micello.maps.MapCanvas.prototype.clickMouse = function(mapScreenX,mapScreenY,mapObject) {

	var x = this.view.canvasToMapX(mapScreenX,mapScreenY);
	var y = this.view.canvasToMapY(mapScreenX,mapScreenY);

	var level = this.data.getCurrentLevel();
	var zoomScale = this.view.getZoom();

	if(!mapObject) {
		mapObject = this.mapRenderer.hitCheck(level,x,y,zoomScale);
	}

        /* Deprecated Event */
	if(this.onMapClick) {
		this.onMapClick(x,y,mapObject);
	}
	
	/* Fire the event */
	var e = {};
	e.x = x;
	e.y = y;
	e.clicked = mapObject;
	this.mapEvent.dispatchEvent('mapClick', e);

}



//===========================================
// Asynchonous draw object
//============================================

/** This object is a global structure used to manage asynchronous drawing.
 * If allows for multiple maps on a page.
 * @private */
micello.maps.asynchDraw = {
	"maps":{},
	"waitDraw":function(mapCanvas,delay,mapName) {
		var mapInfo = this.maps[mapName];
		if(!mapInfo) {
			mapInfo = {};
                        mapInfo.active = false;
			this.maps[mapName] = mapInfo;
		}
		if(!mapInfo.active) {
			//trigger a redraw if one is not already
			mapInfo.active = true;
			mapInfo.mapCanvas = mapCanvas;
			setTimeout("micello.maps.asynchDraw.drawMap('" + mapName + "')",delay);
		}
	},
	"drawMap": function(mapName) {
		var mapInfo = this.maps[mapName];
		if(!mapInfo) return;
		mapInfo.active = false;
		mapInfo.mapCanvas.drawMapExe();
                
	}
}

