/**
 * This constructor takes the DOM element ID for the element that will serve as the map container.
 * A div element is recommended.
 *
 * @class This is the basic map control object. The main functionality is controlled
 * by some components of the map. These includes the MapCanvas to display the map,
 * the MapView to handle the viewport to the map, the MapData to handle the actual map data,
 * and the MapGUI to handle the user interactions. Additionally, this class holdds several convenience
 * methods and defines some default behavior.
 */

micello.maps.MapControl = function(/**@type{String}*/ mapElementId) {

	if(micello.maps.queryParamTable.length == 0) {
		micello.maps.onError(this.onMapEvent,"You must have a Micello Map Key to user the Micello Map API.","micello.maps.MapControl");
		return;
	}

	/** This is the id for the outside container element.
	 * @private */
	this.mapName = mapElementId;
	
	//put together the low level control functionality
	this.createControl(mapElementId);

	/** This is the inlay used for selection.
	 * @private */
	this.selectInlay = {
		"id":0,
		"zi":micello.maps.MapControl.SELECT_ZINDEX,
		"po":{"$style":"Selected"},
		"anm":"slct"
	};

	/** This is the popup for selection and info.
	 * @private */
	this.popup = this.mapCanvas.createPopup();

	//set the mouse click event in the map canvas
	var mapControl = this;
	this.mapCanvas.onMapClick = function(mapX,mapY,selected) {
		mapControl.onMapClick(mapX,mapY,selected);
	};

	/** This is the event that is triggered when an object is selected, or there is a map click on no object.
	 * @param {MapObject} mapObject This is a map object that was clicked by the mouse. It will be either a geometry or a marker.
	 * @event */
	this.doSelectAction = this.defaultSelectAction;

	/** This is the event that is triggered when an object is selected, or there is a map click on no object.
	 * @param {MapObject} mapObject This is a map object that was clicked by the mouse. It will be either a geometry or a marker.
	 * @event */
	this.showInfo = this.showDefaultInfoWindow;

	//properties

	/** This the current seleted object.
	 * @private */
	this.selected = null;
	/** This is true if there is a selected object.
	 * @private */
	this.highlighted = false;

	/** These are flags to indicate which commands to put in the default popup menu. */
	this.popupFlags = micello.maps.MapControl.SHOW_ALL;

	//initialize theme
	this.themeMap = null;
	this.initializeTheme();
}

/** This is the z index in which the select object is placed. */
micello.maps.MapControl.SELECT_ZINDEX = 9999;

/** This flag is used to show info in the popup flags. */
micello.maps.MapControl.SHOW_INFO = 1;
/** This flag is used to show go inside in the popup flags. */
micello.maps.MapControl.SHOW_INSIDE = 2;
/** This flag is used to show route to and from in the popup flags. */
micello.maps.MapControl.SHOW_NAV = 4;
/** This flag is used to show get user input popup flags. */
micello.maps.MapControl.SHOW_REPORT = 8;
/** This flag is used to show all in the popup flags, with stadard route navigation. */
micello.maps.MapControl.SHOW_ALL = 15;

/** This flag is used to show field route the popup flags. */
micello.maps.MapControl.SHOW_FIELD_NAV = 16;
/** This flag is used to show all in the popup flags, with field route navigation. */
micello.maps.MapControl.SHOW_ALL_FIELD = 27;

/** This is the maximum URL length displayed in info before the url is replaced with text. */
micello.maps.MapControl.MAX_URL_LENGTH = 25;

//--------------------------
// Control Accessors
//--------------------------

/** This method returns the map data object, which manages the map data. */
micello.maps.MapControl.prototype.getMapData = function() {
	return this.data;
}

/** This method returns the map view object, which manages the viewport to the map. */
micello.maps.MapControl.prototype.getMapView = function() {
	return this.view;
}

/** This method returns the map canvas object, which manages the map display. */
micello.maps.MapControl.prototype.getMapCanvas = function() {
	return this.mapCanvas;
}

