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
	this.DRAW_WAIT = 10;

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
    this.threeRenderer = new THREE.WebGLRenderer();
    this.threeRenderer.setSize(DISPLAY_WIDTH,DISPLAY_HEIGHT);
    document.body.appendChild(this.threeRenderer.domElement );
    
    this.scene = new THREE.Scene();

	/** This is the map view.
	 * @private */
	this.view = null;

	/** This is the map data.
	 * @private */
	this.data = null;

	/** This is the element which holds the map. */
	this.mapElement = mapElement;

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
}

/** This is the default zindex for a marker.
 * @private */
micello.maps.MapCanvas.DEFAULT_MARKER_ZI = 1;

//=================================
//public functions
//=================================

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
    //---------------------------
    // These won't work properly in three.js
    //---------------------------
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
    //---------------------------
    // These won't work properly in three.js
    //---------------------------
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
		this.drawMap();
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
    //-------------------------------
    //markers disabled for now in three.js
    return;
    //-------------------------------
}

/** This method updates a marker for a change in level or zoom.
 * @private */
micello.maps.MapCanvas.prototype.updateMarker = function(marker,level) {
    //-------------------------------
    //markers disabled for now in three.js
    return;
    //-------------------------------
}

/**
 * This method removes a marker from the map.
 * @param {MarkerOverlay} marker The marker to remove
 * @private
 */
micello.maps.MapCanvas.prototype.removeMarker = function(marker) {
	//-------------------------------
    //markers disabled for now in three.js
    return;
    //-------------------------------
}

///** This method returns the center X Map coordinate for a marker. It returns Number.NaN if
// * the value could not be calculated.
// * @private */
//micello.maps.MapCanvas.prototype.getMarkerCenterX = function(marker) {
//	if((!marker.ox)||(!marker.element)) return Number.NaN;
//	return marker.mx - marker.ox + marker.element.offsetWidth/2;
//}
//
///** This method returns the center Y Map coordinate for a marker. It returns Number.NaN if
// * the value could not be calculated.
// * @private */
//micello.maps.MapCanvas.prototype.getMarkerCenterY = function(marker) {
//	if((!marker.oy)||(!marker.element)) return Number.NaN;
//	return marker.my - marker.oy + marker.element.offsetHeight/2;
//}

/**
 * This method updates the location and visible status of the popups. It should
 * be called when the level changes or the zoom changes. The currentLevel should be the active
 * level. The oldLevel should be the previous level if the level changed, otherwise it should be null.
 * @private */
micello.maps.MapCanvas.prototype.updateDomOverlays = function(currentLevel,oldLevel) {
    //-------------------------------
    //dom overlays disabled for now in three.js
    return;
    //-------------------------------
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

    //asynchronous redraw
    this.drawMap();
}

/** This method should be called if the level is updated.
 * @private */
micello.maps.MapCanvas.prototype.updatelevel = function(currentLevel,oldLevel) {
	//this.updateDomOverlays(currentLevel,oldLevel);
	if(currentLevel) this.drawMap();
    //-----------------------
    //do we need to do something here for three.js?
	//else this.clearCanvas();
    //-----------------------
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
	//this.updateDomOverlays(this.data.getCurrentLevel(),null);
	this.drawMap();
}

//rendering functions

/** This method is called asynchronously to do the draw.
 * @private */
micello.maps.MapCanvas.prototype.drawMapExe = function() {
	if(!this.themeMap) return;
	
    //add render map!
    var level = this.data.getCurrentLevel();
    if(level) {
        this.mapRenderer.renderLevel(this.scene,level);
        
        this.threeRenderer.render( this.scene, this.view.camera );
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