/** This method returns the map data object, which manages the user interface. */
micello.maps.MapControl.prototype.getMapGUI = function() {
	return this.mapGUI;
}


/** This method returns the theme map. */
micello.maps.MapControl.prototype.getThemeMap = function() {
	return this.themeMap;
}

/** This method returns the map event. */
micello.maps.MapControl.prototype.getMapEvent = function() {
	return this.mapEvent;
}

/** This retrieves the field route object. */
/** This method returns the map event. */
micello.maps.MapControl.prototype.getFieldRoute = function() {
	if(!this.fieldRoute) {
		this.fieldRoute = new micello.maps.route.FieldRoute(this.data,this.mapEvent);
	}
	return this.fieldRoute;
}

//----------------------
// Report Problem
//----------------------

/** This method triggers a form to allow the user to report an error. */
micello.maps.MapControl.prototype.reportProb = function(geom) {
	var html = micello.maps.mapproblem.getProblemReportHTML(this, geom);
	this.showInfoWindow(geom,html);
        var textArea = document.getElementById("_prob_text");
        textArea.focus();
}

//----------------------
// Popup Menus and Infowindows
//----------------------

/** This method shows an menu popup for the given title and commands, tied to the given geometry
 * or marker overlay. In some cases an popup can not be placed for an object
 * because there is no anchor. If showing the info window fails, false will be returned.
 * Otherwise, true will be returned.
 **/
micello.maps.MapControl.prototype.showPopupMenu = function(mapObject,title,commands) {

	//create the popup data
	var data = new Object();
	data.type = micello.maps.popuptype.MENU;
	data.title = title;
	data.commands = commands;

	//get the marker location
	if((mapObject.mx === undefined)||(mapObject.my === undefined)) return false;
	data.mapX = mapObject.mx;
	data.mapY = mapObject.my;

	//offset
	if(mapObject.ox === undefined) {
		data.ox = 0;
		data.oy = 10; // moves the popup up so the tip of the arrow doesnt obscure entity names
	}
	else {
		data.ox = mapObject.ox;
		data.oy = 0;  //hardcode to top
	}

	//get the level
	if(mapObject.lid) data.lid = mapObject.lid;
	else if(mapObject.lvl) data.lid = mapObject.lvl.id;
	else return false;

	this.popup.setData(data);
	this.popup.setActive(true);
	return true;

}

/** This method shows an info window for the given html, tied to the given geometry
 * or marker overlay. In some cases an info window can not be placed for an object
 * because there is no anchor. If showing the info window fails, false will be returned.
 * Otherwise, true will be returned.
 **/
micello.maps.MapControl.prototype.showInfoWindow = function(mapObject,html) {

	//create the popup data
	var data = new Object();
	data.type = micello.maps.popuptype.INFOWINDOW;
	data.html = html;

	//handle specific object types
	//get the marker location
	if((mapObject.mx === undefined)||(mapObject.my === undefined)) return false;
	data.mapX = mapObject.mx;
	data.mapY = mapObject.my;
	
	//offset
	if(mapObject.ox === undefined) {
		data.ox = 0;
		data.oy = 10; // moves the popup up so the tip of the arrow doesnt obscure entity names
	}
	else {
		data.ox = mapObject.ox;
		data.oy = 0;  //hardcode to top
	}

	//level
	if(mapObject.lid) data.lid = mapObject.lid;
	else if(mapObject.lvl) data.lid = mapObject.lvl.id;
	else return false;

	this.popup.setData(data);
	this.popup.setActive(true);
	return true;
}

/** This method hides the current popup.*/
micello.maps.MapControl.prototype.hideInfoWindow = function() {
	this.popup.setActive(false);
}

/** This method carries out the standard select action when on object is selected. This method is
 * used as the default action for the doSelectAction event.
 */
micello.maps.MapControl.prototype.defaultSelectAction = function(mapObject) {
	if(!mapObject) {
		this.popup.setActive(false);
	}
	else if(mapObject.pdat) {
		this.showPopupMenu(mapObject,mapObject.pdat.title,mapObject.pdat.commands);
	}
	else if(mapObject.idat) {
		this.showInfoWindow(mapObject,mapObject.idat);
	}
	else {
if(mapObject.p) {
		var title = this.getTitleInfo(mapObject);
		if(title != null) {
			this.showDefaultGeomPopup(mapObject,title);
		}
		else {
			this.popup.setActive(false);
		}
}
else {
this.popup.setActive(false);
}
	}
//	else if(mapObject.pdat) {
//		this.showPopupMenu(mapObject,mapObject.pdat.title,mapObject.pdat.commands);
//	}
//	else if(mapObject.idat) {
//		this.showInfoWindow(mapObject,mapObject.idat);
//	}
//	else if(mapObject.p) {
//		//show default popup if this is a std geometry that is flagged
//		this.showDefaultGeomPopup(mapObject);
//	}
//	else {
//		this.popup.setActive(false);
//	}
}

micello.maps.MapControl.prototype.getTitleInfo = function(mapObject) {
	if(this.themeMap == null) return null;
//I should check if this is loaded, and handle the case of not being loaded.
//but usually it will be loaded before anything is rendered

	var label = this.themeMap.getLabel(mapObject);
	if(label) {
		return this.themeMap.convertLabelToText(label);
	}
	else {
		return null;
	}

}


/** This method creates and shows the default popup menu for a standard geometry object.
 */
micello.maps.MapControl.prototype.showDefaultGeomPopup = function(geom,title) {

	var commands = new Array();
	if(this.popupFlags & micello.maps.MapControl.SHOW_INFO) this.loadInfoCmd(geom,commands,title);
	if(this.popupFlags & micello.maps.MapControl.SHOW_INSIDE) this.loadInsideCmd(geom,commands);
	if(this.popupFlags & micello.maps.MapControl.SHOW_NAV) this.loadNavCmd(geom,commands);
	if(this.popupFlags & micello.maps.MapControl.SHOW_FIELD_NAV) this.loadFieldNavCmd(geom,commands);
	if(this.popupFlags & micello.maps.MapControl.SHOW_REPORT) this.loadInputCmd(geom,commands);

	this.showPopupMenu(geom,title,commands);
}


/** This method shows the default into window for a given geometry. It is
 * used for the default action for the showInfo event. */
micello.maps.MapControl.prototype.showDefaultInfoWindow = function(geom) {
	var community = this.data.getCommunity();
	if(!community) return;

	var standardInfoWindow = new micello.maps.StandardInfoWindow(this);
	var table = standardInfoWindow.createInfoElement(geom,community);
	this.popup.setActive(false);
	this.showInfoWindow(geom,table);
}

/*
 *	This method centers the map on a geometry and zooms it to the bounding box of the geometry
 */
micello.maps.MapControl.prototype.centerOnGeom = function (geom, padding) {
	if (!geom) {return;}
	if (!padding) {padding = 0;}
	
	if(!geom.mm) {this.mapCanvas.loadGeomMinMax(geom);}
	
	this.view.defaultMapX = (geom.mm[1][0] + geom.mm[0][0])/2;
	this.view.defaultMapY = (geom.mm[1][1] + geom.mm[0][1])/2;
	this.view.defaultW = 2 * (geom.mm[1][0] - geom.mm[0][0]) + padding;
	this.view.defaultH = 2 * (geom.mm[1][1] - geom.mm[0][1]) + padding;
	this.view.resetView();
	
	this.mapCanvas.onZoom();
	if(this.onViewChange) {
		this.event.pan = 0;
		this.event.zoom = 1;
		this.onViewChange(this.event);
	}
}

micello.maps.MapControl.prototype.initMapPlugin = function (mapPluginObj) {
    
    mapPluginObj.mapControl = this;
    mapPluginObj.mapGUI = this.getMapGUI();
    mapPluginObj.mapCanvas = this.getMapCanvas();
    mapPluginObj.mapData = this.getMapData();
    mapPluginObj.mapView = this.getMapView();

    
}

//--------------------------
// Menu Commands
//--------------------------

/** This method loads the command to show info into a command. If calls the even showInfo, which by default
 * is set to the method showDefaultInfoWindow.
 */
micello.maps.MapControl.prototype.loadInfoCmd = function(geom,commands,title) {
	if((geom.id > 0)&&(title)) {
		var mapMgr = this;
		var command = {"name":"Info","func":function(){mapMgr.showInfo(geom);}};
		commands.push(command);
	}
}

/** This method loads the command to go inside the given geometry, for geometry with
 *  an embedded map.
 */
micello.maps.MapControl.prototype.loadInsideCmd = function(geom,commands) {
	var mapMgr = this;
	var command;
	if(geom.cid) {
		command = {"name":"Go Inside","func":function(){mapMgr.toEmbeddedCom(geom);}};
		commands.push(command);
	}
	else if(geom.did) {
		command = {"name":"Go Inside","func":function(){mapMgr.toEmbeddedDraw(geom);}};
		commands.push(command);
	}
}

/** This method loads the navigate to and from commands. */
micello.maps.MapControl.prototype.loadNavCmd = function(geom,commands) {
	if(geom.id) {

		var lid;
		if(geom.lid) lid = geom.lid;
		else if(geom.lvl) lid = geom.lvl.id;
		else return;

		if(!this.route) {
			this.route = new micello.maps.route.MapRoute(this.data,this.mapEvent);
		}
		var route = this.route;
		var command = {"name":"Navigate To","func":function(){route.requestNavToGeom(geom,lid,true);}};
		commands.push(command);

		command = {"name":"Navigate From","func":function(){route.requestNavFromGeom(geom,lid,true);}};
		commands.push(command);

		if(this.route.isActive()) {
			command = {"name":"Clear Route","func":function(){route.clearRoute();}};
			commands.push(command);
		}
	}
}

/** This method loads the navigate to and from commands. */
micello.maps.MapControl.prototype.loadFieldNavCmd = function(geom,commands) {
	if(geom.id) {

		var lid;
		if(geom.lid) lid = geom.lid;
		else if(geom.lvl) lid = geom.lvl.id;
		else return;

		if(!this.fieldRoute) {
			this.fieldRoute = new micello.maps.route.FieldRoute(this.data,this.mapEvent);
		}
		var fieldRoute = this.fieldRoute;
		var command = {"name":"Navigate To","func":function(){fieldRoute.requestFieldRouteToGeom(geom,lid,true);}};
		commands.push(command);

		if(this.fieldRoute.isActive()) {
			command = {"name":"Clear Route","func":function(){fieldRoute.clearFieldRoute();}};
			commands.push(command);
		}
	}
}

/** This method loads the command to allow the user to report a map error. */
micello.maps.MapControl.prototype.loadInputCmd = function(geom,commands) {
	if(geom.id) {
		var mapMgr = this;
		var command = {"name":"Report a problem","func":function(){mapMgr.reportProb(geom);}};
		commands.push(command);
	}
}

/** This method is navigates into an embedded community for the given geometry. */
micello.maps.MapControl.prototype.toEmbeddedCom = function(geom) {
	var community = this.data.getCommunity();
	var cid = geom.did;
	if((cid)&&(cid != community.id)) {
		this.data.loadCommunity(cid,geom.did,geom.lid);
	}
	else {
		micello.maps.onError(this.mapEvent,"Unknown error - go inside failed","micello.maps.MapControl.toEmbeddedCom");
	}
}

/** This method is navigates into an embedded drawing for the given geometry. */
micello.maps.MapControl.prototype.toEmbeddedDraw = function(geom) {
	var community = this.data.getCommunity();
	var did = geom.did;
	if((community)&&(community.d)&&(did)) {
		var i;
		var cnt = community.d.length;
		for(i=0;i<cnt;i++) {
			var d = community.d[i];
			if(d.id == did) {
				//open desired drawing
				this.data.setDrawing(d,geom.lid);
			}
		}
	}
	else {
		micello.maps.onError(this.mapEvent,"Unknown error - go inside failed","micello.maps.MapControl.toEmbeddedDraw");
	}
}


//----------------------
// Selection
//----------------------

/** This method is the default handler for the map click event from MapCanvas. It does the select
 * operation for the clicked object and it does the select action. */
micello.maps.MapControl.prototype.onMapClick = function(mapX,mapY,selected) {

	if((selected != null)&&((selected.pdat)||(selected.idat)||(selected.p))) {
		if(selected != this.selected) {
			this.selectObject(selected);
		}
	}
	else {
		if(this.selected != null) {
			this.deselectObject();
		}
	}

	if(this.doSelectAction) {
		//do any action on select
		this.doSelectAction(selected);
	}
}

//private

/** This method is called to make the specified geometry selected.
 * @private
 */
micello.maps.MapControl.prototype.selectObject = function(geom) {
	//deselect old
	if(this.highlighted) {
		this.data.removeInlay("slct",true);
	}

	//if this is an area, and has an id, highlight it
	if((geom.id)&&(geom.gt == micello.maps.geomtype.AREA)) {
		this.selectInlay.id = geom.id;
		this.data.addInlay(this.selectInlay);
		this.highlighted = true;
	}
	else {
		this.highlighted = false;
	}

	this.selected = geom;
}

/** This method is called to clear the selected geometry.
 * @private
 */
micello.maps.MapControl.prototype.deselectObject = function() {
	if(this.highlighted) {
		this.data.removeInlay("slct",true);
	}
	this.selected = null;
	this.highlighted = false;
}

//-----------------------------
// Initialization
//-----------------------------

/** This method turns on or off the display of error messages. */
micello.maps.MapControl.prototype.displayErrors = function(doDisplay) {
	if(this.doDisplay != doDisplay) {
		if(doDisplay) {
			this.mapEvent.addListener("mapError",this.errorHandler);
		}
		else {
			this.mapEvent.removeListener("mapError",this.errorHandler);
		}
		this.doDisplay = doDisplay;
	}
}

/** This method creates the control.
 * @private */
micello.maps.MapControl.prototype.createControl = function(mapElementId) {
        
	//this will be used in functions defined in line for this method
	var mapControl = this;

	/** The MapEvent object for the map control.
	 * @private */
	this.mapEvent = new micello.maps.MapEvent(this);

	/** The MapGUI object for the map control.
	 * @private */
	this.mapGUI = new micello.maps.MapGUI(this,mapElementId,this.mapEvent);

	//subscribe to the error event
	this.errorHandler = function(e) {
		if(mapControl.displayErrors) {
			var msg = "Map Error: " + e.msg + "; @" + e.location;
			mapControl.mapGUI.msgDisplay(msg);
		}
	}
	this.displayErrors(true);

	var viewportElement = this.mapGUI.viewportElement;
	var mapElement = this.mapGUI.mapElement;

	/** The MapCanvas object for the map control.
	 * @private */
	this.mapCanvas = new micello.maps.MapCanvas(this,mapElement,this.mapEvent);

	/** The MapView object for the map control.
	 * @private */
	this.view = new micello.maps.MapView(this,viewportElement,mapElement,this.mapCanvas,this.mapGUI,this.mapEvent);

	/** The MapData object for the map control.
	 * @private */
	this.data = new micello.maps.MapData(this,this.view,this.mapCanvas,this.mapGUI,this.mapEvent);

	this.mapGUI.mapCanvas = this.mapCanvas;
	this.mapGUI.data = this.data;
     
	this.mapGUI.view = this.view;

	this.mapCanvas.data = this.data;
	this.mapCanvas.view = this.view;
	
	//on community load, add overrides
	var onCommunityLoad = function(e) {
		var community = mapControl.data.getCommunity();
		if(community.id == e.id) {
//			mapControl.loadCommunityOverrides(community);
		}
	}
	this.mapEvent.addListener("communityLoaded",onCommunityLoad);
 
        
}

/** This method loads the theme map, theme and strings.
 * @private */
micello.maps.MapControl.prototype.initializeTheme = function() {

	this.themeMap = new micello.maps.ThemeMap(this.mapEvent);
	
	//redraw map when the theme is loaded
	var mapCanvas = this.mapCanvas;
	var onThemeReady = function(themeMap) {
		mapCanvas.drawMap();
	}
	this.mapEvent.addListener("themeLoaded",onThemeReady);
		
	//set theme map url
	if(micello.maps.themeMapUrl) {
		this.themeMap.setThemeMapUrl(micello.maps.themeMapUrl);
	}
	else if(micello.maps.themeMapName) {
		this.themeMap.setThemeMapName(micello.maps.themeMapName);
	}
	//set theme url
	if(micello.maps.themeUrl) {
		this.themeMap.setThemeUrl(micello.maps.themeUrl);
	}
	else if(micello.maps.themeName) {
		this.themeMap.setThemeName(micello.maps.themeName);
	}
	//set strings url
	if(micello.maps.stringsUrl) {
		this.themeMap.setStringsUrl(micello.maps.stringsUrl);
	}
	else if(micello.maps.stringsName) {
		this.themeMap.setStringsName(micello.maps.stringsName);
	}
	//load theme data
	this.themeMap.loadData();
	
	//set theme maps where needed
	this.mapCanvas.setThemeMap(this.themeMap);

}

/** This method processes the community specific overrides
 * @private */
micello.maps.MapControl.prototype.loadCommunityOverrides = function(community) {
	if(community.or) {
		var overrides = community.or;
		var themeMap = this.themeMap;

		//needed for relative urls
		var path = micello.maps.request.pathConstruct(community.id, community.path);
		var mfsBaseUrl = micello.maps.HOST_URL;
		var overideBasePath = path.fullPath;
		
		if(overrides.stringsUrls) {
			var addStringsFunction = function(stringsJson) {
				themeMap.addStrings(stringsJson)
			}
			this.loadUrlObjects(overrides.stringsUrls,addStringsFunction,mfsBaseUrl,overideBasePath);
		}
		
		if(overrides.themeMapUrls) {
			var addThemeMapFunction = function(themeMapsJson) {
				themeMap.addThemeMap(themeMapsJson)
			}
			this.loadUrlObjects(overrides.themeMapUrls,addThemeMapFunction,mfsBaseUrl,overideBasePath);
		}
		
		if((overrides.themeUrls)&&(!micello.maps.themeUrl)&&(micello.maps.themeName)) {
			var themeUrls = overrides.themeUrls[micello.maps.themeName];
			if((themeUrls)&&(themeUrls.length > 0)) {
				var addThemeFunction = function(themeJson) {
					themeMap.addTheme(themeJson)
				}
				this.loadUrlObjects(themeUrls,addThemeFunction,mfsBaseUrl,overideBasePath);
			}
		}
	}
}

/** This method downloads and adds the override thememaps
 * @private */
micello.maps.MapControl.prototype.loadUrlObjects = function(urls,processResultFunction,relativeRootUrl,relativePathUrl) {
	if(!urls) return;
	var mapControl = this;
	var onDownload = function(stringsJson) {
		//clear cache on each add. Preferebly there is only one.
		processResultFunction(stringsJson);
		mapControl.mapCanvas.clearRenderCache();
	}
	var onError = function(msg) {
		micello.maps.onError(mapControl.mapEvent,msg,"micello.maps.MapControl.loadUrlObjects >> onError");
	}
	for(var i = 0; i < urls.length; i++) {
		var url = urls[i];
		url = this.makeAbsoluteOverrideUrl(url,relativeRootUrl,relativePathUrl);
		micello.maps.request.loadDataObject(url,onDownload,onError);
	}
}

micello.maps.MapControl.prototype.makeAbsoluteOverrideUrl = function(url,relativeRootUrl,relativePathUrl) {
	if(url.search("://") >= 0) {
		return url;
	}
	else if(url.charAt(0) == '/') {
		return relativeRootUrl + url;
	}
	else {
		return relativeRootUrl + relativePathUrl + url;
	}
}
