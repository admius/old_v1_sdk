/**
 * The version of the micello maps API.
 * @constant
*/
micello.maps.version = "1.0";

/** @private */

micello.maps.PROTOCOL = "http";
if( location.protocol == "https:") { micello.maps.PROTOCOL = "https"; } 
micello.maps.HOST_URL = micello.maps.PROTOCOL+"://eng.micello.com/mfs/ms/v1/mfile";
micello.maps.ROUTE_URL = micello.maps.PROTOCOL+"://eng.micello.com/navigation";
micello.maps.SEARCH_URL = micello.maps.PROTOCOL+"://eng.micello.com/search";

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

/** @private */
micello.SCRIPT_URL = micello.getScriptUrl();

//theme base paths
micello.maps.themeMapUrl = undefined; //micello.maps.HOST_URL + "/meta/thememap/v5/Standard";
micello.maps.themeMapName = "Standard";
micello.maps.themeUrl = undefined; //micello.maps.HOST_URL + "/meta/theme/v5/Standard";
micello.maps.themeName = "Standard";
micello.maps.stringsUrl = undefined; //micello.maps.HOST_URL + "/meta/strings/v5/sdk/Standard";
micello.maps.stringsName = "Standard";

/** The language for the sdk */
micello.maps.lang = "en";
micello.maps.defaultLang = undefined;
// THIS FILE SHOULD BE INCLUDED IN THE MAP STRUCT DOCUMENTATION.
//IT ALSO SHOULD BE INCLUDED IN THE IMPORTED JSON FILES ON WEB PAGES.

if(!micello) micello = {};
if(!micello.maps) micello.mapstruct = {};

/** @namespace This the namespace for the enumeration of shape types. */
micello.maps.shapetype = {};
/** This is the shape type value for no shape. The value is 0.*/
micello.maps.shapetype.NONE = 0;
/** This is the shape type value for a path. The path consists of an array of instructions, each of which consists of
 * an instruction type (such as "LINE_TO") and a set of coordinates for the instruction. In the case of a LINE_TO
 * instruction there are two coordinates given, the destination map X and map Y values. The enumeration
 * micello.maps.path gives the supported instruction types and the format for the associated instructions. THe value is 2.*/
micello.maps.shapetype.PATH = 2;

/** @namespace This the namespace for the enumeration of geometry types. */
micello.maps.geomtype = {};
/** This is the geometry type value for no shape rendered. The value is 0.*/
micello.maps.geomtype.NONE = 0;
/** This is the geometry type value for a line. The color of the line is given by the "main" color of the
 * style entry used to render the object. The line width is given by the "width" parameter of the style. This width
 * is a fixed width independant of scale and does not correspond to a phyiscal width. To represent a line with a physical
 * width use the LINEAR_AREA type. The value is 1.*/
micello.maps.geomtype.LINE = 1;
/** This is the geometry type value for an area. The fill color of the area is given by the "main" color of the 
 * style entry used to render the object. The outline color is given by the "outline" color in the style, and the width
 * of the outline is given by the "width" parameter of the style. The value is 2. */
micello.maps.geomtype.AREA = 2;
/** This is the geometry type value for a linear area. It is rendered as a line with a width given by the parameter in the
 * geometry object "gw". This corresponds to a physical width, as opposed to a render width given by the line object. The parameter
 * "gw" is given in map coordinate units. The value is 3. */
micello.maps.geomtype.LINEAR_AREA = 3;

/** @namespace This the namespace for the enumeration of path instructions. */
micello.maps.path = {};
/** This is the "move to" path instruction, which is an array with three entries, the instruction value,
 * the map X cooridnate and the map Y coordinate. The value is 0.
 * An example instruction is: [0,234,319].  */
micello.maps.path.MOVE_TO = 0;
/** This is the "line to" path instruction, which is an array with three entries, the instruction value,
 * the destination map X cooridnate and the destination map Y coordinate. The value is 1.
 * An example instruction is: [1,284,319]. */
micello.maps.path.LINE_TO = 1;
/** This is the "quad to" path instruction, which is an array with five entries, the instruction value,
 * the map X coordinate of the control point, the map Y coordinate of the control point,
 * the map X coordinate of the destination point, and the map Y coordinate of the destination point. The value is 2.
 * An example instruction is: [2,320,340,350,350]. */
micello.maps.path.QUAD_TO = 2;
/** This is the "cube to", or "curve to", path instruction, which is an array with seven entries, the instruction value,
 * the map X coordinate of the for control point 1, the map Y coordinate of the control point 1,
 * the map X coordinate of the for control point 2, the map Y coordinate of the control point 2,
 * the map X coordinate of the destination point, and the map Y coordinate of the destination point. The value is 3.
 * An example instruction is: [3,320,340,340,345,350,350]. */
micello.maps.path.CUBE_TO = 3;
/** This is the "close" path instruction. It is an array with one entry, the instruction value. The value is 4.
 * An example instruction is: [4]. */
micello.maps.path.CLOSE = 4;

/** @namespace This the namespace for the enumeration of label types. */
micello.maps.labeltype = {};
/** This is the label type none. The value is 0. */
micello.maps.labeltype.NONE = 0;
/** This is the label type text. For this label type, the label reference is the text string that should be used
 *as a label. The value is 1. */
micello.maps.labeltype.TEXT = 1;
/** This is the label type icon. For this label type, the label reference is the named icon from the theme file that should
 * be used as a label. The icon is sized to best fit the label area without distortion. The value is 2. */
micello.maps.labeltype.ICON = 2;
/** This is the label type image. For this label type, the label reference is the URL for the image to be used as a label.
 * The image is sized to best fit the label area without distortion. The value is 3. */
micello.maps.labeltype.IMAGE = 3;
/** This is the label type geometry. For this label type, the label reference is an Icon structure that will be used for the
 * label. The icon is sized to best with the label area without distortion. The value is 4. */
micello.maps.labeltype.GEOM = 4;

/** @namespace This the namespace for the enumeration of marker types. */
micello.maps.markertype = {};
/** This is the marker type none. The value is 0. */
micello.maps.markertype.NONE = 0;
/** This is the marker type for a marker looked up in the theme. For this marker type, the marker reference should be the
 * name of the marker to lookup from the theme file. The value is 1. */
micello.maps.markertype.NAMED = 1;
/** This is the marker type image. For this marker type the marker reference should be a MarkerIcon structure for the marker.
 * The value is 2. */
micello.maps.markertype.IMAGE = 2;

/** @namespace This the namespace for the enumeration of popup types. */
micello.maps.popuptype= {};
/** This is the type value used for a menu popup. The value is 1. */
micello.maps.popuptype.MENU = 1 ;
/** This is the type value used for a infowindo popup. The value is 2. */
micello.maps.popuptype.INFOWINDOW = 2;

/** @namespace This the namespace for entry types in the info request. */
micello.maps.infoentrytype = {};
/** This is the type value used for a phone number. The value is 1. */
micello.maps.infoentrytype.PHONE = 1;
/** This is the type value used for an emnail address. The value is 2. */
micello.maps.infoentrytype.EMAIL = 2;
/** This is the type value used for a web url. The value is 3. */
micello.maps.infoentrytype.URL = 3;
/** This is the type value used for a postal address. The value is 4. */
micello.maps.infoentrytype.ADDRESS = 4;
/** This is the type value used for palin text or an otherwise unspecified entry. The value is 5. */
micello.maps.infoentrytype.GENERAL = 5;/**
 * This is a special ordered list to place the overlays withthe base map geometry.
 * There is a fixed list at zIndex 0. Objects can be added indidually to other zIndexes,
 * and a list is created for each zIndex.
 * @constructor
 * @private
 */
micello.maps.ZList = function(list){
	this.head = {"next":null,"prev":null,"list":list,"zi":0};
	this.iter = null;
}

/**
 * This adds an object to the list, in the ordered location.
 * @private
 */
micello.maps.ZList.prototype.add = function(data) {
	//we are not allowing add and remove from 0
	if(data.zi == 0) {
		alert("illegal zindex");
		return;
	}
	var current = this.head;
	var prev = null;
	while((current)&&(current.zi < data.zi)) {
		prev = current;
		current = current.next;
	}
	if((current)&&(current.zi == data.zi)) {
		//put with current entry
		current.list.push(data);
	}
	else {
		//add entry
		var activeEntry = {"next":current,"prev":prev,"list":[data],"zi":data.zi};
		if(prev != null) prev.next = activeEntry;
		else this.head = activeEntry;
		if(current != null) current.prev = activeEntry;
	}
}

/**
 * This removes an object from the list according to the names paramters.
 * It reomves any value that has the named parameter equal to the reference value.
 * @private
 */
micello.maps.ZList.prototype.remove = function(ref,tagName) {
	var current = this.head;
	var list;
	var i;
	var localRef;
	while(current) {
		//we are not allowing add and remove from 0
		if(current.zi != 0) {
			list = current.list;
			for(i=0;i<list.length;i++) {
				localRef = list[i][tagName];
				if(ref == localRef) {
					var removed = list[i];
					list.splice(i,1);
					return removed;
				}
			}
		}
		current = current.next;
	}
	return null;
}

/**
 * This method intializes the iterator.
 * @private
 */
micello.maps.ZList.prototype.start = function() {
	this.iter = this.head;
}

/**
 * This returns the active list entry.
 * @private
 */
micello.maps.ZList.prototype.currentList = function() {
	if(this.iter) return this.iter.list;
	else return null;
}

/**
 * This returns the active z index.
 * @private
 */
micello.maps.ZList.prototype.currentZi = function() {
	if(this.iter) return this.iter.zi;
	else return null;
}


/**
 * This returns the next array in the ordered array.
 * @private
 */
micello.maps.ZList.prototype.next = function() {
	if(this.iter) this.iter = this.iter.next;
}


/** ThemeMap Class - This class process an objects so it can be used with a theme. */

/** CHANGES FROM LEAFLET VERSION
 * - change the package name
 * - added marker map and function to get marker
 * - changed the name of theproeprtye variable from "properties" to "p"
 * - change the name of the request function, and got rid of theme map name for load function.
 */

/** This class manages the map data. */
micello.maps.ThemeMap = function(mapEvent) {
	
	this.mapEvent = mapEvent;

	this.NONE_LABEL_TYPE = 0;
	this.TEXT_LABEL_TYPE = 1;
	this.ICON_LABEL_TYPE = 2;
	this.IMAGE_LABEL_TYPE = 3;

	this.ICON_LOOKUP_BASE = "icon:";
	this.IMAGE_LOOKUP_BASE = "image:";

	this.styleTree = null;
	this.labelTree = null;
	this.styleMap = null;
	this.iconMap = null;
	this.markerMap = null;
	this.stringsTable = null;

	this.themeMapUrl = null;
	this.themeUrl = null;
	this.stringsUrl = null;
	
	this.fontFamilies = "arial"; //default font

	this.loaded = false;
	
	this.defaultStyle = null;
}

/** This method sets the handler for loading the theme. */
micello.maps.ThemeMap.prototype.isLoaded = function() {
	return this.loaded;
}

/** This method sets the theme url. */
micello.maps.ThemeMap.prototype.setThemeMapUrl = function(url) {
	this.themeMapUrl = url;
}

/** This method sets the theme name. */
micello.maps.ThemeMap.prototype.setThemeMapName = function(name) {
	//create url from name
	this.themeMapUrl = micello.maps.HOST_URL + "/meta/thememap/v5/" + name;
}

/** This method sets the theme url. */
micello.maps.ThemeMap.prototype.setThemeUrl = function(url) {
	this.themeUrl = url;
}

/** This method sets the theme name. */
micello.maps.ThemeMap.prototype.setThemeName = function(name) {
	//create url from name
	this.themeUrl = micello.maps.HOST_URL + "/meta/theme/v5/" + name;
}

/** This method sets the theme url. */
micello.maps.ThemeMap.prototype.setStringsUrl = function(url) {
	this.stringsUrl = url;
}

/** This method sets the theme name. */
micello.maps.ThemeMap.prototype.setStringsName = function(name) {
	//create url from name
	this.stringsUrl = micello.maps.HOST_URL + "/meta/strings/v5/sdk/" + name;
}

/** This method loads a theme family. */
micello.maps.ThemeMap.prototype.loadData = function() {
	var instance = this;
	if(this.themeMapUrl) {
		var themeMapCallback = function(themeMap) {
			instance.onThemeMapLoad(themeMap);
		}
		micello.maps.request.loadDataObject(this.themeMapUrl,themeMapCallback);
	}
	if(this.themeUrl) {
		var themeCallback = function(theme) {
			instance.onThemeLoad(theme);
		}
		micello.maps.request.loadDataObject(this.themeUrl,themeCallback);
	}
	if(this.stringsUrl) {
		var stringsCallback = function(themeMap) {
			instance.onStringsLoad(themeMap);
		}
		micello.maps.request.loadDataObject(this.stringsUrl,stringsCallback);
	}
}

/** This method returns thge font family array. */
micello.maps.ThemeMap.prototype.getFontFamilies = function() {
	return this.fontFamilies;
}


/** This method returns a style object. */
micello.maps.ThemeMap.prototype.getStyle = function(styleName) {
	if((this.styleMap == null)||(styleName == null)) return null;

	var style = this.styleMap[styleName];
	if(!style) {
		style = this.defaultStyle;
	}
	return style;
}

/** This method returns an icon object, by name from the theme.
 * The icons are loaded asynchronously if not in memory. When it is loaded, ondoad
 * will be called.*/
micello.maps.ThemeMap.prototype.getIcon = function(iconName,onload) {
	if((this.iconMap == null)||(iconName == null)) return null;

	var iconInfo = this.iconMap[iconName];
	if((iconInfo)&&(!iconInfo.icon)) {
		iconInfo.onload = onload;
		var iconCallback = function(icon) {
			delete iconInfo.pending;
			iconInfo.icon = icon;
			if(iconInfo.onload) {
				iconInfo.onload(iconInfo);
			}
		}
		iconInfo.pending = true;
		micello.maps.request.loadDataObject(iconInfo.url,iconCallback);
	}
	return iconInfo;
}

/** This method returns an image object, loaded from the given url.
 * The images are loaded asynchronously if not in memory. When it is loaded, onload
 * will be called.*/
micello.maps.ThemeMap.prototype.getImage = function(url,onload) {
	var imgInfo = this.imageMap[url];
	if(!imgInfo) {
		imgInfo = {};
		imgInfo.url = url;
		this.imageMap[url] = imgInfo;
	}
	if(!imgInfo.img) {
		imgInfo.onload = onload;
		imgInfo.img = new Image();
		imgInfo.img.onload = function() {
			delete imgInfo.pending;
			imgInfo.onload(imgInfo);
		}
		imgInfo.pending = true;
		imgInfo.img.src = imgInfo.url;
	}
	return imgInfo;
}

/** This method returns an icon object. */
micello.maps.ThemeMap.prototype.getMarker = function(markerName) {
	if((this.markerMap == null)||(markerName == null)) return null;

	return this.markerMap[markerName];
}


/** This translates a string. */
micello.maps.ThemeMap.prototype.translate = function(value, defaultValue) {
	if(this.stringsTable) {
		var entry = this.stringsTable[value];
		if(entry) {
			var result;

			//get requested lang
			result = entry[micello.maps.lang];
			if(result) return result;

			//get default lang
			if(micello.maps.defaultLang) {
				result = entry[micello.maps.defaultLang];
				if(result) return result;
			}

			//get any language
			var l;
			for(l in entry) {
				return entry[l];
			}
		}
	}
	//if not found, return default
	return defaultValue;
}

/** This method converts a general label to a text label, using a display name lookup.
 * It returns null if there is no appropriate text label. */
micello.maps.ThemeMap.prototype.convertLabelToText = function(labelInfo) {
	if((labelInfo)&&(labelInfo.lr)) {
		var text;
		var baseName;
		if(labelInfo.lt == this.TEXT_LABEL_TYPE) {
			text = labelInfo.lr;
			return text;
		}
		else if(labelInfo.lt == this.ICON_LABEL_TYPE) {
			baseName = this.ICON_LOOKUP_BASE + labelInfo.lr;
			text = this.translate(baseName,labelInfo.lr);
			return text;
		}
		else if(labelInfo.lt == this.IMAGE_LABEL_TYPE) {
			baseName = this.IMAGE_LOOKUP_BASE + labelInfo.lr;
			text = this.translate(baseName,labelInfo.lr);
			return text;
		}
		else {
			return null;
		}
	}
	else {
		return null;
	}
}

/** This method returns a style string for a feature. It returns null
 * if the theme map is not loaded. */
micello.maps.ThemeMap.prototype.getStyleInfo = function(feature) {
	if(this.styleTree == null) return null;

	var geometry = feature;
	var address = feature.a;
	var entities = feature.me;
	var entity;
	var valueEntry;
	var result;

	for(var it = 0; it < this.styleTree.length; it++) {

		valueEntry = this.styleTree[it];

		if((entities)&&(entities.length > 1)) {
			//multientity case - return first
			for(var i = 0; i < entities.length; i++) {
				entity = entities[i];

				//get regular label
				result = this.processValueEntry(geometry,entity,address,valueEntry,undefined,this.getStyleValue);
				if(result) {
					return result;
				}
			}
		}
		else {
			//single or no entity case
			if((entities)&&(entities.length == 1)) {
				entity = entities[0];
			}
			else {
				entity = null;
			}

			result = this.processValueEntry(geometry,entity,address,valueEntry,undefined,this.getStyleValue);
			if(result) {
				return result;
			}
		}
	}
	//if nothign found, return null
	return null;
}

micello.maps.ThemeMap.prototype.addThemeMap = function(themeMap) {
	if(!this.styleTree) this.styleTree = [];
	if(!this.labelTree) this.labelTree = [];
	
	if(themeMap.label) {
		this.mergeTrees(this.labelTree,themeMap.label);
	}
	
	if(themeMap.style) {
		this.mergeTrees(this.styleTree,themeMap.style);
	}
}
	
/** This method merges a new theme map tree into an old theme map tree.
 * It assumes both trees are in order in terms of priority.
 * @private */
micello.maps.ThemeMap.prototype.mergeTrees = function(oldTree,newTree) {
	
	var oldEntry;
	var newEntry;
	var oldIndex = 0;
	var newIndex;
	var oldPriority;
	var entryAdded;
	
	for(newIndex = 0; newIndex < newTree.length; newIndex++) {
		newEntry = newTree[newIndex];
		entryAdded = false;
		while(!entryAdded) {
			if(oldIndex < oldTree.length) {
				oldEntry = oldTree[oldIndex];
				oldPriority = oldEntry.priority;
			}
			else {
				oldPriority = Number.MAX_VALUE;
			}

			if(newEntry.priority <= oldPriority) {
				//add here
				oldTree.splice(oldIndex,0,newEntry);
				entryAdded = true;
				oldIndex++;
			}
			else {
				//increment
				oldIndex++;
			}
		}
	}
}

micello.maps.ThemeMap.prototype.addTheme = function(theme) {
	//create the style map
	if(!this.styleMap) this.styleMap = {};
	if(!this.iconMap) this.iconMap = {};
	if(!this.markerMap) this.markerMap = {};

	var styleType;
	var iconType;
	var markerType;
	
	//copy from this theme
	for(styleType in theme.s) {
		this.styleMap[styleType] = theme.s[styleType];
	}
	for(iconType in theme.i) {
		var iconInfo = {};
		iconInfo.url = theme.iurl + theme.i[iconType];
		this.iconMap[iconType] = iconInfo;
	}
	for(markerType in theme.m) {
		this.markerMap[markerType] = theme.m[markerType];
	}
	
	if(theme.ff) {
		var families = "";
		var family;
		for(var i = 0; i < theme.ff.length; i++) {
			family = theme.ff[i];
			if(family.indexOf(' ') >= 0) {
				family = "'" + family + "'";
			}
			if(families.length > 0) families += ",";
			families += family; 
		}
		this.fontFamily = families;
	}
	
	//update the default style
	this.defaultStyle = this.styleMap["Object"];
}

micello.maps.ThemeMap.prototype.addStrings = function(stringsData) {
	//create the style map
	if(!this.stringsTable) this.stringsTable = {};

	//copy from this theme
	var stringName;
	for(stringName in stringsData.translations) {
		this.stringsTable[stringName] = stringsData.translations[stringName];
	}
}



/** This method returns tyhe label info for a feature. It returns null
 * if the theme map is not loaded. */
micello.maps.ThemeMap.prototype.getLabel = function(feature) {
	if(this.labelTree == null) return null;
	
	var geometry = feature;
	var address = feature.a;
	var entities = feature.me;
	var entity;
	var valueEntry;

	//for multi entity case
	var multiLabelText = null;

	for(var it = 0; it < this.labelTree.length; it++) {

		valueEntry = this.labelTree[it];

		if((entities)&&(entities.length > 1)) {
			//multientity case
			var labelText = null;
			var key;
			var labelInfo;
			var handled = {};
			for(var i = 0; i < entities.length; i++) {
				entity = entities[i];
				
				key = "e" + entity.id;
				if(!handled[key]) {
					//get regular entity label
					labelInfo = this.processValueEntry(null,entity,null,valueEntry,undefined,this.getLabelValue);
					//convert to text
					labelText = this.convertLabelToText(labelInfo);
					if((labelText)&&(labelText.length > 0)) {
						if(!multiLabelText) {
							multiLabelText = labelText
						}
						else {
							multiLabelText += LABEL_DELIMITER + labelText;
						}
						
						//mark as finished
						handled[key] = true;
					}	
				}
			}
			
			//get regular geometry label
			key = "g" + geometry.id;
			if(!handled[key]) {
			
				labelInfo = this.processValueEntry(geometry,null,address,valueEntry,undefined,this.getLabelValue);
				//convert to text
				labelText = this.convertLabelToText(labelInfo);
				if((labelText)&&(labelText.length > 0)) {
					if(!multiLabelText) {
						multiLabelText = labelText
					}
					else {
						multiLabelText += LABEL_DELIMITER + labelText;
					}
					
					//mark as finished
					handled[key] = true;
				}
			}
		}
		else {
			//single or no entity case
			if((entities)&&(entities.length == 1)) {
				entity = entities[0];
			}
			else {
				entity = null;
			}

			var result = this.processValueEntry(geometry,entity,address,valueEntry,undefined,this.getLabelValue);
			if(result) {
				return result;
			}
		}
	}
	
	//return for the case of a multi entity label
	if(multiLabelText) {
		//label found
		return {"lt":this.TEXT_LABEL_TYPE, "lr":multiLabelText}
	}
	
	//if nothign found, return null
	return null;
}

/** This method is the same as getLabel but it ignores entities. */
micello.maps.ThemeMap.prototype.getGeomLabel = function(geom) {
	if(this.labelTree == null) return null;
	
	var address = geom.a;
	var valueEntry;

	for(var it = 0; it < this.labelTree.length; it++) {

		valueEntry = this.labelTree[it];

		var result = this.processValueEntry(geom,null,address,valueEntry,undefined,this.getLabelValue);
		if(result) {
			return result;
		}
	}
	//if nothign found, return null
	return null;
}

/** This method is the same as getLabel but it only processes a single entity, no geom or address. */
micello.maps.ThemeMap.prototype.getEntityLabel = function(entity) {
	if(this.labelTree == null) return null;
	var valueEntry;

	for(var it = 0; it < this.labelTree.length; it++) {

		valueEntry = this.labelTree[it];

		var result = this.processValueEntry(null,entity,null,valueEntry,undefined,this.getLabelValue);
		if(result) {
			return result;
		}
	}
	//if nothign found, return null
	return null;
}

micello.maps.ThemeMap.prototype.processValueEntry = function(geometry,entity,address,valueEntry,value,returnValueFunction) {
	var result;

	var keyList = valueEntry.ks;
	if(keyList != undefined) {
		var kCount = keyList.length;
		for(var ik = 0; ik < kCount; ik++) {
			var keyEntry = keyList[ik];
			var key;
			var keyValue = undefined;
			if((keyEntry.gk)&&(geometry)) {
				key = keyEntry.gk;
				keyValue = geometry.p[key];
			}
			else if((keyEntry.ek)&&(entity)) {
				key = keyEntry.ek;
				keyValue = entity.p[key];
			}
			else if((keyEntry.ak)&&(address)) {
				key = keyEntry.ak;
				if(key == address[0]) {
					keyValue = address[1];
				}
			}
			if(keyValue !== undefined) {
				if(keyEntry.v) {
					//look for the value
					var childValueEntry = keyEntry.v[keyValue];
					if(childValueEntry != undefined) {
						//process the value entry
						result = this.processValueEntry(geometry,entity,address,childValueEntry,keyValue,returnValueFunction);
						if(result != undefined) return result;
					}
				}
				//if we get here, use the default value for the key
				result = returnValueFunction.call(this,geometry,entity,address,keyEntry,keyValue);
				if(result != undefined) return result;
			}
		}
	}
	//if we get here, value not found. use the default value for the value entry
	return returnValueFunction.call(this,geometry,entity,address,valueEntry,value);
	if(result != undefined) return result;
	else return undefined;
}

/** this method gets the return value. */
micello.maps.ThemeMap.prototype.getStyleValue = function(geometry,entity,address,entry,value) {
	var styleName = entry.n;
	if(styleName != undefined) {
		if(styleName ==  "<value>") styleName = value;
		var zmin = entry.zmin;
		var styleInfo = {};
		styleInfo.name = styleName;
		if(zmin) {
			styleInfo.zmin = zmin
		}
		return styleInfo;
	}
	else return undefined;
}

/** this method gets the return value. */
micello.maps.ThemeMap.prototype.getLabelValue = function(geometry,entity,address,entry,value) {
	var labelType = entry.lt;
	if(labelType != undefined) {
		var labelRef = entry.r;
		if(labelRef ==  "<value>") {
			labelRef = value;
		}
		else if(labelRef ==  "<short>") {
			if(address == null) return undefined; //shouldn't happen
			labelRef = micello.maps.createShortAddress(address);
		}
		else if(labelRef ==  "<long>") {
			if(address == null) return undefined; //shouldn't happen
			labelRef = micello.maps.createLongAddress(address);
		}
		else if(labelRef ==  "<full>") {
			if(address == null) return undefined; //shouldn't happen
			labelRef = micello.maps.createFullAddress(address);
		}
		if(entry.trans) {
			labelRef = this.translate(labelRef,labelRef);
		}
		var zmin = entry.zmin;
		
		var labelInfo = {};
		labelInfo.lt = labelType;
		labelInfo.lr = labelRef;
		if(zmin) {
			labelInfo.zmin = zmin;
		}
		
		return labelInfo;
	}
	else return undefined;
}


/** This method sets the themeMap. */
micello.maps.ThemeMap.prototype.onThemeMapLoad = function(themeMap) {
	//store the original and add a copy, since it may be modified
	this.themeMap = themeMap;
	var themeMapCopy = micello.copyValue(themeMap);
	
	this.addThemeMap(themeMapCopy);

	this.checkForFinish();
}

micello.maps.ThemeMap.prototype.onThemeLoad = function (theme) {
	this.addTheme(theme);

	//clear the theme family
	this.checkForFinish();
}

micello.maps.ThemeMap.prototype.onStringsLoad = function (stringsData) {
	this.addStrings(stringsData);

	//clear the theme family
	this.checkForFinish();
}

micello.maps.ThemeMap.prototype.checkForFinish = function () {
	//make sure theme and famly are loaded
	if((!this.styleTree)||(!this.styleMap)||(!this.stringsTable)) return;

	this.loaded = true;
	if(this.mapEvent) {
        this.mapEvent.dispatchEvent('themeloaded',this);
	}
}

//create a deep copy of an object
//this is a utility that should be put somehwere
micello.refObject = {};
micello.refArray = [];
micello.copyValue = function(src) {
  var dst;

  if(micello.isObject(src)) {
    dst = {};
    for(var key in src) {
      dst[key] = micello.copyValue(src[key]);
    }
  }
  else if(micello.isArray(src)) {
    newValue = [];
    for(var i = 0; i < value.length; i++) {
      dst[i] = micello.copyValue(src[i]);
    }
  }
  else {
    dst = src;
  }
  
  return dst;
}

micello.isObject = function(value) {
  if(!value) return false;

  return (value.constructor == micello.refObject.constructor);
}

micello.isArray = function(value) {
  if(!value) return false;

  return (value.constructor == micello.refArray.consturctor);
}

/** This creates a short address (value only) from a geometry address json. */
micello.maps.createShortAddress = function(addressJson) {
	return addressJson[1];
}

/** This creates a long address (key + value) from a geometry address json. */
micello.maps.createLongAddress = function(addressJson) {
	return addressJson[0] + " " + addressJson[1];
}

/** This creates a full address (complete hierarchical address) from a geometry address json. */
micello.maps.createFullAddress = function(addressJson) {
	var fa;
	if(addressJson.length == 3) {
		fa = addressJson[2] + " ";
	}
	else {
		fa = "";
	}
	fa += addressJson[0] + " " + addressJson[1];
	return fa;
}
micello.util = {};

/**
 * This resolves an ID -- first checking the DOM to see if this is in use
 * already and if so, append a counter number kept by a static array in this method
 * @param {id} the ID resolved to an unused ID name
 * @private
 */
micello.util.resolveId = function (id) {
    
    var checkId = null;
    var exists = null;
    var done = false;
    var cnt = 0;
    while ( !done ) {

        checkId = this.buildId(cnt, id);
        exists = document.getElementById(checkId);
        if( !exists ) { break; }
        cnt++;
    }
    return checkId;
}

/**
 * This builds the selector ID in the incremental style required
 * @param {mn} The arbitrary incremental number given
  *@param {id} The id to munge and return
  *@private
 */
micello.util.buildId = function (mn, id) {
    if( mn === 0 ) {
        return id;
    } else {
        return id+'-'+mn;
    }
}

/**
 * This traverses the DOM looking for elements to match the id given
 * @param {id} The id selector to look for
 *@private
 */
micello.util.countElement = function (id) {
    
    var checkId = null;
    var exists = null;
    var done = false;
    var cnt = 0;
    while ( !done ) {
        checkId = id;
        if( cnt > 0 ) {
            checkId = checkId+'-'+cnt;
        }
        exists = document.getElementById(checkId);
        if( !exists ) { break; } else { cnt++; }
        
    }
    return cnt;
}

/**
 * This adds a new element to the DOM in a structured manner
 * @param {id} The new selector ID to add
 * @param {tag} (optional) if other than a div, specify here
 *@private
 */
micello.util.addElem = function (id) {
    var tag;
    if( arguments[1] ) {
        tag = arguments[1];
    } else {
        tag = 'div';
    }

    var newEl = document.createElement(tag);
    if( id ) {
        newEl.setAttribute("id", micello.util.resolveId(id));
    }
    return newEl;
}

/**
 * This adds a class to an element if it is not already added to the element
 * @param {ele} The referenced element to work against
 * @param {cls} the mixed type class to add if not already added (can be a string or array)
 *@private
 */
micello.util.addClass = function (ele,cls) {
  var s = typeof cls;
  if (s !== 'object') {
      clsArr = [];
      clsArr = [cls];
      cls = clsArr;
  } 
  for( i=0; i<cls.length; i++ ) {
    if (!micello.util.hasClass(ele,cls)) ele.className += " "+cls[i];
  }
}

/**
 * This checks to see if an element already has a class
 * @param {ele} The referenced element to work against
 * @param {cssClass} the class to check
 *@private
 */
micello.util.hasClass = function (el, cssClass) {
    return el.className && new RegExp("(^|\\s)" + cssClass + "(\\s|$)").test(el.className);
}

/**
 * This removes a class from the referenced element if it exists
 * @param {ele} The referenced element to work against
 * @param {cssClass} the class to remove
 *@private
 */
micello.util.removeClass = function (ele,cls) {
    
        if (this.hasClass(ele,cls)) {
            var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
            ele.className=ele.className.replace(reg,'');
        }
}

/**
 * This applies the object of styles to the element sent in
 * @param {el} The referenced element to work against
 * @param {styles} the object of css props to add
 *@private
 */
micello.util.addCss = function (el, styles) {
    for (var prop in styles) {
        if (!styles.hasOwnProperty || styles.hasOwnProperty(prop)) {
            el.style[prop] = styles[prop];
        }
    }
    return el;
}

/**
 * This removes the array of styles to the element sent in
 * @param {el} The referenced element to work against
 * @param {styles} the array of css props to add
 *@private
 */
micello.util.removeCss = function (el, styles) {
    for (var prop in styles) {
        if (!styles.hasOwnProperty || styles.hasOwnProperty(prop)) {
            el.style.removeProperty(prop);
        }
    }
    return el;
}

/**
 * Universal way to check to see if an value appears in an array
 * @param {arr} The array
 * @param {val} the value to look for
 *@private
 */
micello.util.inArray = function (arr, val) { 
    for (i = 0; i < arr.length; i++) if (val == arr[i]) return true; return false; 
}

/**
 * Universal way to check to see if a hex value has the appriate characters
 * @param {hex} The hex code to check
 *@private
 */
micello.util.hexCheck = function (hex) {
    if( hex.charAt(0) != "#" ) {
        return "#"+hex;
    }
    return hex;
}

/**
 * Sniff and find the vendor prefixes used for this device / browser and return all possible permutations
 *@private
 */
micello.util.vendorPrefix = function () {
    
    var styles = window.getComputedStyle(document.documentElement, ''),
        pre = (Array.prototype.slice
          .call(styles)
          .join('') 
          .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1],
        dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
      return {
        dom: dom,
        lowercase: pre,
        css: '-' + pre + '-',
        js: pre[0].toUpperCase() + pre.substr(1)
      };
    
}/**
 * This constructor takes the map control, viewport element and map element for the
 * map. It should not be called explicitly. It should be called by the map control.
 * 
 * @class This class manages the map user input.
 */
micello.maps.MapGUI = function(mapControl, mapElementId, mapEvent) {
	/** This is the map control
	 * @private */
	this.mapControl = mapControl;
        
	/** This is the map event
	 * @private */
        this.mapEvent = mapEvent;
        
	/** The external element assigned as the map control container.
	 * @private */
	this.outsideContainer = document.getElementById(mapElementId);

	if(!this.outsideContainer) {
		alert("Map container not found");
		return;
	}
        
        this.viewportElement = micello.util.addElem("micello-map");
        var numMaps = micello.util.countElement("micello-map");
        this.viewportElement.setAttribute("mn", numMaps);
        
        micello.util.addClass(this.viewportElement, "micello_map");
        micello.util.addCss(this.viewportElement, {
            position: "relative",
            display: "block",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            outline: "0px none #ffffff"
        });
        this.viewportElement.setAttribute("tabindex", -1);
	this.outsideContainer.appendChild(this.viewportElement);
        this.viewportElement.mapTarget = true;
	/** This is the view for the map.
	 * @private */

	var mapElement = document.createElement("div");
        micello.util.addCss(mapElement, {
            position: "absolute",
            display: "block",
            left: "0px",
            top: "0px",
            overflow: "visible"            
        });

        micello.maps.MapGUI.detectTransformName(mapElement);

        //this enables this element to be dragged
        mapElement.mapTarget = true;
	this.viewportElement.appendChild(mapElement);

	/** The internal map control container.
	 * @private */
	this.mapElement = mapElement;

	/* User touch, mouse, scroll and keyboard interactions defined here */
	var mapGUI = this;
	this.viewportElement.onmousedown = function(e) {
		mapGUI.onMouseDown(e);
	}
        // For some reason we need this on firefox when clicking outside the map but in the viewport
	this.viewportElement.onmouseup = function(e) {
		mapGUI.onMouseUp(e);
	}
	this.viewportElement.onmousemove = function(e) {
		mapGUI.onMouseMove(e);
	}
        //end firefox add
	this.viewportElement.ontouchstart = function(e) {
		mapGUI.onTouchStart(e);
	}
	this.viewportElement.ontouchmove = function(e) {
		mapGUI.onTouchMove(e);
	}
	this.viewportElement.ontouchend = function(e) {
		mapGUI.onTouchEnd(e);
	}
        
        this.viewportElement.onkeydown = function(e) {
		mapGUI.onKeyDown(e);
	}
        this.viewportElement.onkeyup = function(e) {
		mapGUI.onKeyUp(e);
	}
        
	/* for Mozilla scroll handling */
	this.viewportElement.addEventListener("DOMMouseScroll", function (e) {mapGUI.onMouseWheel(e);}, false);
        this.viewportElement.addEventListener("mousewheel", function (e) {mapGUI.onMouseWheel(e);}, false);        
        
	/* Handle the general window resize */
	window.onresize = function() {
		mapGUI.onResize();
	}

        /** The font to be used for the title, drawing selector, and level selector */
        this.UI_FONT = "Arial";
        /** @private */
        this.UI_FONT_FALLBACK = "Arial";
        
        /* Initialize the UI Elements */
        this.ui = micello.util.addElem("ui-all");
        micello.util.addClass(this.ui, 'ui_all');
        micello.util.addCss(this.ui, {fontFamily: this.UI_FONT});
        this.ui.onmousemove = function (e) {
            mapGUI.conditionalUI();
        }
        
        this.ui.addEventListener("DOMMouseScroll", function (e) {mapGUI.onMouseWheel(e);}, false);
        this.ui.addEventListener("mousewheel", function (e) {mapGUI.onMouseWheel(e);}, false);
        this.viewportElement.appendChild(this.ui);

        this.UISections = new Array;
        
        /* Set the defaults */
        /** @private */
        this.grid = new Array("left top", "left center", "left bottom", "center top", "center center", "center bottom", "right top", "right center", "right bottom");
        /** @private */
        this.gridDefaults = new Array();
        this.gridDefaults["name"] = "left top";
        this.gridDefaults["levels"] = "left top";
        this.gridDefaults["zoom"] = "center bottom";
        this.gridDefaults["attribution"] = "left bottom";
        this.gridDefaults["compass"] = "right top";
        this.gridDefaults["geo"] = "right bottom";
        
        /** @private */
        this.ui.name = null;
        
        /** Determines whether to show the Map name (and drawing list if the map contains multiple drawings). Options include "on", "off" and "conditional" (item disappears after a determined length of inactivity. Default is "conditional". */
        this.NAME_VIEW = "conditional";
        
        /** Determines where on the canvas the Map name appears. Options include "left top" and "right top". Default is "left top" */
        this.NAME_POSITION = this.gridDefaults["name"];
        
        /** Determines the text color of the Map name. This should be a valid Hex color code including the hash tag. Default is "#090909". */
        this.NAME_COLOR = "#909090";
        
        /** Determines the text color of the drawing name. Default is "#090909". */
        this.DRAWING_COLOR = "#909090";
        
        /** Determines background color of the + amd - of the zoom control. Default is "#ffffff". */
        this.DRAWING_BG = "#ffffff";
        
        /** Determines the active background color of the drawing name. Default is "#006bb7". */
        this.DRAWING_ACTIVE_BG = "#006bb7";
        
        /** Determines the active text color of the drawing name following a touch or click. Default is "#ffffff". */
        this.DRAWING_ACTIVE_COLOR = "#ffffff";
        
        /** Determines the hover background color of the drawing on a mouse over event. Default is "#f2f2f2". */
        this.DRAWING_HOVER_BG = "#f5f4f4";
        
        /** Determines the hover text color of the drawing name  on a mouse over event. Default is "#909090". */
        this.DRAWING_HOVER_COLOR = "#909090";
        
        /** Determines if the Entity Enhancement feature is enabled or disabled. Options include "on" and "off". Default is "on". **/
        //this.NAME_ENTITY_ENHANCEMENT = "on";
        
        /** @private */
        this.ui.drawings = {};
        
        /** @private */
        this.ui.zoom = null;
        
        /** Determines whether to show the zoom control. Options include "on", "off" and "conditional" (item disappears after a determined length of inactivity. Default is "conditional". */
        this.ZOOM_VIEW = "conditional";
        
        /** Determines where on the canvas the Zoom control appears. Options include "left top", "center top", "right top", "left center", "right center", "left bottom", "center bottom", "right bottom". Default is "center bottom". */
        this.ZOOM_POSITION = this.gridDefaults["zoom"];
        
        /** Determines the text color of the + amd - of the zoom control. Default is "#090909". */
        this.ZOOM_COLOR = "#909090";
        
        /** Determines background color of the + amd - of the zoom control. Default is "#ffffff". */
        this.ZOOM_BG = "#ffffff";
        
        /** Determines the active background color of the + amd - of the zoom control following a touch or click. Default is "#006bb7". */
        this.ZOOM_BG_ACTIVE = "#006bb7";
        
        /** Determines the active text color of the + amd - of the zoom control following a touch or click. Default is "#ffffff". */
        this.ZOOM_BG_ACTIVE_COLOR = "#ffffff";
        
        /** Determines the hover background color of the + amd - of the zoom control on a mouse over event. Default is "#f2f2f2". */
        this.ZOOM_HOVER_BG_COLOR = "#f2f2f2";
        
        /** Determines the hover text color of the + amd - of the zoom control on a mouse over event. Default is "#f2f2f2". */
        this.ZOOM_HOVER_COLOR = "#909090";
        
        /** Determines zoom display orientation. Options include "v" (vertically aligned) and "h" (horizontally aligned). Default is "h". */
        this.ZOOM_DISPLAY = "h";
        
        /** @private */
        this.ui.levels = null;
        
        /** Determines whether to show the Levels control. Options include "on", "off" and "conditional" (item disappears after a determined length of inactivity. If the current drawing only has one level, then this setting is rendered useless and the Levels control will not show. Default is "conditional". */
        this.LEVELS_VIEW = "conditional";
        
        /** Determines where on the canvas the Level control appears. Options include "left top" and "right top". Default is "left top". */
        this.LEVELS_POSITION = this.gridDefaults["levels"];
        
        /** Determines the text color of the level numbers. Default is "#909090". */
        this.LEVELS_COLOR = "#909090";
        
        /** Determines the background color of the level numbers. Default is "#ffffff". */
        this.LEVELS_BG = "#ffffff";
        
        /** Determines the active background color of the level numbers. Default is "#006bb7". */
        this.LEVELS_BG_ACTIVE = "#006bb7";
        
        /** Determines the active text color of the level numbers. Default is "#ffffff". */
        this.LEVELS_ACTIVE_COLOR = "#fff";
        
        /** Determines the hover background color of the level on a mouse over event. Default is "#f2f2f2". */
        this.LEVELS_HOVER_BG_COLOR = "#f5f4f4";
        
        /** Determines the hover background color of the level on a mouse over event. Default is "#909090". */
        this.LEVELS_HOVER_COLOR = "#909090";
        
        
        /** @private */
        this.ui.geo = null;
        /** @private */
        this.GEO_VIEW = "conditional";
        /** @private */
        this.GEO_SCALE_WIDTH = 55;
        /** @private */
        this.GEO_UNITS = "standard";
        /** @private */
        this.GEO_POSITION = this.gridDefaults["geo"];
        /** @private */
        this.GEO_UNITS_TOGGLE = "on";
        /** @private */
        this.GEO_ORIENT_TOGGLE = "on";
        
        /** @private */
        this.ui.attribution = null;
        
        /** Determines where on the canvas the Attribution appears. Options include "left bottom" and "right bottom". Default is "left bottom". */
        this.ATTRIBUTION_POSITION = this.gridDefaults["attribution"];
        
        /** @private */
        this.ui.reg = {};
        
	/** @private */
	this.activePinch = false;
	/** @private */
	this.pinchCenter = null;
	/** @private */
	this.pinchStartDistance = null;
	/** @private */
	this.pinchEndDistance = null;
	/** @private */
	this.pinchScale = null;
	
	/** @private */
	this.backButton = null;
	/** @private */
	this.backActive = false;

	//create the mouse input shield
	this.createMouseShield();

	/** @private */
	this.startX = 0;
	/** @private */
	this.startY = 0;
	/** @private */
	this.moveX = 0;
	/** @private */
	this.moveY = 0;
        /** @private */
	this.moveTs = 0;
	/** @private */
	this.moveTe = 0;
        /** @private */
	this.moveSx = 0;
	/** @private */
	this.moveSy = 0;
	/** @private */
	this.startPan = false;
	/** @private */
	this.startZoom = false;
	/** @private */
	this.startTarget = null;
	/** @private */
	this.moved = false;
    /** @private */
    this.lastTouch = null;
    /** @private */
    this.conditionalAction = null;
    /** @private */
    this.fadeInterval = new Array;
    /** @private */
    this.fadeItems = new Array;
    /** @private */
    this.heightMarker = new Array;
    /** @private */
    this.widthMarker = new Array;

	/** @private */
	this.data = null;
	/** @private */
	this.view = null;
	/** @private */
	this.mapCanvas = null;
	/** @private */
	this.mapEvent = null;
        
}

/*
 *	These methods show and hide the loading gif as a background image 
 */
micello.maps.MapGUI.prototype.showLoading = function () {
        micello.util.addCss(this.viewportElement, {backgroundImage: "url('"+micello.maps.request.LOADING_URL+"')"});
}
micello.maps.MapGUI.prototype.hideLoading = function () {
         micello.util.addCss(this.viewportElement, {backgroundImage: "none"});
}

/** This is how many pixels we can move the mouse move and still have it count as a click.
 * @private */
micello.maps.MapGUI.MOVE_LIMIT = 2;

micello.maps.MapGUI.CONTROL_ZINDEX = 101;

micello.maps.MapGUI.POPUP_ZINDEX = 110;

/** This is the width threshold to tell the Control Bar to go from Full to Mini mode. This is in Pixels. This is deprecated as of 0.59. */
/** @deprecated */
micello.maps.MapGUI.MIN_THRESHOLD = 400;

/** @private */
micello.maps.MapGUI.transformName = null;
/** @private */
micello.maps.MapGUI.originTransformName = null;
/** @private */
micello.maps.MapGUI.detectTransformName = function(element) {
	element.style.webkitTransform = "scale(1.0)";
	if(element.style.cssText.search("-transform") >= 0) {
		micello.maps.MapGUI.setCssScale = micello.maps.MapGUI.setWebkitCssScale;
		micello.maps.MapGUI.setCssOrigin = micello.maps.MapGUI.setWebkitCssOrigin;
		return;
	}
	if(element.style.MozTransform == "") {
		micello.maps.MapGUI.setCssScale = micello.maps.MapGUI.setMozCssScale;
		micello.maps.MapGUI.setCssOrigin = micello.maps.MapGUI.setMozCssOrigin;
		return;
	}

	element.style.msTransform = "scale(1.0)";
	if(element.style.cssText.search("transform") >= 0) {
		micello.maps.MapGUI.setCssScale = micello.maps.MapGUI.setMsCssScale;
		micello.maps.MapGUI.setCssOrigin = micello.maps.MapGUI.setMsCssOrigin;
		return;
	}
}

/** This method should be called if the map view is resized. It will
 * be called automatically if the browser window resizes. */
/** @private */
micello.maps.MapGUI.prototype.onResize = function() {
    
	//resize, if needed
	var width = this.viewportElement.offsetWidth;
	var height = this.viewportElement.offsetHeight;
	if((this.mapCanvas.lastViewportHeight != height)||(this.mapCanvas.lastViewportWidth != width)) {
		this.mapCanvas.drawMap();
	}
        
        var drawing = this.data.getCurrentDrawing();
        this.createUI(drawing);
        
        var level = this.data.getCurrentLevel();
        this.UILevelsCorrection(level);

}

/** @private */
micello.maps.MapGUI.prototype.onMouseDown = function(e) {
	//for pre-9 ie
	//if(!e) e = window.event;
	var target = e.target; //w3c
	
	//note - for ie 8 we couldn't set the mapTarget flag
	if((!target)||(!target.mapTarget)) return;
	
	e.cancelBubble = true;
	if(e.stopPropogation) e.stopPropogation();

	if(!this.view) return;

	this.startTarget = target;

        micello.util.addCss(this.shield, {
                display: "block"
        });
	
	this.startX = e.pageX;
	this.startY = e.pageY;
	this.startPan = true;
	this.startZoom = false;
	this.moveX = 0;
	this.moveY = 0;
        this.moveTe = 0;
        this.moveSx = 0;
        this.moveSy = 0;
        this.moveTs = 0;
	this.mapCanvas.mapMomentum.killMomentum();
	this.fadeOut('ui-drawings');
}

/** @private */
micello.maps.MapGUI.prototype.onMouseUp = function(e) {

	startTarget = null;
	var target = e.target; //w3c
	if((!target)||(!target.mapTarget)) return;

	e.cancelBubble = true;
	if(e.stopPropogation) e.stopPropogation();
        
        micello.util.addCss(this.shield, {
                display: "none"
        });

	if((Math.abs(this.moveX) <= micello.maps.MapGUI.MOVE_LIMIT)&& (Math.abs(this.moveY) <= micello.maps.MapGUI.MOVE_LIMIT)) {
		if (e.target.nodeName == "DIV" || e.target.nodeName == "CANVAS" || e.target.nodeName == "IMG") { // prevents a click from occuring when a pinch is released in some android browsers. Anthony - 7/16/13
			startTarget = this.startTarget;
			this.fireMouseClick();
		}
	} else {
            if( this.startPan === true ) {
                this.mapCanvas.mapMomentum.begin(this.mapElement, [this.view.mapXInViewport, this.view.mapYInViewport], [this.moveX, this.moveY], [this.moveSx, this.moveSy], this.moveTe );
            }
        }
        
	this.startPan = false;
	this.startZoom = false;
	this.moved = false;
	this.startTarget = null;
	
}

/** @private */
micello.maps.MapGUI.prototype.onMouseOut = function(e) {

	var target = e.target; //w3c
	if((!target)||(!target.mapTarget)) return;

	e.cancelBubble = true;
	if(e.stopPropogation) e.stopPropogation();

	if(this.moved) {
		this.startPan = false;
		this.moved = false;
	}
}

/** @private */
micello.maps.MapGUI.prototype.onMouseMove = function(e) {
	
	var target = e.target;
	if((!target)||(!target.mapTarget)) return;

	e.cancelBubble = true;
	if(e.stopPropogation) e.stopPropogation();

	if(this.startPan) {
		this.view.translate(e.pageX - this.startX,e.pageY - this.startY);
		this.moveX += e.pageX - this.startX;
		this.moveY += e.pageY - this.startY;
                if( this.moveTs == 0 ) {
                   this.moveTs = Date.now();//start the timer
                }
                this.moveTe = Date.now() - this.moveTs;//elapsed time
                this.moveSx = Math.abs(this.moveX/this.moveTe*100); //speed along the X axis -- pixels per second
                this.moveSy = Math.abs(this.moveY/this.moveTe*100); //speed along the Y axis -- pixels per second
		this.startX = e.pageX;
		this.startY = e.pageY;
		this.moved = true;
	}
        
        this.conditionalUI();
}

//touch functions, from apple
/** @private */
micello.maps.MapGUI.prototype.onTouchStart = function(e) {

	var onMap = true;
	var i;
	for(i=0;i<e.touches.length;i++) {
		if((!e.touches[i].target)||(!e.touches[i].target.mapTarget)) onMap = false;
	}

    // Start tracking when the first finger comes down in this element
    if (e.touches.length == 1) {
		if(!onMap) {
			this.startPan = false;
			this.startZoom = false;
			return;
		}
		e.preventDefault();
		this.startPan = true;
		this.startZoom = false;
		this.startX = e.touches[0].clientX;
		this.startY = e.touches[0].clientY;
		this.moveX = 0;
		this.moveY = 0;
                this.moveTs = 0;
                this.moveTe = 0;
                this.moveSx = 0;
                this.moveSy = 0;
		this.startTarget = e.touches[0].target;
		this.moved = false;
	}
	else if((e.touches.length == 2)&&(onMap)) {
		this.startPan = false;
		this.startZoom = true;
		this.startX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
		this.startY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
		this.moved = false;
	}
	else {
		this.startPan = false;
		this.startZoom = false;
	}
        this.mapCanvas.mapMomentum.killMomentum();
	mapGui.fadeOut('ui-drawings');
	this.conditionalUI();
}

/** @private */
micello.maps.MapGUI.prototype.onTouchMove = function(e) {
	
	// PINCH ZOOMING
	if (e.touches.length == 2) {
		
		if (this.activePinch == false) {
			this.pinchCenter = [((e.touches[0].clientX + e.touches[1].clientX)/2), ((e.touches[0].clientY + e.touches[1].clientY)/2)];
			this.pinchStartDistance = Math.sqrt(Math.pow(Math.abs(e.touches[0].clientX - e.touches[1].clientX),2)+Math.pow(Math.abs(e.touches[0].clientY - e.touches[1].clientY),2));
			this.pinchScale = 1;
			this.activePinch = true;
		} else {
			this.pinchEndDistance = Math.sqrt(Math.pow(Math.abs(e.touches[0].clientX - e.touches[1].clientX),2)+Math.pow(Math.abs(e.touches[0].clientY - e.touches[1].clientY),2));
			this.pinchScale = this.pinchEndDistance / this.pinchStartDistance;
		}

		e.preventDefault(); // cancel any browser zooming that may happen accidentally ( pinch zoom on infowindow for example )

		this.zoomCssPreview(this.pinchScale, this.pinchCenter[0], this.pinchCenter[1]);
	}

    // Don't track motion when multiple touches are down in this element (that's a gesture)
    if ( (!this.startPan) || (e.touches.length != 1) )
        return;

	// EVERYTHING BELOW IS PANNING BEHAVIOR
    // Prevent the browser from doing its default thing (scroll, zoom)
    e.preventDefault();

    var leftDelta = e.touches[0].clientX - this.startX;
    var topDelta = e.touches[0].clientY - this.startY;

	this.view.translate(leftDelta,topDelta);
	this.moveX += leftDelta;
	this.moveY += topDelta;

    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
    if( this.moveTs == 0 ) {
       this.moveTs = Date.now();//start the timer
    }
    this.moveTe = Date.now() - this.moveTs;//elapsed time
    this.moveSx = Math.abs(this.moveX/this.moveTe*100); //speed along the X axis -- pixels per second
    this.moveSy = Math.abs(this.moveY/this.moveTe*100); //speed along the Y axis -- pixels per second
	this.moved = true;
        
    this.conditionalUI();
}

/** @private */
micello.maps.MapGUI.prototype.onTouchEnd = function(e) {

	if (this.activePinch == true) { // executing a zoom at the end of a pinch touch
		this.zoomFromPinch(this.pinchScale, this.pinchCenter[0], this.pinchCenter[1]); // execute the zoom
		this.pinchScale = null;
		this.activePinch = false;
	}
	
    // Stop tracking when the last finger is removed from this element
    if (e.touches.length > 0) return;

    // Prevent the browser from doing its default thing (scroll, zoom)
    e.preventDefault();
    var mapgui = this;
    startTarget = this.startTarget;
    if((this.startPan)&&(Math.abs(this.moveX) <= micello.maps.MapGUI.MOVE_LIMIT)&& (Math.abs(this.moveY) <= micello.maps.MapGUI.MOVE_LIMIT)) {
                
        var now = new Date().getTime();
        delta = now - this.lastTouch;
        if( delta < 150 && delta > 0) {
            this.zoomIn();
            clearTimeout(action);
        } else  {
                this.lastTouch = now;
                action = setTimeout(function(e){
                       mapgui.fireMouseClick();
                       clearTimeout(action);   // clear the timeout
               },150);
        }
        
    }
    if( this.startPan === true ) {
        
        this.mapCanvas.mapMomentum.begin(this.mapElement, [this.view.mapXInViewport, this.view.mapYInViewport], [this.moveX, this.moveY], [this.moveSx, this.moveSy], this.moveTe  );
    }
    this.startPan = false;
    this.moved = false;
    this.startTarget = null;
    this.lastTouch = now;
    
    this.conditionalUI();
}

/** @private */
micello.maps.MapGUI.prototype.onTouchCancel = function(e) {
	// Prevent the browser from doing its default thing (scroll, zoom)
    e.preventDefault();
	this.startPan = false;
	this.moved = false;
}

/*  This method displays a CSS preview of a pinch zoom, arguments are passed from onTouchMove and onGestureChange
 *  @private 
 */
micello.maps.MapGUI.prototype.zoomCssPreview = function (scale, x, y) {
	var mapPixX = x;
	var mapPixY = y;
	for(var element = this.mapElement; element != null; element = element.offsetParent) {
		mapPixX -= element.offsetLeft;
		mapPixY -= element.offsetTop;
	}
	var cpx = 100 *  mapPixX / this.mapElement.clientWidth;
	var cpy = 100 * mapPixY / this.mapElement.clientHeight;		
	micello.maps.MapGUI.setCssOrigin(this.mapElement,cpx,cpy);
	micello.maps.MapGUI.setCssScale(this.mapElement, scale);	
}
/*  This method executes a zoom in response to the end of a pinch zoom ( either onTouchEnd, or onGestureEnd )
 *  @private 
 */
micello.maps.MapGUI.prototype.zoomFromPinch = function (scale, x, y) {
	var offsetX = 0;
	var offsetY = 0;
	for(var element = this.mapElement; element != null; element = element.offsetParent) {
		offsetX += element.offsetLeft;
		offsetY += element.offsetTop;
	}	
	zoomScale = scale * this.view.getZoom();
	this.zoomEnhancement(x, y, zoomScale, false);
	this.view.setZoom(zoomScale, x-offsetX, y-offsetY);	
}

/** @private */
micello.maps.MapGUI.prototype.onKeyDown = function(e) {

    switch (e.keyCode) {
        /* +/- for zoom */
        case 187:
            e.preventDefault();
            this.zoomIn();
        break;
        case 189:
            e.preventDefault();
            this.zoomOut();
        break;
        /* Directional arrows for panning */
        case 40:
            e.preventDefault();
            this.view.translate(0,-15);
        break;
        case 39:
            e.preventDefault();
            this.view.translate(-15,0);
        break;
        case 38:
            e.preventDefault();
            this.view.translate(0,15);
        break;
        case 37:
            e.preventDefault();
            this.view.translate(15,0);
        break;
        /* Up/down levels keys (up) p (down) l -- if more than one level -- otherwise, nothing happens */
        case 80:
        case 76:
            e.preventDefault();
            drawing = this.data.getCurrentDrawing();
            level = this.data.getCurrentLevel();
            if( drawing.l.length > 1 ) {
                for(l = 0; l<drawing.l.length; l++) {
                    if( level.id === drawing.l[l].id ) {
                        
                        if( e.keyCode === 76 ) {
                            if( drawing.l[l-1] !== undefined ) {
                               this.data.setLevel(drawing.l[l-1]);
                            } else {
                                this.data.setLevel(drawing.l[drawing.l.length-1]);
                            }
                        }
                        if( e.keyCode === 80 ) {
                            if( drawing.l[l+1] !== undefined ) {
                               this.data.setLevel(drawing.l[l+1]);
                            } else {
                                this.data.setLevel(drawing.l[0]);
                            }
                        }
                        
                    }
                }
            }
            
        break;
        /* Drawing change key d -- if more than one drawing exists */
        case 68:
            e.preventDefault();
            community = this.data.getCommunity();
            drawing = this.data.getCurrentDrawing();
            if( community.d.length > 1 ) {
                for(d = 0; d<community.d.length; d++) {
                    if( drawing.id === community.d[d].id ) {
                        if ( community.d[d+1] !== undefined ) {
                            this.data.setDrawing(community.d[d+1]);
                        } else {
                            this.data.setDrawing(community.d[0]);
                        }
                    }
                }
            }
        break;
    }
    
}

/** @private */
micello.maps.MapGUI.prototype.onKeyUp = function(e) {
    

    
}

/** @private */
micello.maps.MapGUI.prototype.onMouseWheel = function(e) {

    var target = e.target; //w3c

	// Fix this mess
    if( target.parentElement.id == "ui-drawings-list" || 
        target.parentElement.className == "ui_drawing" || 
        target.parentElement.className == "ui_drawing_name" || 
        target.id == "ui-drawings" ||
        target.id == "ui-drawings-container") {
        mapGui.ui.drwLst.onMouseWheel(e);
		return;
    }

	// for some reason safari needs to have its hand held on this one
	if (target.parentElement.className == "ui_levels_floor_name") {
		mapGui.ui.levelsFlrs.onMouseWheel(e);
	}
	
	// Scroll on levels list
    if( target.id == "ui-levels-scroll-container" || 
        target.id == "ui-levels-scroll-button" || 
        target.className == "ui_levels_floor" || 
		target.className.indexOf("ui_levels_floor") != -1 ||
        target.className == "ui_levels_floor_name" || 
        target.parentElement.className == "ui_levels_floor_name" || 
        target.id == "ui-levels-floors-wrapper" ) {
        mapGui.ui.levelsFlrs.onMouseWheel(e);
		return;
    }

    e.preventDefault();
	// don't scroll on divs ( like level, drawing, zoom controls )
	// also prevents page scrolling on infowindows and popup windows ( if their inner content is something other than a div! ) 
    if(!target || target.nodeName.toUpperCase() == "DIV") return; 
    
	// SCROLL ZOOMING BELOW THIS POINT
    if (e.detail) {
        e.wheelDelta = -e.detail/3;
    }

    this.mapCanvas.mapMomentum.killMomentum();

    currScale = this.view.getZoom();
    newScale = 0;
    if ( e.wheelDelta > 0 ) {newScale = currScale * 1.25;} 
	else {newScale = currScale * 0.75;}
	
    var offsetX = 0;
    var offsetY = 0;

    for(var element = this.mapElement; element != null; element = element.offsetParent) {

		offsetX += element.offsetLeft-element.scrollLeft;
		offsetY += element.offsetTop-element.scrollTop;
    }

	this.zoomEnhancement(e.clientX - offsetX, e.clientY - offsetY, newScale, false);
	this.view.setZoom(newScale,e.clientX - offsetX,e.clientY - offsetY);
    
    this.conditionalUI();

}

/** @private */
micello.maps.MapGUI.prototype.zoomEnhancement = function(screenX, screenY, zoomScale, zoomChangeDraw) {

    /* This is turned off in 0.59 -- to be enhanced for future versions */
    this.NAME_ENTITY_ENHANCEMENT = "off"; 
    if( this.NAME_ENTITY_ENHANCEMENT == "off" ) {return;}
    
    var mapX = this.view.canvasToMapX(screenX,screenY);
    var mapY = this.view.canvasToMapY(screenX,screenY);
    var lvl = this.data.getCurrentLevel();
    var drw = this.data.getCurrentDrawing();
    var com = this.data.getCommunity();

    geomClick = this.mapCanvas.hitCheck(lvl.g,mapX,mapY);
    
    /* This checks the x,y of the geometry and determines if the polygon has info to show */
    if( this.NAME_VIEW != "off") {
        if( geomClick ) {
            if( geomClick.nm ) {
                this.ui.name.innerHTML = drw.nm+"<div id=\"ui-entity-enhancement\">"+geomClick.nm+"</div>";
            } else {
                this.ui.name.innerHTML = drw.nm;
            }
        } else {
                this.ui.name.innerHTML = drw.nm;
        }
    }
    
    /* This is experiemental and can be turned off by setting zoomChangeDraw to false */
    if( zoomChangeDraw && geomClick ) {
        if( zoomScale > 10 ) {
            if( geomClick.did ) {
                for(var cnt = 0;cnt<com.d.length;cnt++) {
                    if( com.d[cnt].id == geomClick.did ) {
                        this.view.setZoom(2,screenX,screenY);
                        mapGui.setDrawing(com.d[cnt]);
                        
                    }
                }
                
            }
        }
    }
    
}

//=================================
// Private Methods
//=================================

/** This method fires a mouse click with the proper viewport coordinates.
 * @private */
micello.maps.MapGUI.prototype.fireMouseClick = function() {
	var offsetX = 0;
	var offsetY = 0;
        this.startTarget = startTarget;
	for(var element = this.mapElement; element != null; element = element.offsetParent) {
		offsetX += element.offsetLeft;
		offsetY += element.offsetTop;
	}
	//if a element from a map object was clicked, pass the object
	var mapObject;
	if(this.startTarget) {
		mapObject = this.startTarget.mapObject
	}
	//send click to the map
	if(this.mapCanvas) this.mapCanvas.clickMouse(this.startX - offsetX,this.startY - offsetY,mapObject);
}
/** @private */
micello.maps.MapGUI.prototype.zoomIn = function() {
	if(this.view) {
		cntrPointX = this.viewportElement.offsetWidth/2 - this.view.mapXInViewport;
		cntrPointY = this.viewportElement.offsetHeight/2 - this.view.mapYInViewport;
                zoomScale = this.view.getZoom();
                this.zoomEnhancement(cntrPointX, cntrPointY, zoomScale, false);
		this.view.zoomIn();
	}
}
/** @private */
micello.maps.MapGUI.prototype.zoomOut = function() {
	if(this.view) {
		cntrPointX = this.viewportElement.offsetWidth/2 - this.view.mapXInViewport;
		cntrPointY = this.viewportElement.offsetHeight/2 - this.view.mapYInViewport;
                zoomScale = this.view.getZoom();
                this.zoomEnhancement(cntrPointX, cntrPointY, zoomScale, false);
		this.view.zoomOut();
	}
}
/** @private */
micello.maps.MapGUI.prototype.setLevel = function(level) {
	if(this.data) this.data.setLevel(level);
}
/** @private */
micello.maps.MapGUI.prototype.setDrawing = function(drawing) {
        
	if(this.data) {
		if(drawing != this.data.getCurrentDrawing()) {
			this.data.setDrawing(drawing);
		}
	}
}


/** @private */
micello.maps.MapGUI.prototype.createMouseShield = function() {

	//test-----------------------------------
        var shield = micello.util.addElem(null);
	this.shield = shield;
        this.viewportElement.appendChild(shield);
        
        micello.util.addCss(shield, {
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "100%",
            height: "100%",
            display: "none",
            zIndex: 999999
        });

	shield.mapTarget = true;

	var mapGUI = this;
	shield.onmousedown = function(e) {
		mapGUI.onMouseDown(e);
	}
	shield.onmouseup = function(e) {
		mapGUI.onMouseUp(e);
	}
	shield.onmousemove = function(e) {
		mapGUI.onMouseMove(e);
	}
	shield.onmouseout = function(e) {
		mapGUI.onMouseOut(e);
	}
	
	// these are necessary for touch events on some android browsers
	shield.ontouchstart = function(e) {
		mapGUI.onTouchStart(e);
	}
	shield.ontouchmove = function(e) {
		mapGUI.onTouchMove(e);
	}
	shield.ontouchend = function(e) {
		mapGUI.onTouchEnd(e);
	}
	
	
}

/** @private */
micello.maps.MapGUI.prototype.updateLevel = function(level) {
 
        this.UILevelsCorrection(level);
                
}

/** @private */
micello.maps.MapGUI.prototype.updateDrawing = function(drawing) {
        /* Now finish by positioning the elements */
        this.createUI(drawing);

}

/** @private */
micello.maps.MapGUI.prototype.updateCommunity = function(community) {


}

/** @private */
micello.maps.MapGUI.prototype.closeCommunity = function() {
    this.destroyUI();
}

micello.maps.MapGUI.setCssScale = null;
micello.maps.MapGUI.setCssOrigin = null;

micello.maps.MapGUI.setWebkitCssScale = function(element,scaleFactor) {
    micello.util.addCss(element, { webkitTransform: 'scale(' + scaleFactor  + ')' });
}

micello.maps.MapGUI.setMozCssScale = function(element,scaleFactor) {
    micello.util.addCss(element, { MozTransform: 'scale(' + scaleFactor  + ')' });
}

micello.maps.MapGUI.setMsCssScale = function(element,scaleFactor) {
    micello.util.addCss(element, { msTransform: 'scale(' + scaleFactor  + ')' });
}

micello.maps.MapGUI.setWebkitCssOrigin = function(element,originXPer,originYPer) {
    micello.util.addCss(element, { webkitTransformOrigin: originXPer + '% ' + originYPer + '%' });
}

micello.maps.MapGUI.setMozCssOrigin = function(element,originXPer,originYPer) {
    micello.util.addCss(element, { MozTransformOrigin: originXPer + '% ' + originYPer + '%' });
}

micello.maps.MapGUI.setMsCssOrigin = function(element,originXPer,originYPer) {
    micello.util.addCss(element, { msTransformOrigin: originXPer + '% ' + originYPer + '%' });
}

/* The UI Element Methods for each of the items to be set */

/** @private */
micello.maps.MapGUI.prototype.createUI = function (drawing) {
    
    community = this.data.getCommunity();
    
    /* Setup and add the items to the DOM */
//    this.UISections = new Array;
    
    this.UIName(community);
    this.UIZoom(community);
    this.UIAttribution(community);
    this.UILevels(drawing);

    this.UIGeo(drawing, community);
    
    this.determinePosition();
    this.UIDrawings(drawing);
    
}

/** @private */
micello.maps.MapGUI.prototype.destroyUI = function (drawing) {
    
    this.removeElement('ui-name');
    this.removeElement('ui-drawings');
    this.removeElement('ui-drawings-icon');
    this.removeElement('ui-zoom');
    this.removeElement('ui-levels');
    this.removeElement('ui-attribution');
    this.removeElement('ui-geo');
    
}

/** v0.510
 *  Constructs the map scale and compass UI elements
 * @private */
micello.maps.MapGUI.prototype.UIGeo = function (drawing, community) {
   
    this.removeElement('ui-geo');
    
    if( this.GEO_VIEW != "on" && this.GEO_VIEW != "conditional" ) {return false;}

    this.ui.geo = micello.util.addElem('ui-geo');
    micello.util.addClass(this.ui.geo, ['ui_geo', 'ui_element']);
    micello.util.addCss( this.ui.geo, {
        width: "105px",
        fontFamily: this.UI_FONT+", "+this.UI_FONT_FALLBACK
    });

    this.determinePositionArraySetup("geo", this.GEO_POSITION, 100, 15);
    this.ui.appendChild(this.ui.geo);
    this.UIReg('ui-geo', this.GEO_VIEW);


    // Map Scale 
    this.ui.map_scale = micello.util.addElem('ui_scale');
    micello.util.addCss( this.ui.map_scale, {
        borderBottom: "1px solid #999",
        position: "absolute",
        bottom: "4px",
        zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 4 
    });

    this.ui.map_scale_text = micello.util.addElem('ui-scale-text', 'p');
    micello.util.addCss( this.ui.map_scale_text, {
        color: "#999",
        fontWeight: "bold",
        margin: "0px",
        textAlign: "center"
    });

    this.updateMapScale(drawing); // calculates scale label and width and assigns values
    this.ui.map_scale.appendChild(this.ui.map_scale_text);
    this.ui.geo.appendChild(this.ui.map_scale);

    if (this.GEO_UNITS_TOGGLE == "on") {
        micello.util.addCss( this.ui.map_scale, {cursor: "pointer" } );
        var gui = this;
        changeUnits = function () { // toggle units of measure
            if ( gui.GEO_UNITS == "standard" ) {gui.GEO_UNITS = "metric";} 
            else {gui.GEO_UNITS = "standard";}
            gui.updateMapScale(drawing);
        }
        this.ui.map_scale.onclick = function () {
            changeUnits();
        }
        this.ui.map_scale.ontouchstart = function (e) {
            e.preventDefault();
            changeUnits();
        }
        
    }

    if (this.view.customView) { // don't display the compass if the developer is setting a custom rotation
        micello.util.addCss( this.ui.geo, {width: "60px" } );
        return false;
    }

    // Compass
    if (this.compassCache) {
        
        this.ui.geo.appendChild(this.compassCache);
    } else {
        this.ui.compass = micello.util.addElem('ui-compass', 'canvas');
        this.ui.COMPASS_MAX = 50;
        this.ui.compass.width = this.ui.COMPASS_MAX;
        this.ui.compass.height = this.ui.COMPASS_MAX;
        
        micello.util.addCss( this.ui.compass, {
            styleFloat: "right",
            cssFloat: "right",
            position: "relative",
            bottom: "-10px",
            zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 4
        });

        this.drawCompass(drawing.ar, this.ui.compass); // all canvas work done here
        this.ui.geo.appendChild(this.ui.compass);

        this.compassCache = this.ui.compass; // cache the compass canvas
    }
    
    if (this.GEO_ORIENT_TOGGLE == "on") {
        micello.util.addCss( this.ui.compass, {cursor: "pointer"} );
        this.ui.compass.title = "Change Orientation"; // tooltip on desktop
        var gui = this;
        var changeOrientation = function (data, mapView) { // toggles between north top ane default orientation
            delete gui.compassCache; // clear the cached compass
            if (mapView.northAtTop) {mapView.northAtTop = false;} // set to default
            else {mapView.northAtTop = true;} // set to top north   
            data.setDrawing(data.currentDrawing, data.currentLevel.id);
        }
        var data = this.data;
        var mapView = this.mapControl.view;
        this.ui.compass.onclick = function () {
            changeOrientation(data, mapView);
        }
        this.ui.compass.ontouchstart = function (e) {
            e.preventDefault();
            changeOrientation(data, mapView);
        }
    }

}


/*
 *  v0.510
 *  Calculate the value to be displayed as the map scale text, each time the UI
 *  is updated ( onResize ) and when the zoom is changed ( mapView.onZoom )
 *  @private
 */
micello.maps.MapGUI.prototype.updateMapScale = function (drawing) {    // drawing, community
    
    var latStart = (drawing.t[1]*0)+(drawing.t[3]*0)+(drawing.t[5]);
    var lonStart = (drawing.t[0]*0)+(drawing.t[2]*0)+(drawing.t[4]);
    
    var latEnd = (drawing.t[1]*drawing.w)+(drawing.t[3]*drawing.h)+(drawing.t[5]);
    var lonEnd = (drawing.t[0]*drawing.w)+(drawing.t[2]*drawing.h)+(drawing.t[4]);
    
    var R; // earth radius
    var unit; // large unit (mi/km)
    var conv; // conversion to small units (ft/m)
    var allowed; // allowed increments of each unit
    switch (this.GEO_UNITS) {
        case "standard":
            this.ui.map_scale.title = "Switch to Metric";
            R = 3959; // mi
            conv = 5280; // mi to feet conv
            unit = "ft";
            allowed = [1,2,5,10,15,20,25,30,40,50,100,200,500];
            break;
        case "metric":
            this.ui.map_scale.title = "Switch to Standard";
            R = 6371; // km
            conv = 1000; // km to meters conv
            unit = "m";
            allowed = [1,3,5,10,20,30,40,50,100];
            break;
        default: // default to standard
            R = 3959; // mi
            conv = 5280;
            unit = "ft";
            allowed = [1,2,5,10,15,20,25,30,40,50,100,200,500];
    }
    
    var toRad = ( Math.PI / 180 );
    var dLat = (latEnd-latStart) * toRad;
    var dLon = (lonEnd-lonStart) * toRad;
    
    var lat1 = latStart * toRad;
    var lat2 = latEnd * toRad;

    // Haversine distance calculation
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // corner to corner distance
    
    var hypLen = Math.sqrt(Math.pow(drawing.w,2)+Math.pow(drawing.h,2)); // corner to corner distance in micello units
    var distance = (((d/hypLen)/this.view.scale)*this.GEO_SCALE_WIDTH)*conv;

    var use = 0;
    for (var a in allowed) {
        if (distance > allowed[a]) { // find closest allowed value
            use = allowed[a];
            continue;
        } else {break;}
    }
    
    if (use==0) { // if less than the minimum unit increment, hide the scale
        micello.util.addCss( this.ui.map_scale, {display: "none"} );
    } else {
        micello.util.addCss( this.ui.map_scale, { width: (this.GEO_SCALE_WIDTH/(distance/use))+"px" });
        this.ui.map_scale_text.innerHTML = use+""+unit;
    }
    
}


/** This draws the actual arrow image onto the compass canvas. rad is in radians
 *@private */
micello.maps.MapGUI.prototype.drawCompass = function (rad, compass_c) {
    
    var r = compass_c.width/this.ui.COMPASS_MAX; // scale ratio
    
    var compass_ctx = compass_c.getContext('2d');
    compass_ctx.translate(compass_c.width / 2, compass_c.height / 2); // translate context to center
    
    var b = new Image();
    b.src = micello.SCRIPT_URL+'resources/compass_n.png';
    var north = (this.view.northAtTop) ? true : false;
    b.onload = function () { // wait for load otherwise canvas rotation happens too soon
            var sw = b.width*r; // scale width
            var sh = b.height*r; // scale height
            compass_ctx.drawImage(b, sw/-2, sh/-2, sw, sh);

            if (!north) {compass_ctx.rotate(-rad);} // use negative radians value. why? don't know.

            var a = new Image();
            a.src = micello.SCRIPT_URL+'resources/compass_arrow4.png';
            a.onload = function () {
                    var sw = a.width*r; // scale width
                    var sh = a.height*r; // scale height
                    compass_ctx.drawImage(a, sw/-2, sh/-2, sw, sh);
            }  
    }      
    
}

/** @private */
micello.maps.MapGUI.prototype.UIName = function (community) {
    
    this.removeElement('ui-name');
    this.removeElement('ui-drawings');
    this.removeElement('ui-drawings-icon');
    
    if( this.NAME_VIEW != "on" && this.NAME_VIEW != "conditional" ) {return false;}
    
    this.ui.NAME_MAX = 18;
    this.ui.NAME_MIN = 11;

    var width = this.viewportElement.clientWidth;
    this.ui.name = micello.util.addElem('ui-name');
    micello.util.addClass(this.ui.name, ['ui_name', 'ui_element']);
    
    micello.util.addCss(this.ui.name, { whiteSpace: 'pre' });
    
    var fontSize = width*.04;
    if( fontSize > this.ui.NAME_MAX) {
        fontSize = this.ui.NAME_MAX;
    }
    if( fontSize < this.ui.NAME_MIN) {
        fontSize = this.ui.NAME_MIN;
    }

    micello.util.addCss(this.ui.name, {
            fontSize: fontSize+'px',
            fontFamily: this.UI_FONT+", "+this.UI_FONT_FALLBACK
    });
    
    this.ui.nameTxt = micello.util.addElem('ui-name-text');
    micello.util.addClass(this.ui.nameTxt, 'ui_name_text');
    micello.util.addCss(this.ui.nameTxt, { color: this.NAME_COLOR });
    
    this.ui.nameTxt.innerHTML = community.p.name;
    this.ui.name.appendChild(this.ui.nameTxt);
    if( this.NAME_POSITION == "right top" ) {
        micello.util.addCss(this.ui.name, { textAlign: 'right' });
    }
    this.determinePositionArraySetup("name", this.NAME_POSITION, 1, 30);
    this.ui.appendChild(this.ui.name);
    
    this.UIReg('ui-name', this.NAME_VIEW);
    
}

/** @private */
micello.maps.MapGUI.prototype.UIDrawings = function (drawing) {

    /* The drawings is closely tied to the Name so we depend on the Name View for display */
    if( this.NAME_VIEW != "on"  && this.NAME_VIEW != "conditional" ) { 
        this.ui.DRAWINGS_VIEW = "off";
        return false; 
    }
    var mapData = this.data;
    var community = this.data.getCommunity();
    /* If there are less than two drawings, don't show this */
    if( community.d.length < 2) { 
        this.ui.DRAWINGS_VIEW = "off";
        return false; 
    }
    
    this.ui.HEIGHTINCREMENT_MAX = 50;
    this.ui.HEIGHTINCREMENT_MIN = 40;
    var height = this.viewportElement.clientHeight;
    var com;
 
    mapGui = this;
    
    var ui = this.ui;
    var heightManager = 0;
    var heightIncrement = Math.round(height*.05);
    if( heightIncrement > this.ui.HEIGHTINCREMENT_MAX) {
        heightIncrement = this.ui.HEIGHTINCREMENT_MAX;
    }
    if( heightIncrement < this.ui.HEIGHTINCREMENT_MIN) {
        heightIncrement = this.ui.HEIGHTINCREMENT_MIN;
    }
    
    if( community.d.length > 2) {
        drwShow = heightIncrement*3;
    } else {
        drwShow = heightIncrement*2;
    }
    var iconWidth = 30;
    var iconHeight = 30;
    var iconBuffer = iconWidth/2;
    var lvlArwWdth = 15;
    var totalMoved = 0;
    var downSpace = this.availSpace(this.NAME_POSITION, "h");
    var widthSpace = this.availSpace(this.NAME_POSITION, "w");


    var startScroll = false;

    ui = this.ui;

    micello.util.addCss(this.ui.name, {
            cursor: "pointer",
            height: iconHeight+'px'
    });
    
    this.ui.drawings = micello.util.addElem('ui-drawings');
    micello.util.addClass(this.ui.drawings, ['ui_drawings', 'ui_element']);
    micello.util.addCss(this.ui.drawings, {
            top: this.ui.name.offsetTop + iconHeight + iconHeight*.25 + 'px',
            display: "none",
            fontFamily: this.UI_FONT+", "+this.UI_FONT_FALLBACK
    });
    
    this.ui.drwCtr = micello.util.addElem('ui-drawings-container');
    micello.util.addClass(this.ui.drwCtr, ['ui_drawings_container', 'roundTop', 'roundBottom', 'ui-shadow']);

    if( iconWidth + iconBuffer + this.ui.name.offsetWidth > this.viewportElement.clientWidth-widthSpace.taken ) {
        drwWidth = this.viewportElement.clientWidth - widthSpace.taken;
    } else {
        drwWidth = (this.ui.name.offsetWidth + iconWidth + iconBuffer) - lvlArwWdth;
    }

    micello.util.addCss(this.ui.drawings, {
            width: drwWidth+'px',
            zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 4
    });
    micello.util.addCss(this.ui.drwCtr, {
            width: drwWidth+'px',
            zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 4
    });
    
    drwLstWidth = drwWidth+'px';
    
    this.ui.drwLst = micello.util.addElem('ui-drawings-list');
    micello.util.addClass(this.ui.drwLst, 'ui_drawings_list');
    micello.util.addCss(this.ui.drwLst, {
           width: drwLstWidth,
           zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 3
   });
    
    /* This helps us to avoid scope issues in the for loop below where mouse click events are handed out */
    /** @private */
    this.ui.drwLstEventHandler = function (did){

        com = mapData.getCommunity();
        for (var cnt = 0; cnt < com.d.length; cnt++) {
            if( did == com.d[cnt].id ) {
                mapGui.fadeOut('ui-drawings');
                mapGui.setDrawing(com.d[cnt]);
            }
        }

    }
    
    /** @private */
    drwLstClkEventHandler = function (did) {
        return function() {
            ui.drwLstEventHandler(did);
        }
    }

    drawingItem = null;
    /* Populate the list here -- it will be corrected to the right drawing later */
    for( var cnt = 0; cnt < community.d.length; cnt++ ) {
        
        drawingItem = micello.util.addElem('ui-drawings-'+community.d[cnt].id);
        drawingItem.setAttribute('drawing', community.d[cnt].id);
        micello.util.addClass(drawingItem,'ui_drawing');
        micello.util.addCss(drawingItem, {
                zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 2,
                height: heightIncrement+'px',
                top: heightManager+'px',
                left: 0,
                width: drwLstWidth,
                borderBottom: '1px solid #999'
        });

        heightManager += heightIncrement;
        
        if( drawing.id == community.d[cnt].id ) {
            micello.util.addCss(drawingItem, {
                    backgroundColor: this.DRAWING_ACTIVE_BG,
                    color: this.DRAWING_ACTIVE_COLOR
            });
        } else {
            micello.util.addCss(drawingItem, {
                    backgroundColor: this.DRAWING_BG,
                    color: this.DRAWING_COLOR
            });

            drawingItem.onmouseover = function (e) {
                this.style.backgroundColor = mapGui.DRAWING_HOVER_BG;
                this.style.color = mapGui.DRAWING_HOVER_COLOR;
            }
            drawingItem.onmouseout = function (e) {
                this.style.backgroundColor = mapGui.DRAWING_BG;
                this.style.color = mapGui.DRAWING_COLOR;
            }
        }
        
        drawingName = micello.util.addElem(null);
        drawingName.setAttribute('drawing', community.d[cnt].id);
        micello.util.addClass(drawingName, 'ui_drawing_name');
        micello.util.addCss(drawingName, {
            zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 1,
            top: heightIncrement/4 + 'px',
            left: '3px'
        });
        
        drawingName.innerHTML = community.d[cnt].nm;
        drawingItem.appendChild(drawingName);
        drawingItem.onclick = drwLstClkEventHandler(community.d[cnt].id);  
        this.ui.drwLst.appendChild(drawingItem);
    
    }
    
    /* Show only a few at a time */
    micello.util.addCss(this.ui.drawings, {
        height: drwShow+heightIncrement+'px',
        fontSize: this.ui.name.style.fontSize
    });
    micello.util.addCss(this.ui.drwCtr, { height: drwShow+'px' });
    micello.util.addCss(this.ui.drwLst, { height: heightManager+'px' });
    
    this.ui.drawings.appendChild(this.ui.drwLst);
    this.ui.appendChild(this.ui.drawings);
    
    /* Append the Icon */
    this.ui.drwIcn = micello.util.addElem('ui-drawings-icon');
    micello.util.addClass(this.ui.drwIcn, ['ui_element', 'ui-shadow']);
    micello.util.addCss(this.ui.drwIcn, {
            border: "1px solid #999",
            backgroundColor: "#fff",
            width: iconWidth+"px",
            height: iconHeight+"px"
    });
    
    this.ui.drwIcnImg = micello.util.addElem(null, "img");
    this.ui.drwIcnImg.src = micello.SCRIPT_URL+'resources/drawingsIcon.png';
    micello.util.addCss(this.ui.drwIcnImg, {
        width: "relative",
        height: "block",
        position: "absolute",
        top: iconHeight/2.8+"px",
        left: iconWidth/3.9+"px"
    });
    
    this.ui.drwIcn.appendChild(this.ui.drwIcnImg);

    /* Click event to show the drawing list selector */
    /** @private */
    drwLstSetHandler = function (){
        return function() {
            mapGui.fadeIn('ui-drawings');
        };
    }

    /* We set these listeners on a small timeout so as to ensure a misinterpeted mouseover isnt fired after clicking the root drawing */
    drwAction = setTimeout(function(e){
            mapGui.ui.drwIcn.ontouchend = drwLstSetHandler();
            mapGui.ui.name.ontouchend = drwLstSetHandler();
            mapGui.ui.name.onmouseover = drwLstSetHandler();
            mapGui.ui.drwIcn.onmouseover = drwLstSetHandler();
           clearTimeout(drwAction);   // clear the timeout
    }, 200);
               
    micello.util.addCss(this.ui.drwIcn, { top: this.ui.name.style.top });
    
    if( this.NAME_POSITION == "left top" ) {
        micello.util.addCss(this.ui.drwIcn, { left: this.ui.name.offsetLeft+'px' });
        micello.util.addCss(this.ui.drawings, { left: this.ui.name.offsetLeft+'px' });
        micello.util.addCss(this.ui.name, { left: this.ui.name.offsetLeft + (iconWidth + iconBuffer) +'px' });

        if( this.ui.name.offsetWidth + iconWidth + iconBuffer > this.viewportElement.clientWidth-widthSpace.taken ) {
            micello.util.addCss(this.ui.name, {
                    width: (this.viewportElement.clientWidth-widthSpace.taken) - (this.viewportElement.clientWidth*.025) - (iconWidth + iconBuffer) + 'px',
                    whiteSpace: ""
            });
            micello.util.addCss(this.ui.nameTxt, { width: this.ui.name.style.width });
        }
    }
    if( this.NAME_POSITION == "right top" ) {
        
        micello.util.addCss(this.ui.drwIcn, { left: this.ui.name.offsetLeft + this.ui.name.offsetWidth + iconBuffer +'px' });
        micello.util.addCss(this.ui.drawings, { left: this.ui.name.offsetLeft+'px' });
        micello.util.addCss(this.ui.name, { left: this.ui.name.offsetLeft - (iconWidth + iconBuffer) +'px' });
        
        if( this.ui.name.offsetWidth + iconWidth + iconBuffer > this.viewportElement.clientWidth-widthSpace.taken ) {
            
            micello.util.addCss(this.ui.name, {
                    width: this.viewportElement.clientWidth-widthSpace.taken - (this.viewportElement.clientWidth*.025) - (iconWidth + iconBuffer) + 'px',
                    left: widthSpace.taken +'px',
                    whiteSpace: ""
            });
            micello.util.addCss(this.ui.nameTxt, { width: this.ui.name.style.width });
            micello.util.addCss(this.ui.drawings, {
                    width: this.ui.name.offsetWidth+iconWidth +'px',
                    left: widthSpace.taken+'px'
            });
            micello.util.addCss(this.ui.drwIcn, { left: this.ui.name.offsetLeft + this.ui.name.offsetWidth + iconBuffer +'px' });
            
        } 

        micello.util.addCss(this.ui.drwCtr, {
                width: this.ui.drawings.style.width,
                left: lvlArwWdth+'px'
        });
        micello.util.addCss(this.ui.drwLst, { width: this.ui.drawings.style.width });

        
    }
    
    this.ui.drwLst.ondragstart = function() {return false}
    
    /* Scroll wheel mgmt for drawings list */
    /** @private */
    this.ui.drwLst.onMouseWheel = function(e) {

        e.preventDefault();
        ui =  mapGui.ui;
        
        if (e.detail) {
            e.wheelDelta = -e.detail/3;
        }

        if( e.wheelDelta < 0) {
            newScale = ui.drwLst.offsetTop - heightIncrement/2;
        } else {
            newScale = ui.drwLst.offsetTop + heightIncrement/2;
        }

        micello.util.addCss(ui.drwLst, {
            left: 0,
            top: newScale+'px'
        });

        mapGui.UIDrawingListContain(ui);
        mapGui.UIDrawingArrowToggle();
        mapGui.conditionalUI();

    }
    
    this.ui.drawings.ontouchstart = function(e){
        
        e.preventDefault ();
        e.stopPropagation();
        startPos = e.touches[0].pageY;
        startScroll = true;
        totalMoved = 0;

    }
    
    this.ui.drawings.ontouchmove = function(e){
        
      if(e.touches.length == 1){ // Only deal with one finger
          
        e.preventDefault();

        var touch = e.touches[0]; // Get the information for finger #1

        fingerMoved = startPos - touch.pageY;
        totalMoved += fingerMoved;
        startPos = touch.pageY;
       
        micello.util.addCss(ui.drwLst, {
            left: 0,
            top: ui.drwLst.offsetTop - fingerMoved+'px'
        });
        
        mapGui.UIDrawingListContain(ui);
        mapGui.UIDrawingArrowToggle();
        mapGui.conditionalUI();

      }
    }
    
    this.ui.drawings.ontouchend = function(e){

        if((startScroll)&&(Math.abs(totalMoved) <= micello.maps.MapGUI.MOVE_LIMIT)) {

            var drw = e.target.getAttribute("drawing");
            if( drw ) {
                ui.drwLstEventHandler(drw);
            }
            
        }
        startScroll = false;
    }
    
    
    this.ui.drawings.appendChild(this.ui.drwCtr);
    this.ui.drwCtr.appendChild(this.ui.drwLst);
    this.ui.appendChild(this.ui.drwIcn);

    this.ui.nameTxt.innerHTML = drawing.nm;
    this.ui.drawings.currDraw = drawing.id;
    this.UIDrawingArrow();
    this.UIReg('ui-drawings-icon', this.NAME_VIEW);
    if( this.NAME_VIEW == "conditional" ) {
        this.UIReg('ui-drawings', "conditional_hidden");
    }
    
}

/** @private */
micello.maps.MapGUI.prototype.UIDrawingListContain = function (ui) {

    if(ui.drwLst.offsetTop > 0) {
        micello.util.addCss(ui.drwLst, { top: '0px' });
    }

    if( (ui.drwLst.offsetTop + ui.drwLst.offsetHeight)  <= (ui.drwCtr.offsetTop + ui.drwCtr.offsetHeight) ) {
        micello.util.addCss(ui.drwLst, { top: (ui.drwCtr.offsetTop + ui.drwCtr.offsetHeight)-ui.drwLst.offsetHeight+'px' });
    }

}

/** @private */
micello.maps.MapGUI.prototype.UIDrawingArrow = function () {
    
    var mapGui = this;
    var ui = this.ui;
    
    /* Up Arrow */
    this.ui.drwArwUp = micello.util.addElem('ui-drawings-arrow-up');
    micello.util.addCss(this.ui.drwArwUp, {
            width: lvlArwWdth+"px",
            top: "0px",
            height: "40px",
            display: "none",
            zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 6
    });
    
    if( this.NAME_POSITION == "right top" ) {
        micello.util.addCss(this.ui.drwArwUp, { left: '0px' });
    } else {
        micello.util.addCss(this.ui.drwArwUp, { left: drwWidth+'px' });
    }
    this.ui.drawings.appendChild(this.ui.drwArwUp);

    this.ui.drwArwUpImg = micello.util.addElem(null, 'img');
    this.ui.drwArwUpImg.src = micello.SCRIPT_URL+'resources/arrowUp.png';
    micello.util.addCss(this.ui.drwArwUpImg, {
	width: "60%",
        position: "absolute",
        top: "0px",
        left: "5px"
    });

    this.ui.drwArwUp.appendChild(this.ui.drwArwUpImg);

    this.ui.drwArwUp.onclick = function (e) {

        newScale = ui.drwLst.offsetTop + heightIncrement/2;

        micello.util.addCss(ui.drwLst, {
                left: 0,
                top: newScale+'px'
        });
        mapGui.UIDrawingListContain(ui);
        mapGui.UIDrawingArrowToggle();

    }
    
    /* Down Arrow */
    this.ui.drwArwDn = micello.util.addElem('ui-drawings-arrow-down');

    micello.util.addCss(this.ui.drwArwDn, {
            width: lvlArwWdth+"px",
            top: drwShow-20+"px",
            height: "40px",
            display: "none",
            zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 6
    });
    
    if( this.NAME_POSITION == "right top" ) {
        micello.util.addCss(this.ui.drwArwDn, { left: '0px' });
    } else {
        micello.util.addCss(this.ui.drwArwDn, { left: drwWidth+'px' });
    }

    this.ui.drawings.appendChild(this.ui.drwArwDn);

    this.ui.drwArwDnImg = micello.util.addElem(null, "img");
    this.ui.drwArwDnImg.src = micello.SCRIPT_URL+'resources/arrowDwn.png';
    
    micello.util.addCss(this.ui.drwArwDnImg, {
            width: "60%",
            height: "60%",
            position: "absolute",
            top: "0px",
            left: "5px"
    });

    this.ui.drwArwDn.appendChild(this.ui.drwArwDnImg);

    this.ui.drwArwDn.onclick = function (e) {

        newScale = ui.drwLst.offsetTop - heightIncrement/2;

        micello.util.addCss(ui.drwLst, {
                top: newScale+'px',
                left: 0
        });
        mapGui.UIDrawingListContain(ui);
        mapGui.UIDrawingArrowToggle();
        

    }
    
    this.UIDrawingArrowToggle();
    
    
}

/** @private */
micello.maps.MapGUI.prototype.UIDrawingArrowToggle = function () {

    mapGui = this;
    if( heightManager > drwShow && (this.ui.drwLst.offsetTop + heightManager)  != (this.ui.drwCtr.offsetTop + this.ui.drwCtr.offsetHeight) ) { 
        this.UIDrawingCond = setTimeout(function(e){
            mapGui.fadeIn('ui-drawings-arrow-down');
            clearTimeout(mapGui.UIDrawingCond);
        }, 750);    
    } else {
        this.UIDrawingCond = setTimeout(function(e){
            mapGui.fadeOut('ui-drawings-arrow-down');
            clearTimeout(mapGui.UIDrawingCond);
        }, 750);
    }
    
    if( this.ui.drwLst.offsetTop < 0 ) {
        this.UIDrawingCond = setTimeout(function(e){
            mapGui.fadeIn('ui-drawings-arrow-up');
            clearTimeout(mapGui.UIDrawingCond);
        }, 750);  
    } else {
        this.UIDrawingCond = setTimeout(function(e){
            mapGui.fadeOut('ui-drawings-arrow-up');
            clearTimeout(mapGui.UIDrawingCond);
        }, 750);
    }
}

/** @private */
micello.maps.MapGUI.prototype.UIZoom = function (community) {
    
    this.removeElement('ui-zoom');
    if( this.ZOOM_VIEW != "on" && this.ZOOM_VIEW != "conditional" ) {return false;}
    
    var ui = this.ui;//set a local var to get it into the event funcs
    var mapGui = this;
    
    this.ui.ZOOM_H_MAX_WIDTH = 90;
    this.ui.ZOOM_H_MAX_HEIGHT = 45;
    this.ui.ZOOM_H_MIN_WIDTH = 60;
    this.ui.ZOOM_H_MIN_HEIGHT = 30;
    
    this.ui.ZOOM_V_MAX_WIDTH = 50;
    this.ui.ZOOM_V_MAX_HEIGHT = 80;
    this.ui.ZOOM_V_MIN_WIDTH = 50;
    this.ui.ZOOM_V_MIN_HEIGHT = 60;
    
    /* Setup the overall Zoom Container */
    this.ui.zoom = micello.util.addElem('ui-zoom');
    micello.util.addClass(this.ui.zoom, ['ui_zoom',  'ui_element',  'ui-shadow']);
    micello.util.addCss(this.ui.zoom, {
            border: '1px solid '+this.ZOOM_COLOR,
            backgroundColor: this.ZOOM_BG,
            whiteSpace: 'nowrap',
            overflow: 'hidden'
    });
    
    /* Setup the static Zoom In properties and events */
    this.ui.zmIn = micello.util.addElem('ui-zoom-in');
    micello.util.addClass(this.ui.zmIn, 'ui_zoom_in');
    micello.util.addCss(this.ui.zmIn, {
            color: this.ZOOM_COLOR,
            overflow: 'hidden',
            backgroundColor: this.ZOOM_BG
    });
    this.ui.zmIn.innerHTML = "+";
    this.ui.zoom.appendChild(this.ui.zmIn);

    this.ui.zmOut = document.createElement("div");
    this.ui.zmOut.setAttribute('id', micello.util.resolveId('ui-zoom-out'));
    this.ui.zmOut.className = 'ui_zoom_out';
    this.ui.zmOut.style.color = this.ZOOM_COLOR;
    this.ui.zmOut.style.backgroundColor = this.ZOOM_BG;
    this.ui.zmOut.style.overflow = 'hidden';
    this.ui.zmOut.innerHTML = "-";
    this.ui.zoom.appendChild(this.ui.zmOut);
    
    /** @private */
    zmClkStyle = function (e) {
        var toChange = document.getElementById(e.target.id);
        micello.util.addCss(toChange, {
                backgroundColor: mapGui.ZOOM_BG_ACTIVE,
                color:  mapGui.ZOOM_BG_ACTIVE_COLOR
        });

    }
    /** @private */
    zmClkStyleRestore = function (e) {
        var toChange = document.getElementById(e.target.id);
        micello.util.addCss(toChange, {
                backgroundColor: mapGui.ZOOM_BG,
                color:  mapGui.ZOOM_COLOR
        });
        
    }

    this.ui.zmIn.onmouseover = function (e) {
        micello.util.addCss(this, {
                backgroundColor: mapGui.ZOOM_HOVER_BG_COLOR,
                color: mapGui.ZOOM_HOVER_COLOR
        });
    }
    
    this.ui.zmIn.onmouseout = function (e) {
        micello.util.addCss(this, {
                backgroundColor: mapGui.ZOOM_BG,
                color: mapGui.ZOOM_COLOR
        });
    }
    
    this.ui.zmIn.onclick = function(e) {
        zmClkStyle(e);
        mapGui.zoomIn();
        var evt = e;
        setTimeout(function(){
            zmClkStyleRestore(evt);
        }, 500);
    }
    this.ui.zmIn.ontouchstart = function(e) {
        e.preventDefault();
        zmClkStyle(e);
    }
    this.ui.zmIn.ontouchend = function(e) {
        e.preventDefault();
        zmClkStyleRestore(e);
        mapGui.zoomIn();
    }

    this.ui.zmOut.onmouseover = function (e) {
        micello.util.addCss(this, {
                backgroundColor: mapGui.ZOOM_HOVER_BG_COLOR,
                color: mapGui.ZOOM_HOVER_COLOR
        });
    }
    
    this.ui.zmOut.onmouseout = function (e) {
        micello.util.addCss(this, {
                backgroundColor: mapGui.ZOOM_BG,
                color: mapGui.ZOOM_COLOR
        });
    }
    
    this.ui.zmOut.onclick = function(e) {
        zmClkStyle(e);
        mapGui.zoomOut();
        var evt = e;
        setTimeout(function(){
            zmClkStyleRestore(evt);
        }, 500);
    }
    this.ui.zmOut.ontouchstart = function(e) {
        e.preventDefault();
        zmClkStyle(e);
    }
    this.ui.zmOut.ontouchend = function(e) {
        e.preventDefault();
        zmClkStyleRestore(e);
        mapGui.zoomOut();
    }
    

    /* These settings are dependent on the screen / size / etc of where the map is placed */
    var width = this.viewportElement.clientWidth;
    var height = this.viewportElement.clientHeight;
    var calcWidth;
    var calcHeight;

    switch (this.ZOOM_DISPLAY) {       
    
        case "v":
        
        calcHeight = height*.35;
        calcWidth = 0;
    
        if( calcHeight > this.ui.ZOOM_V_MAX_HEIGHT) {
            calcHeight = this.ui.ZOOM_V_MAX_HEIGHT;
        }
        if( calcHeight < this.ui.ZOOM_V_MIN_HEIGHT) {
            calcHeight = this.ui.ZOOM_V_MIN_HEIGHT;
        }
        calcWidth = calcHeight/2.55;
        
        micello.util.addClass(this.ui.zmIn, 'roundTop');
        micello.util.addCss(this.ui.zmIn, {
                lineHeight: calcHeight/2+'px',
                width: calcWidth+'px',
                height: calcHeight/2+'px',
                borderBottom: '1px solid '+this.ZOOM_COLOR,
                fontSize: calcHeight/3+'px'
        });
        
        micello.util.addClass(this.ui.zmOut, 'roundBottom');
        micello.util.addCss(this.ui.zmOut, {
                lineHeight: calcHeight/2.25+'px',
                width: calcWidth+'px',
                height: calcHeight/2+'px',
                fontSize: calcHeight/2.5+'px'
        });
        
        micello.util.addClass(this.ui.zoom, ['roundBottom', 'roundTop']);

        case "h":
        default:
        calcWidth = Math.ceil(width*.25);
        
        calcHeight = 0;

        if( calcWidth > this.ui.ZOOM_H_MAX_WIDTH) {
            calcWidth = this.ui.ZOOM_H_MAX_WIDTH;
        }

        if( calcWidth < this.ui.ZOOM_H_MIN_WIDTH) {
            calcWidth = this.ui.ZOOM_H_MIN_WIDTH;
        }
        calcHeight = calcWidth/4;
        
        if( calcHeight > this.ui.ZOOM_H_MAX_HEIGHT) {
            calcHeight = this.ui.ZOOM_H_MAX_HEIGHT;
        }

        if( calcHeight < this.ui.ZOOM_H_MIN_HEIGHT) {
            calcHeight = this.ui.ZOOM_H_MIN_HEIGHT;
        }
        
        inoutWidth = calcWidth/2;
        micello.util.addCss(this.ui.zmIn, {
                lineHeight: calcHeight+'px',
                width: (inoutWidth) +'px',
                height: calcHeight+'px',
                borderRight: '1px solid '+this.ZOOM_COLOR,
                fontSize: calcWidth/3+'px'
        });
        micello.util.addCss(this.ui.zmOut, {
                lineHeight: (calcHeight)-(calcHeight*.13)+'px',
                width: (inoutWidth)+'px',
                height: calcHeight+'px',
                fontSize: calcWidth/2.5+'px',
                marginRight: '-2px'
        });        

        break;
    }

    totalWidth = calcWidth;
    micello.util.addCss(this.ui.zoom, {
            width: totalWidth+'px',
            height: calcHeight+'px',
    });
    this.determinePositionArraySetup("zoom", this.ZOOM_POSITION, 100, 15);
    this.ui.appendChild(this.ui.zoom);

    this.UIReg('ui-zoom', this.ZOOM_VIEW);

    return true;
    
}

/** @private */
micello.maps.MapGUI.prototype.UILevels = function (drawing) {
    
    this.removeElement('ui-levels');
    
    if( drawing.l.length == 1 ) {
        return;
    }

    if( this.LEVELS_VIEW != "on" && this.LEVELS_VIEW != "conditional" ) {return false;}

    /* Setup the overall Levels Container */
    this.ui.levels = micello.util.addElem('ui-levels');
    micello.util.addClass(this.ui.levels, ['ui_levels', 'ui_element']);
    micello.util.addCss(this.ui.levels, { fontFamily: this.UI_FONT+", "+this.UI_FONT_FALLBACK });

    var ui = this.ui;
   
    this.UILevelsLarge(drawing, ui);

    this.determinePositionArraySetup("levels", this.LEVELS_POSITION, 200, 15);
    this.ui.appendChild(this.ui.levels);
    
    this.UIReg('ui-levels', this.LEVELS_VIEW);
    
}

/** @private */
micello.maps.MapGUI.prototype.UILevelsContain = function () {
    
    if(this.ui.levelsFlrs.offsetTop > 0) {
        micello.util.addCss(this.ui.levelsFlrs, { top: '0px' });
    }

    if( (this.ui.levelsFlrs.offsetTop + this.ui.levelsFlrs.offsetHeight)  <= (this.ui.levelsWrp.offsetTop + this.ui.levelsWrp.offsetHeight) ) {
        micello.util.addCss(this.ui.levelsFlrs, { top: (this.ui.levelsWrp.offsetTop + this.ui.levelsWrp.offsetHeight)-this.ui.levelsFlrs.offsetHeight+'px' });
    }
        
}

/** @private */
micello.maps.MapGUI.prototype.UILevelsCorrection = function (level) {

    var mapGui = this;
    var vp = this.viewportElement;
    if( this.LEVELS_VIEW != "on" && this.LEVELS_VIEW != "conditional" ) {return false;}
    if( !this.ui.levels ) {return false;}
    var height = this.viewportElement.clientHeight;
    var levelsTop = this.ui.levels.offsetTop;
    var levelsHeight = this.ui.levels.offsetHeight;
    var floorHeight = 35;//this is defined in UILevels as well
    
    var totalTakenHeight;
    
    var nodeList = vp.getElementsByClassName("ui_levels_floor");
    for( cnt = 0; cnt < nodeList.length; cnt++ ) {
        micello.util.addCss(nodeList[cnt], {
                backgroundColor: mapGui.LEVELS_BG,
                color: mapGui.LEVELS_COLOR
        });        
        micello.util.addClass(nodeList[cnt], "ui_levels_unselected");
    }
        
    element = document.getElementById(mapGui.getId('ui-levels-floor-'+level.id));
    if( element ) {
        micello.util.removeClass(element, "ui_levels_unselected");
        micello.util.addCss(element, {
                backgroundColor: mapGui.LEVELS_BG_ACTIVE,
                color: mapGui.LEVELS_ACTIVE_COLOR
        });     
    } 
        
    totalTakenHeight = this.availSpace(this.LEVELS_POSITION, "h");
    var totalAvailHeight = (height - levelsTop) - (totalTakenHeight.taken+totalTakenHeight.taken*.90);
	
	// centering the current level in the levels container
	if (parseInt(this.ui.levelsFlrs.style.height) > totalAvailHeight) { // levels are scrollable
		var targetPos = (totalAvailHeight/2)-(35/2); // the ideal offset of the current level to the levels wrapper for vertical centering
		var adjust = -( parseInt(element.style.top) - targetPos ); // the amount to adjust by to center the current level in the wrapper
		// this is where the adjust amount needs to be restricted
		if (adjust > 0) { adjust = 0; } // prevents overscrolling on top
		var adjustMax = -(parseInt(this.ui.levelsFlrs.style.height) - totalAvailHeight);
		if (adjust < adjustMax) { adjust = adjustMax; } // prevents overscrolling on bottom
                micello.util.addCss(this.ui.levelsFlrs, { top: adjust+"px" });
	}
	this.conditionalUI();
	
    /* Make sure it doesn't go smaller than two floorheights */
    if( totalAvailHeight < floorHeight*2 ) {
        totalAvailHeight = floorHeight*2;
    }
    
    if( levelsHeight > totalAvailHeight ) {
        lvlFlrH = totalAvailHeight;
        micello.util.addCss(this.ui.levels, { height: lvlFlrH+'px' });
        micello.util.addCss(this.ui.levelsCtr, { height: lvlFlrH+'px' });
        micello.util.addCss(this.ui.levelsWrp, { height: lvlFlrH+'px' });
        micello.util.addCss(this.ui.lvlArwDn, { top: lvlFlrH-20+'px' });

        this.UILevelArrowToggleCond = setTimeout(function(e){
            mapGui.UILevelArrowToggle();
            clearTimeout(mapGui.UILevelArrowToggleCond);
        }, 1000); 
        
        

    }

    
    
}    
        
/** @private */
micello.maps.MapGUI.prototype.UILevelsLarge = function (drawing, ui) {
    
    /* Because we do not know the current drawing at this time, we set up the container and wait for the callback 
     * from the drawing load to fire and fill in the last piece with the events
     */

    ui.LEVELS_V_MAX_WIDTH = 50;
    ui.LEVELS_V_MAX_HEIGHT = 250;
    ui.LEVELS_V_MIN_WIDTH = 50;
    ui.LEVELS_V_MIN_HEIGHT = 150;
    
    var height = this.viewportElement.clientHeight;
    
    var calcHeight = height*.45;
    var calcWidth = 0;

    if( calcHeight > ui.LEVELS_V_MAX_HEIGHT) {
        calcHeight = ui.LEVELS_V_MAX_HEIGHT;
    }
    if( calcHeight < ui.LEVELS_V_MIN_HEIGHT) {
        calcHeight = ui.LEVELS_V_MIN_HEIGHT;
    }
    calcWidth = calcHeight/4;
    if( calcWidth > ui.LEVELS_V_MAX_WIDTH) {
        calcWidth = ui.LEVELS_V_MAX_WIDTH;
    }
    if( calcWidth < ui.LEVELS_V_MIN_WIDTH) {
        calcWidth = ui.LEVELS_V_MIN_WIDTH;
    }
    
    /* Calculate the Level container height width for later use */
    

    var floorHeight = 35;
    var floorHeightManager = 0;
    var lvlFlrH = floorHeight*drawing.l.length;
    var lvlWidth = 30;
    var lvlWrpWidth = lvlWidth;
    var lvlStartScroll = false;
    var startLvlScroll = false;
    var lvlClick = false;
    var lvlBtnScroll = false;
    var arwWdth = 15;
    var mapGui = this;
    var mapData = this.data;
    var nameShortened = null;
    var ui = this.ui;
    var vp = this.viewportElement;
    
    /* Setup the static Levels properties */
    micello.util.addCss(ui.levels, {
            width: calcWidth+'px',
            zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 1
    });
    
    ui.levelsCtr = micello.util.addElem('ui-levels-floors-container');
    micello.util.addClass(ui.levelsCtr, 'ui_levels_floors_container');
    micello.util.addCss(ui.levelsCtr, { width: lvlWrpWidth+'px' });

    ui.levels.appendChild(ui.levelsCtr);
    
    ui.levelsWrp = micello.util.addElem('ui-levels-floors-wrapper');
    micello.util.addClass(ui.levelsWrp, ['ui_levels_floors_wrapper', 'roundTop', 'roundBottom', 'ui-shadow ']);
    micello.util.addCss(ui.levelsWrp, {
	width: lvlWrpWidth+'px',
        border: '1px solid '+this.LEVELS_COLOR
    });

    if( this.LEVELS_POSITION == "right top" ) {
        micello.util.addCss(ui.levelsWrp, { left: arwWdth+'px' });
    } else {
        micello.util.addCss(ui.levelsWrp, { left: '0px' });
    }

    ui.levels.appendChild(ui.levelsWrp);
    
    ui.levelsFlrs = micello.util.addElem('ui-levels-floors');
    micello.util.addClass(ui.levelsFlrs, 'ui_levels_floors');
    micello.util.addCss(ui.levelsFlrs, {
	color: this.LEVELS_COLOR,
        width: lvlWrpWidth+'px',
        left: 0,
        top: 0,
        zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 2
    });

    ui.levelsWrp.appendChild(ui.levelsFlrs);

    ui.lvlLstEventHandler = function(lid){
        
        /* Remove all backgrounds prior to setting the active one */
        var nodeList = this.getElementsByClassName("ui_levels_floor");
        
        for( cnt = 0; cnt < nodeList.length; cnt++ ) {
            micello.util.addCss(nodeList[cnt], {
                    backgroundColor: mapGui.LEVELS_BG,
                    color: mapGui.LEVELS_COLOR
            });
            micello.util.addClass(nodeList[cnt], "ui_levels_unselected");
        }
            
        currDraw = mapData.getCurrentDrawing();
        for (cnt = 0; cnt < currDraw.l.length; cnt++) {
            element = document.getElementById(mapGui.getId('ui-levels-floor-'+lid));
            if( currDraw.l[cnt].id == lid ) {
                mapGui.setLevel(currDraw.l[cnt]);
                micello.util.removeClass(element, "ui_levels_unselected");
                micello.util.addCss(element, {
                    backgroundColor: mapGui.LEVELS_BG_ACTIVE,
                    color: mapGui.LEVELS_ACTIVE_COLOR
                });   
            } 
        }
            
    }
    
    /** @private */
//    lvlListClckEventHandler = function (lid) {
//        return function () {
//            ui.lvlLstEventHandler(lid);
//        }
//    }
   
    /* Finally, set the levels */   
    for( cnt = drawing.l.length-1; cnt >= 0; cnt-- ) {
        
        floor = micello.util.addElem(this.getId('ui-levels-floor-'+drawing.l[cnt].id));
        floor.setAttribute('level', drawing.l[cnt].id);
        micello.util.addClass(floor, ['ui_levels_floor', 'ui_levels_unselected']);
        micello.util.addCss(floor, {
            height: floorHeight+'px',
            top: floorHeightManager+'px',
            backgroundColor: this.LEVELS_BG,
            width: lvlWrpWidth+'px'
        });
        
        floorHeightManager += floorHeight;

        if( cnt != drawing.l.length-1) {
            micello.util.addCss(floor, { borderTop: '1px solid #f2f2f2' });
        }
        floor.onclick  = function (e) {
            ui.lvlLstEventHandler(this.getAttribute("level"));
        }
        floor.onmouseover = function (e) {
            if( micello.util.hasClass(this, "ui_levels_unselected")) { 
                micello.util.addCss(this, {
                        backgroundColor: mapGui.LEVELS_HOVER_BG_COLOR,
                        color: mapGui.LEVELS_HOVER_COLOR
                });
            }
        }
        floor.onmouseout = function (e) {
            if( micello.util.hasClass(this, "ui_levels_unselected")) {
                micello.util.addCss(this, {
                        backgroundColor: mapGui.LEVELS_BG,
                        color: mapGui.LEVELS_COLOR
                });
            }
        }
        micello.util.addCss(floor, { zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 3 });
        
        floorName = micello.util.addElem(this.getId('ui-levels-floor-'+drawing.l[cnt].id));
        floorName.setAttribute('level', drawing.l[cnt].id);
        micello.util.addClass(floorName, ['ui_levels_floor_name']);
        micello.util.addCss(floorName, { fontSize: lvlWrpWidth*.60+'px' });

        //this logic needs to be improved---------------
        var lvlName = drawing.l[cnt].p.name;
        if(!lvlName) lvlName = "z=" + drawing.l[cnt].z;
        nameShortened = lvlName.substring(0,2);
        //        nameShortened = drawing.l[cnt].nm.substring(0,2);
        //---------------------------------------------
        
        floorName.innerHTML = nameShortened;
        if( nameShortened.length == 1 ) {
            micello.util.addCss(floorName, { left: lvlWrpWidth*.30+'px' });
        }
        if( nameShortened.length == 2 ) {
            micello.util.addCss(floorName, { left: lvlWrpWidth*.15+'px' });
        }

        micello.util.addCss(floorName, {
                top: floorHeight*.25+'px',
                zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 1
        });

        floor.appendChild(floorName);
        ui.levelsFlrs.appendChild(floor);

    
    }

    micello.util.addCss(ui.levels, { height: lvlFlrH+'px' });
    micello.util.addCss(ui.levelsCtr, { height: lvlFlrH+'px' });
    micello.util.addCss(ui.levelsFlrs, { height: floorHeightManager+'px' });
    micello.util.addCss(ui.levelsWrp, { height: lvlFlrH+'px' });

    /* Setup the touch and mouse actions */
    ui.levelsFlrs.onMouseWheel = function(e) {

        e.preventDefault();
		e.cancelBubble = true;
		if(e.stopPropogation) e.stopPropogation();
        
        var ui =  mapGui.ui;
        
        if (e.detail) {
            e.wheelDelta = -e.detail/3;
        }
        btnMove = (floorHeight/floorHeightManager)*700;

        if( e.wheelDelta < 0 ) {
            newLvlScale = ui.levelsFlrs.offsetTop-btnMove;
        } else {
            newLvlScale = ui.levelsFlrs.offsetTop+btnMove;
        }
        micello.util.addCss(ui.levelsFlrs, {
                left: 0,
                top: newLvlScale+'px'
        });

        mapGui.UILevelsContain();
        mapGui.UILevelArrowToggle();
        mapGui.conditionalUI();

    }

    this.ui.levels.ontouchstart = function(e){
        
        e.preventDefault();
        startLvlPos = e.touches[0].pageY;
        startLvlScroll = true;
        totalMoved = 0;
        
    }
    
    this.ui.levels.ontouchmove = function(e){
        
      if(e.touches.length == 1){
          
        e.preventDefault();
        var touch = e.touches[0];

        ui.levelsFlrs.style.left = 0;
        if( startLvlScroll == true ) {
            
            fingerMoved = startLvlPos - touch.pageY;
            totalMoved += fingerMoved;
            startLvlPos = touch.pageY;

            ui.levelsFlrs.style.top = ui.levelsFlrs.offsetTop-fingerMoved+'px';
            mapGui.UILevelsContain();
            
        }
        
        mapGui.UILevelArrowToggle();
        mapGui.conditionalUI();
        
      }
    }
    
    this.ui.levels.ontouchend = function(e){
       
        if((startLvlScroll)&&(Math.abs(totalMoved) <= micello.maps.MapGUI.MOVE_LIMIT)) {

            var lvl = e.target.getAttribute("level");
            if( lvl ) {
                ui.lvlLstEventHandler(lvl);
            }
            
        }

        startLvlScroll = false;

    }
    
    this.UILevelsArrow(arwWdth, lvlWidth, lvlFlrH, floorHeightManager);
    
    
}

/** @private */
micello.maps.MapGUI.prototype.UILevelsArrow = function (arwWdth, lvlWidth, lvlFlrH, floorHeightManager) {
    
    var mapGui = this;
    var ui = this.ui;
    
    /* Up Arrow */
    this.ui.lvlArwUp = micello.util.addElem('ui-levels-arrow-up');
    micello.util.addCss(this.ui.lvlArwUp, {
            width: arwWdth+'px',
            top: '0px',
            height: '40px',
            display: 'none',
            zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 6
    });
    
    if( this.LEVELS_POSITION == "left top" ) {
        micello.util.addCss(this.ui.lvlArwUp, { left: lvlWidth*1.10+'px' });
    } else {
        this.ui.lvlArwUp.style.left = '0px';
        micello.util.addCss(this.ui.lvlArwUp, { left: '0px' });
    }

    this.ui.levels.appendChild(this.ui.lvlArwUp);

    this.ui.lvlArwUpImg = micello.util.addElem(null, 'img');
    this.ui.lvlArwUpImg.src = micello.SCRIPT_URL+'resources/arrowUp.png';
    micello.util.addCss(this.ui.lvlArwUpImg, {
	width: '60%',
        position: 'absolute',
        top: '0px',
        left: '5px'
    });
    
    this.ui.lvlArwUp.appendChild(this.ui.lvlArwUpImg);

    this.ui.lvlArwUp.onclick = function (e) {

        newScale = ui.levelsFlrs.offsetTop + floorHeight/2;
        micello.util.addCss(ui.levelsFlrs, {
            left: 0,
            top: newScale+'px'
        });
        mapGui.UILevelsContain();
        mapGui.UILevelArrowToggle(floorHeightManager);

    }
    
    /* Down Arrow */
    this.ui.lvlArwDn = micello.util.addElem('ui-levels-arrow-down');
    micello.util.addCss(this.ui.lvlArwDn, {
            width: arwWdth+'px',
            top: lvlFlrH-20+'px',
            height: '40px',
            display: 'none',
            zIndex: micello.maps.MapGUI.CONTROL_ZINDEX + 6
    });

    if( this.LEVELS_POSITION == "left top" ) {
        micello.util.addCss(this.ui.lvlArwDn, { left: lvlWidth*1.10+'px' });
    } else {
        micello.util.addCss(this.ui.lvlArwDn, { left: '0px' });
    }

    this.ui.levels.appendChild(this.ui.lvlArwDn);

    this.ui.lvlArwDnImg = micello.util.addElem(null, 'img');;
    this.ui.lvlArwDnImg.src = micello.SCRIPT_URL+'resources/arrowDwn.png';
    micello.util.addCss(this.ui.lvlArwDnImg, {
	width: 'relative',
        position: 'block',
        top: '0px',
        left: '5px'
    });
    this.ui.lvlArwDn.appendChild(this.ui.lvlArwDnImg);

    this.ui.lvlArwDn.onclick = function (e) {

        newScale = ui.levelsFlrs.offsetTop - floorHeight/2;
        micello.util.addCss(ui.levelsFlrs, {
                left: 0,
                top: newScale+'px'
        });
        mapGui.UILevelsContain();
        mapGui.UILevelArrowToggle(floorHeightManager, lvlFlrH);
        

    }
    
    this.UILevelArrowToggle(floorHeightManager, lvlFlrH);

}

/** @private */
micello.maps.MapGUI.prototype.UILevelArrowToggle = function (floorHeightManager, lvlFlrH) {

    var mapGui = this;

    if( floorHeightManager > lvlFlrH && (( this.ui.levelsFlrs.offsetTop + floorHeightManager  != this.ui.levelsWrp.offsetTop + this.ui.levelsWrp.offsetHeight)) ) { 
        this.UILevelCondDwnIn = setTimeout(function(e){
            mapGui.fadeIn('ui-levels-arrow-down');
            clearTimeout(mapGui.UILevelCondDwnIn);
        }, 750);    
    } else {
        this.UILevelCondDwnOut = setTimeout(function(e){
            mapGui.fadeOut('ui-levels-arrow-down');
            clearTimeout(mapGui.UILevelCondDwnOut);
        }, 750);
    }
    
    if( this.ui.levelsFlrs.offsetTop < 0 ) {
        this.UILevelCondUpIn = setTimeout(function(e){
            mapGui.fadeIn('ui-levels-arrow-up');
            clearTimeout(mapGui.UILevelCondUpIn);
        }, 750);  
    } else {
        this.UILevelCondUpOut = setTimeout(function(e){
            mapGui.fadeOut('ui-levels-arrow-up');
            clearTimeout(mapGui.UILevelCondUpOut);
        }, 750);
    }

}

/** @private */
micello.maps.MapGUI.prototype.UIAttribution = function (community) {
    
    var width = this.viewportElement.clientWidth;

    var calcWidth;
    var calcHeight;
    
    this.ui.ATTR_MAX_WIDTH = 110;
    this.ui.ATTR_MIN_WIDTH = 70;
    
    calcWidth = width*.15;
    
    if( calcWidth > this.ui.ATTR_MAX_WIDTH ) {
        calcWidth = this.ui.ATTR_MAX_WIDTH;
    }
    if( calcWidth < this.ui.ATTR_MIN_WIDTH ) {
        calcWidth = this.ui.ATTR_MIN_WIDTH;
    }
    calcHeight = calcWidth*0.27272727; // aspect ratio specific to attribution image
    
    if( micello.maps.key == this.ui.ATTRIBUTION_KEY ) {return false;}
    this.removeElement('ui-attribution');
    
    this.ui.attribution = micello.util.addElem('ui-attribution');
    micello.util.addClass(this.ui.attribution, ['ui_attribution', 'ui_element']);

    micello.util.addCss(this.ui.attribution, {
        width: calcWidth+'px',
        height: calcHeight+(4*(this.ui.ATTR_MAX_WIDTH/calcWidth))+'px',
        display: 'block',
        cursor: 'pointer',
        visibility: 'visible',
        margin: '0',
        padding: '0'
    });

    /* Now add the image */
    this.ui.attribution.image = micello.util.addElem(null, 'img');
    this.ui.attribution.image.src = micello.SCRIPT_URL+'resources/logo.png';
    
    micello.util.addCss(this.ui.attribution.image, {
        width: '100%',
        height: calcHeight+'px', // keeps IE happy
        position: 'absolute',
        top: '0',
        left: '0',
        visibility: 'visible',
        opacity: '.6',
        display: 'block',
        filter: 'alpha(opacity=60)'
    });
    micello.util.addClass(this.ui.attribution.image, 'ui-logo');

    this.ui.attribution.image.alt = 'Micello, Inc';
    
    this.ui.attribution.image.onclick = function (e) {
        window.open('http://www.micello.com');
    }
    
    this.ui.attribution.image.ontouchend = function (e) {
        window.open('http://www.micello.com');
    }
    
    this.ui.attribution.appendChild(this.ui.attribution.image);
    
    this.determinePositionArraySetup("attribution", this.ATTRIBUTION_POSITION, 9999, 15);
    this.ui.appendChild(this.ui.attribution);
    
}

/** @private */
micello.maps.MapGUI.prototype.determinePositionArraySetup = function (item, position, weight, margin) {

    if( this.UISections[position] == undefined ) {
        this.UISections[position] = new Array;
    }
    
    for ( i=0; i < this.UISections[position].length; i++ ) {

        if( this.UISections[position][i]["item"] == item ) {
            return;//already an entry for this item -- move on
        }
    }
    
    var itemStore = new Array;
    itemStore.item = item;
    itemStore.weight = weight;
    itemStore.margin = margin;
    
    /* This is to remember what item is where for positioning */
    this.UISections[position].push(itemStore);
    this.UISections[position].sort(function(a,b){return a.weight-b.weight});

}

/** @private */
micello.maps.MapGUI.prototype.determinePosition = function () {

    var width = this.viewportElement.clientWidth;
    var height = this.viewportElement.clientHeight;
    var topLine = 0;
    var addHeight;
    var heightAdd = 15;
    var item;
    this.heightMarker = new Array;
    
    this.positionExceptions();

    for ( var i = 0; i < this.grid.length; i++ ) {
        tmpPos = this.grid[i];
        if( !this.heightMarker[tmpPos] ) {
            this.heightMarker[tmpPos] = 10;
        }
        if( !this.widthMarker[tmpPos] ) {
            this.widthMarker[tmpPos] = 10;
        }
    }

    for ( position in this.UISections) {
        
        switch (position) {

            case "left top":
            case "center top":
            case "right top":
            case "left center":
            case "center center":
            case "right center":


                for ( cnt = 0; cnt < this.UISections[position].length; cnt++){

                    topLine = 0;
                    addHeight = this.heightMarker[position];
                    item = this.UISections[position][cnt].item;
                    margin = this.UISections[position][cnt].margin;
                    if( !margin ) {margin = heightAdd;}

                    switch (position) {

                        case "left top":
                            micello.util.addCss(this.ui[item], {
                                    top: addHeight+'px',
                                    left: width*.025+'px'
                            });
                        break;
                        case "left center":
                            topLine = height/2;
                            topLine -= topLine*.10;
                            micello.util.addCss(this.ui[item], {
                                    top: addHeight+topLine+'px',
                                    left: width*.025+'px'
                            });
                        break;
                        case "center top":
                            micello.util.addCss(this.ui[item], {
                                    top: addHeight+'px',
                                    left: (width/2)-this.ui[item].offsetWidth/2+'px'
                            });
                        break;
                        case "center center":
                            topLine = height/2;
                            topLine -= topLine*.10;
                            micello.util.addCss(this.ui[item], {
                                    top: (addHeight+topLine)+'px',
                                    left: (width/2)-this.ui[item].offsetWidth/2+'px'
                            });
                        break;
                        case "right top":
                            micello.util.addCss(this.ui[item], {
                                    top: addHeight+'px',
                                    left: width - this.ui[item].offsetWidth - width*.025+'px'
                            });
                        break;
                        case "right center":
                            topLine = height/2;
                            topLine -= topLine*.10;
                            micello.util.addCss(this.ui[item], {
                                    top: (addHeight+topLine)+'px',
                                    left: width - this.ui[item].offsetWidth - width*.025+'px'
                            });
                        break;


                    }
                    this.heightMarker[position] += this.ui[item].offsetHeight + margin;

                    /* Keep track of the widest item for future reference */
                    if( this.ui[item].offsetWidth > this.widthMarker[position] ) {
                        this.widthMarker[position] = this.ui[item].offsetWidth;
                    }

                }
        

            break;
            
            default:
                
                for ( cnt = this.UISections[position].length-1; cnt >= 0; cnt--){

                    topLine = 0;
                    addHeight = this.heightMarker[position];
                    item = this.UISections[position][cnt].item;
                    margin = this.UISections[position][cnt].margin;
                    if( !margin ) {margin = heightAdd;}

                    switch (position) {

                        case "left bottom":
                            this.ui[item].style.top = (height-(addHeight+this.ui[item].offsetHeight))+'px';
                            this.ui[item].style.left = width*.025+'px';
                        break;
                        case "center bottom":
                            this.ui[item].style.top = (height - (addHeight+this.ui[item].offsetHeight))+'px';
                            this.ui[item].style.left = (width/2)-this.ui[item].offsetWidth/2+'px';
                        break;
                        case "right bottom":
                            this.ui[item].style.top = (height - (addHeight+this.ui[item].offsetHeight))+'px';
                            this.ui[item].style.left = width - this.ui[item].offsetWidth - width*.025+'px';
                        break;


                    }
                    this.heightMarker[position] += this.ui[item].offsetHeight + margin;

                    /* Keep track of the widest item for future reference */
                    if( this.ui[item].offsetWidth > this.widthMarker[position] ) {
                        this.widthMarker[position] = this.ui[item].offsetWidth;
                    }

                }
                
            break;
            
        }
                

    }
  
    
}

/** @private */
micello.maps.MapGUI.prototype.positionExceptions = function () {
    
    var tmp;
    
    for ( position in this.UISections) {
        
        for ( cnt = 0; cnt < this.UISections[position].length; cnt++){
    
            item = this.UISections[position][cnt].item;

            switch (item) {

                case "name":
                    if( position != "left top" && position != "right top" ){
                        tmp = this.UISections[position][cnt];
                        this.UISections[position].splice(cnt, 1);
                        this.NAME_POSITION = this.gridDefaults["name"];
                        this.determinePositionArraySetup(tmp.item, this.gridDefaults["name"], tmp.weight, tmp.margin);
                    }
                break;
                
                case "zoom":
                    if( position == "center center" || !micello.util.inArray(this.grid, position) ){
                        tmp = this.UISections[position][cnt];
                        this.UISections[position].splice(cnt, 1);
                        this.ZOOM_POSITION = this.gridDefaults["zoom"];
                        this.determinePositionArraySetup(tmp.item, this.gridDefaults["zoom"], tmp.weight, tmp.margin);
                    }
                break;
                
                case "levels":
                    if( position != "left top" && position != "right top" ){
                        tmp = this.UISections[position][cnt];
                        this.UISections[position].splice(cnt, 1);
                        this.LEVELS_POSITION = this.gridDefaults["levels"];
                        this.determinePositionArraySetup(tmp.item, this.gridDefaults["levels"], tmp.weight, tmp.margin);
                    }
                break;
                
                case "attribution":
                break;
                
                case "geo":
                    if( position != "right bottom" && position != "right top" ){
                        tmp = this.UISections[position][cnt];
                        this.UISections[position].splice(cnt, 1);
                        this.GEO_POSITION = this.gridDefaults["geo"];
                        this.determinePositionArraySetup(tmp.item, this.gridDefaults["geo"], tmp.weight, tmp.margin);
                    }
                break;

            }
    
        }
        
    }
            
}

/** @private */
micello.maps.MapGUI.prototype.removeElement = function (elementId) {
    
    var mn = Number(this.viewportElement.getAttribute("mn"));
    
    var elementIdToRemove = micello.util.buildId(mn, elementId); 
    tobeRemoved = document.getElementById(elementIdToRemove);

    if( tobeRemoved ) {
        tobeRemoved.onmouseover = null;
        tobeRemoved.onclick = null;
        tobeRemoved.parentNode.removeChild(tobeRemoved);
    }
    
}

/** @private */
micello.maps.MapGUI.prototype.fadeOut = function (element) {
    
    if ( typeof this.fadeItems['out'] == 'undefined' ) {
        this.fadeItems['out'] = new Array;
    }
    
    var toFade = document.getElementById(element);
    if( !toFade ) {return;}
    if( toFade.style.display == "none" ) {return;}
    var whichFade = "out";
    var mapGui = this;
    var index = this.fadeInterval.length;

    if( !this.fadeItems['out'][element] ) {
        this.fadeItems['out'][element] = true;
        this.fadeInterval[index] = setInterval (function () {mapGui.UIFade(toFade, whichFade, index, element);}, 20 );
    }
    

}

/** @private */
micello.maps.MapGUI.prototype.fadeIn = function (element) {

    if ( typeof this.fadeItems['in'] == 'undefined' ) {
        this.fadeItems['in'] = new Array;
    }
    
    var toFade = document.getElementById(element);
    if( !toFade ) {return;}
    if( toFade.style.display != "none" ) {return;}
    var whichFade = "in";
    var mapGui = this;
    micello.util.addCss(toFade, {
            opacity: 0,
            filter: 'alpha(opacity=0)',
            display: 'block'
    });
    
    var index = this.fadeInterval.length;

    if( !this.fadeItems['in'][element] ) {
        this.fadeItems['in'][element] = true;
        this.fadeInterval[index] = setInterval ( function () {mapGui.UIFade(toFade, whichFade, index, element);}, 20 );
    }
    

}
/** @private */
micello.maps.MapGUI.prototype.UIFade = function (toFade, whichFade, index, element) {

    if ( typeof this.UIFade.fadeSet == 'undefined' ) {
        this.UIFade.fadeSet = new Array;
        this.UIFade.fadeReal = new Array;
    }
    if ( typeof this.UIFade.fadeSet[index] == 'undefined' ) {
        this.UIFade.fadeSet[index] = 0;
        this.UIFade.fadeReal[index] = 1;
    }
    this.UIFade.fadeSet[index] += .10;
    if( whichFade == "in" ) {
        this.UIFade.fadeReal[index] = this.UIFade.fadeSet[index];
    }
    if( whichFade == "out" ) {
        this.UIFade.fadeReal[index] = this.UIFade.fadeReal[index]-.10;
    }
    micello.util.addCss(toFade, {
            opacity: this.UIFade.fadeReal[index],
            filter: 'alpha(opacity='+this.UIFade.fadeReal[index]*100+')'
    });

    if( this.UIFade.fadeSet[index] >= 1.0 ) {
        if( whichFade == "in" ) {
            micello.util.addCss(toFade, { display: "block" });
        }
        if( whichFade == "out" ) {
            micello.util.addCss(toFade, { display: "none" });
        }
        clearInterval ( this.fadeInterval[index] );
        delete this.fadeInterval[index];
        delete this.fadeItems[whichFade][element];
        delete this.UIFade.fadeSet[index];
        delete this.UIFade.fadeReal[index];
    }
    

}

micello.maps.MapGUI.prototype.availSpace = function (pos,type) {
    
    var sp = new Array();
    sp.avail = 0;
    sp.taken = 0;
    
    switch(true) {
        
        case(pos == "right top" && type == "h"):
            sp.avail = this.heightMarker["right top"] - (this.heightMarker["right center"] + this.heightMarker["right bottom"]);
            sp.taken = this.heightMarker["right center"] + this.heightMarker["right bottom"];
        break;
        case(pos == "left top" && type == "h"):
            sp.avail = this.heightMarker["left top"] - (this.heightMarker["left center"] + this.heightMarker["left bottom"]);
            sp.taken = this.heightMarker["left center"] + this.heightMarker["left bottom"];
        break;
        case(pos == "right top" && type == "w"):
            sp.avail = this.widthMarker["right top"] - (this.widthMarker["center top"] + this.widthMarker["left top"]);
            sp.taken = this.widthMarker["center top"] + this.widthMarker["left top"];
        break;
        case(pos == "left top" && type == "w"):
            sp.avail = this.widthMarker["left top"] - (this.widthMarker["center top"] + this.widthMarker["right top"]);
            sp.taken = this.widthMarker["center top"] + this.widthMarker["right top"];
        break;
        
    }
    
    if( sp.avail == undefined ) {sp.avail = 0;}
    if( sp.taken == undefined ) {sp.taken = 0;}

    return sp;
}

/** @private */
micello.maps.MapGUI.prototype.error = function (msg) {
    
    var mapGui = this;
    this.ui.error = document.createElement("div");
    this.ui.error.setAttribute('id', micello.util.resolveId('ui-error'));
    
    this.ui.errorClose = document.createElement("div");
    this.ui.errorClose.setAttribute('id', micello.util.resolveId('ui-error-close'));
    
    this.ui.errorClose.innerHTML = "x";
    this.ui.error.appendChild(this.ui.errorClose);
    
    this.ui.errorCloseMsg = document.createElement("div");
    this.ui.errorCloseMsg.setAttribute('id', micello.util.resolveId('ui-error-mesg'));
    
    this.ui.errorCloseMsg.innerHTML = msg;
    this.ui.error.appendChild(this.ui.errorCloseMsg);
    
    ui = this.ui;
    this.ui.errorClose.onclick = function (e) {
        mapGui.fadeOut(ui.error);
    }
    
    this.ui.error.style.display = "none";
    this.viewportElement.appendChild(this.ui.error);
//    this.fadeIn('ui-error');
    
}

/** @private */
micello.maps.MapGUI.prototype.UIReg = function (elementId, mode) {

    mn = Number(this.viewportElement.getAttribute("mn"));
    var elementIdToReg = micello.util.buildId(mn, elementId);
    this.ui.reg[elementIdToReg] = mode;
}

/** @private */
micello.maps.MapGUI.prototype.conditionalUI = function () {
    
    var x;
    var mapGui = this;
    if( this.conditionalAction ) {
        clearTimeout(this.conditionalAction);
        for (x in this.ui.reg) {
            xChk = document.getElementById(x);
            if (!xChk) {continue;}
            if( this.ui.reg[x] == "conditional" && xChk.style.display == "none" ) {
                this.fadeIn(x);
            }
        }
        
    }
    this.conditionalAction = setTimeout(function(e){
        for (x in mapGui.ui.reg) {
            if( mapGui.ui.reg[x] == "conditional" || mapGui.ui.reg[x] == "conditional_hidden" ) {
                mapGui.fadeOut(x);
            }
        }
        clearTimeout(mapGui.conditionalAction);
    }, 4000);
    
}

/** @private */
micello.maps.MapGUI.prototype.getId = function (elementId) {

    mn = Number(this.viewportElement.getAttribute("mn"));
    return micello.util.buildId(mn, elementId);
}/**
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
micello.maps.MapData.prototype.loadCommunity = function(communityId,drawingId,levelId,mv,ev) {

	var mapMgr = this;
	var onDownload = function(community) {
		mapMgr.setCommunity(community,drawingId,levelId);
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
        
	micello.maps.request.loadCommunity(communityId,onDownload,mv,ev);
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
		micello.maps.onMapError("Display level not found");
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
		this.mapGUI.showLoading();
		var did = this.currentDrawing.id;
		var cid = this.community.id;
		micello.maps.request.loadLevelGeom(cid,did,level.id,onDownload,this.mapVersion,this.entityVersion);

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
		micello.maps.onMapError("missing overlay level");
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
			micello.maps.onMapError("Invalid overlay id");
			return;
		}
		//make sure annotation id set
		if(overlay.id != overlay.aid) {
			micello.maps.onMapError("Format error on geometry overlay.");
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
		micello.maps.onMapError("missing inlay id");
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
		micello.maps.onMapError("null community!");
		return;
	}

	this.community = community;
	this.mapVersion = this.community.mv;
	this.entityVersion = this.community.ev;
	this.initCommunity();

	//clean this up!!!
	var drawings = community.d;
	if(drawings == null) {
		micello.maps.onMapError("no drawings!");
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
		micello.maps.onMapError("no root drawing found");
		this.currentDrawing = null;
		return;
	}

	//flag the community load
	this.event.comLoad = 1;
        this.mapEvent.dispatchEvent('communityloaded', this.community);
        
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
		//micello.maps.onMapError("no geometry coordinates");
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
				this.entityGeomMatch(entity, geom, isMainAddress);
			}
		}
		else if(geom) {
			//match to this geom
			this.entityGeomMatch(entity, geom, isMainAddress);
		}
	}
}

/**
 * Match entity and geom.
 * @private
 */
micello.maps.MapData.prototype.entityGeomMatch = function(entity,geom,isMain) {
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
	this.mapCanvas.invalidateGeom(geom);
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
			var did = level.drawing.id;
			var cid = level.drawing.community.id;
			micello.maps.request.loadDrawingEntity(cid,did,onDownload,this.mapVersion,this.entityVersion);
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

	/** This is the map control
	 * @private */
	this.mapControl = mapControl;
        
	/** This is the map event handler
	 * @private */
	this.mapEvent = mapEvent;

	/** This is the map view.
	 * @private */
	this.view = null;

	/** This is the map data.
	 * @private */
	this.data = null;

	/** This is the element which holds the map. */
	this.mapElement = mapElement;
        
	/** This is the element which holds the map. */
	this.mapMomentum = new micello.maps.MapMomentum(this);

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

	/**
	 * This is a function to lookup a theme. This is populated by default to look up the
	 * default theme. Setting a custom theme can be done by overriding this function or
	 * by manually settng the needed themes using the "addTheme" function.
	 * @param {callback} setTheme This is a callback function that takes a theme as an argument.
	 * @param {String} map type for which to lookup a theme.
	 * */
	this.getTheme = micello.maps.request.loadTheme;

        /** The font family to be used across this whole map. If a web font is used it needs to be defined in CSS using 'font-face' */
//        this.MAP_FONT = "arial";

        /** Controls the capitalization of map labels. Setting to true makes labels ALL CAPS */
        this.MAP_FONT_CAPS = false;

	/** This is the minimum font size to be displayed */
        this.MAP_FONT_MIN = 9;
        /** This is the maximum font size */
        this.MAP_FONT_MAX = 28;

        /** This is the minimum scale for the text label.
         * @deprecated Replaced with the absolute font size MAP_FONT_MIN
         */
	this.MIN_TEXT_SCALE = null;
        /** This is the maximum scale for the text label.
         * @deprecated Replaced with the absolute font size MAP_FONT_MAX
         */
	this.MAX_TEXT_SCALE = null;

        /** The default color of label backgrounds @private */
        this.LABEL_BG_COLOR = "#ffffff";
        /** The default padding for label backgrounds @private */
        this.LABEL_BG_PADDING = 3;
        /** The default margin for label backgrounds @private */
        this.LABEL_BG_MARGIN = 3;
        /** The default border radius ( rounding ) for label backgrounds @private */
        this.LABEL_BG_RADIUS = 3;
        /** The default stroke color for label backgrounds @private */
        this.LABEL_BG_STROKE_COLOR = "#666666";

        /** The default drop shadow color for label backgrounds @private */
        this.LABEL_BG_SHADOW_COLOR = "#666666";
        /** Default shadow blur amount @private */
        this.LABEL_BG_SHADOW_BLUR = 3;
        /** Default shadow x-offset @private */
        this.LABEL_BG_SHADOW_XOFF = 1;
        /** Default shadow y-offset @private */
        this.LABEL_BG_SHADOW_YOFF = 1;


	/** @private */
	this.TILE_SIZE = 256;
	/** @private */
	this.DRAW_WAIT = 10;
	/** @private */
	this.TILE_FACTOR = 2;
	/** @private */
	this.IMAGE_DRAW_WAIT = 500;

	/** @private */
        this.SHADOW_COLOR = "#333333";
	/** @private */
        this.SHADOW_X = 2;
	/** @private */
        this.SHADOW_Y = 2;
	/** @private */
        this.SHADOW_BLUR = 3;

	/** @private */
	this.minMapX = 0;
	/** @private */
	this.minMapY = 0;
	/** @private */
	this.maxMapX = 0;
	/** @private */
	this.maxMapY = 0;



	/** This is a base orientation angle used for settnig label orientation
	 * @private */
	this.baseAngleRad = 0;

	this.TEXT_FLIP_BIAS = 5 * Math.PI / 180;

	this.SQAURE_TOL = .1;
	this.MAX_SQAURE = Math.PI/4;
	this.MIN_SQAURE = -Math.PI/4;
	this.DELTA_SQAURE = Math.PI/2;
	this.MAX_RECT = Math.PI/2 + this.TEXT_FLIP_BIAS;
	this.MIN_RECT = -Math.PI/2 + this.TEXT_FLIP_BIAS;
	this.DELTA_RECT = Math.PI;
}

/** This is the default zindex for a marker.
 * @private */
micello.maps.MapCanvas.DEFAULT_MARKER_ZI = 1;

//=================================
//public functions
//=================================

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

//OLD THEME OVERRIDE FUNCTIONS-----------

///** This method adds a theme to the list of active themes. This method allows the user
// * to set a collection of themes that will be used for rendering the maps. */
//micello.maps.MapCanvas.prototype.addTheme = function(theme) {
//	this.themeList.push(theme);
//}
//
///** This method clears the list of active themes. */
//micello.maps.MapCanvas.prototype.clearThemes = function() {
//	this.themeList = [];
//}
//
///** This method returns the list of active themes. */
//micello.maps.MapCanvas.prototype.getThemes = function() {
//	return this.themeList;
//}
//
///** This method sets an overide theme. */
//micello.maps.MapCanvas.prototype.setOverrideTheme = function(overrideTheme) {
//	this.overrideTheme = overrideTheme;
//}
//
///** This method sets an overide theme. */
//micello.maps.MapCanvas.prototype.setThemeFamily = function(themeFamily) {
//	this.themeFamily = themeFamily;
//}
//
///** This method sets an overide theme. */
//micello.maps.MapCanvas.prototype.getThemeFamily = function() {
//	return this.themeFamily;
//}
//-------------------------------

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
//FIX THIS SOMEHOW???----
if( mrkr.src.substr(0, 4) == "http" ) {
	var srcTmp  = mrkr.src.split(":");
	mrkr.src = micello.maps.PROTOCOL+":"+srcTmp[1];
}
//-------------------------
		}
	}
	else if(marker.mt == micello.maps.markertype.IMAGE) {
		//marker provided
		mrkr = marker.mr;
	}

	if(mrkr) {
		var element = document.createElement("img");
		element.src = mrkr.src;
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
	else {
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
		this.loadGeomMinMax(geom);
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
	var mapUpdated = false;

	//get the current level info
	var level = this.data.getCurrentLevel();
	if(!level) return;

	//init
	var mapElementWidth = this.mapElement.offsetWidth;
	var mapElementHeight = this.mapElement.offsetHeight;

	var viewportWidth = this.view.getViewportWidth();
	var viewportHeight = this.view.getViewportHeight();

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
		this.drawTile(redrawTile);
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
		this.drawTile(srcTile);
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

/** This method draws an individual tile .
 * @private */
micello.maps.MapCanvas.prototype.drawTile = function(tile) {

	//check the level
	var currentLevel = this.data.getCurrentLevel();
	if((!currentLevel)||(currentLevel.id != tile.lid)) return;

	//check the zoom
	if(this.view.getZoomInt() != tile.zoomInt) return;

	//render
	var ctx = tile.canvas.getContext('2d');

	if(ctx){
		ctx.clearRect(0,0,tile.canvas.width,tile.canvas.height);
		
		// Support old version (scale) by converting to pixel values. Based on old constant of 10px
		if (this.MIN_TEXT_SCALE != null) {this.MAP_FONT_MIN = this.MIN_TEXT_SCALE*10;}
		if (this.MAX_TEXT_SCALE != null) {this.MAP_FONT_MAX = this.MAX_TEXT_SCALE*10;}
		// Parse string values and remove 'px'
		this.MAP_FONT_MIN = parseInt(this.MAP_FONT_MIN);
		this.MAP_FONT_MAX = parseInt(this.MAP_FONT_MAX);

        // assign font for whole context
		ctx.font = this.MAP_FONT_MAX+"px "+this.themeMap.getFontFamilies();

		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';

		var m2c = this.view.getM2C();
		var c2m = this.view.getC2M();

		ctx.translate(-tile.elementX,-tile.elementY);
		ctx.transform(m2c[0],m2c[1],m2c[2],m2c[3],m2c[4],m2c[5]);

		//render main geom
		var geomArray;
		var gList = currentLevel.gList;
		for(gList.start(); ((geomArray = gList.currentList()) != null); gList.next()) {
			this.render(ctx,geomArray,tile);
		}

		ctx.transform(c2m[0],c2m[1],c2m[2],c2m[3],c2m[4],c2m[5]);
		ctx.translate(tile.elementX,tile.elementY);
	}

	//connenct tile if necessary
	tile.invalid = false;
	if(!tile.connected) {
		tile.connect();
	}
}

/** This method renders a geometry array on a canvas context.
 * @private */
micello.maps.MapCanvas.prototype.render = function(ctx,geomArray,tile) {

	if((!this.themeMap)||(!this.themeMap.isLoaded())) return;

	var count = geomArray.length;
	var zoomScale = tile.scale;
	var i;
	var geom;

	//---------------
	//render geometry
	//---------------
	for(i = 0; i < count; i++) {
		geom = geomArray[i];

		if(!geom.mm) this.loadGeomMinMax(geom);

		if((geom.mm)&&(!tile.mapIntersects(geom.mm))) continue;

		if(!geom.renderCache) {
			geom.renderCache = this.getRenderCache(ctx, geom, tile);
		}
		var renderCache = geom.renderCache;

		//geometry, path
		if((renderCache)&&(renderCache.style)) {
			
			if((renderCache.szmin)&&(renderCache.szmin > zoomScale)) continue;
			
			this.renderPath(ctx,geom,renderCache.style,zoomScale,tile);
		}
	}

	//---------------
	//render label
	//---------------
	for(i = 0; i < count; i++) {
		geom = geomArray[i];

		if((geom.mm)&&(!tile.mapIntersects(geom.mm))) continue;

		//label

		//exit if there is no label or if it has a 0 size
		var renderCache = geom.renderCache;
		if((!renderCache)||(!renderCache.w)||(!renderCache.h)) continue;
		
		if((renderCache.lzmin)&&(renderCache.lzmin > zoomScale)) continue;

		var labInf = geom.l;
		var spaceWidth = labInf[2];
		var spaceHeight = labInf[3];
		var labRot = labInf[4];
		if(spaceWidth <= 0) spaceWidth = 1;
		if(spaceHeight <= 0) spaceHeight = 1;

		var scaleFactor = this.getScaleFactor(spaceWidth,spaceHeight,renderCache.w,renderCache.h);

		var squareCase = ((Math.abs(renderCache.h/renderCache.w - 1) < this.SQAURE_TOL)||(Math.abs(spaceHeight/spaceWidth - 1) < this.SQUARE_TOL));

		var noRot = false;

		//correct for text size limits
		if(renderCache.labType == 1) {
			var totalScale = scaleFactor * zoomScale;
			if (totalScale * this.MAP_FONT_MAX < this.MAP_FONT_MIN) {
				continue;
			}
			if (totalScale > 1) {
				scaleFactor = 1 / zoomScale;
				noRot = (renderCache.w * scaleFactor < spaceHeight);//don't rotate if it fits the small direction
			}
		}

		//label rotation logic --------------

		if(noRot) {
			labRot = this.baseAngleRad;
		}
		else {
			//update label rotation if needed
			var effRot = labRot - this.baseAngleRad;

			if(squareCase) { // icons can rotate 90
				while(effRot > this.MAX_SQAURE) {
					effRot -= this.DELTA_SQAURE;
					labRot -= this.DELTA_SQAURE;
				}
				while(effRot < this.MIN_SQAURE) {
					effRot += this.DELTA_SQAURE;
					labRot += this.DELTA_SQAURE;
				}
			} else {
				while(effRot > this.MAX_RECT) {
					effRot -= this.DELTA_RECT;
					labRot -= this.DELTA_RECT;
				}
				while(effRot < this.MIN_RECT) {
					effRot += this.DELTA_RECT;
					labRot += this.DELTA_RECT;
				}
			}
		}

		//render
		ctx.translate(labInf[0],labInf[1]);
		ctx.rotate(labRot);
		ctx.scale(scaleFactor,scaleFactor);
		ctx.translate(renderCache.nax,renderCache.nay);

		if(renderCache.textFill) {

			if(renderCache.styleLabel) {
				this.drawLabelBackground(ctx,renderCache.w,renderCache.h,renderCache.m,renderCache.p,renderCache.styleLabel);
			}

			ctx.fillStyle = renderCache.textFill;
//ctx.strokeStyle = "#ffffff";
//ctx.lineWidth = 2 * scaleFactor * zoomScale;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			if(renderCache.labRef2) {
//ctx.strokeText(labRef,0,-this.MAP_FONT_MAX/2);
//ctx.strokeText(labRef2,0,this.MAP_FONT_MAX/2);
				ctx.fillText(renderCache.labRef,0,-this.MAP_FONT_MAX/2);
				ctx.fillText(renderCache.labRef2,0,this.MAP_FONT_MAX/2);
			}
			else {
//ctx.strokeText(labRef,0,0);
				ctx.fillText(renderCache.labRef,0,0);
			}
		}
		else if(renderCache.icon) {
//------------------------------
// @TODO
// Old icon render logic, since that is what is in the theme
//------------------------------
			var ip;
			var cntp = renderCache.icon.g.length;
			for(ip=0;ip<cntp;ip++) {
				var igeom = renderCache.icon.g[ip];
				var style;
				if(igeom.os) {
					style = igeom.os;
				}
				else {
					style = this.themeMap.getStyle(igeom.t);
				}
				if(!style) continue;
				this.renderPath(ctx,igeom,style,zoomScale);
			}
		}
		else if(renderCache.img) {
			ctx.drawImage(renderCache.img,0,0);

		}

		ctx.translate(-renderCache.nax,-renderCache.nay);
		ctx.scale(1/scaleFactor,1/scaleFactor);
		ctx.rotate(-labRot);
		ctx.translate(-labInf[0],-labInf[1]);
	}
}

/*
 *  This mehdo loads the style and label cache
 *
 *  @private
 */
micello.maps.MapCanvas.prototype.getRenderCache = function (ctx, geom, tile) {
	var renderCache = {};

	//geometry (path only)
	if(geom.st == 2) {
		var styleInfo = this.themeMap.getStyleInfo(geom);
		renderCache.style = this.themeMap.getStyle(styleInfo.name);
		if(styleInfo.zmin) {
			renderCache.szmin = styleInfo.zmin;
		}
	}

	//label
	if(geom.l) {
		var labInf = geom.l;
		var spaceWidth = labInf[2];
		var spaceHeight = labInf[3];
		if(spaceWidth <= 0) spaceWidth = 1;
		if(spaceHeight <= 0) spaceHeight = 1;

		var labelInfo = this.themeMap.getLabel(geom);
		if(labelInfo) {

			renderCache.labType = labelInfo.lt;
			renderCache.labRef = labelInfo.lr;
			if(labelInfo.zmin) {
				renderCache.lzmin = labelInfo.zmin;
			}

			if(renderCache.labType == 1) {
				//text label
				var styleInfo = this.themeMap.getStyleInfo(geom);
				var style = this.themeMap.getStyle(styleInfo.name);
				if((style)&&(style.t)) {

					renderCache.textFill = style.t;
					renderCache.styleLabel = style.label;
					if((styleInfo.zmin)&&((!renderCache.zmin)||(styleInfo.zmin < renderCache.zmin))) {
						renderCache.lzmin = styleInfo.zmin; 
					}

					if(this.MAP_FONT_CAPS) {
						renderCache.labRef = renderCache.labRef.toUpperCase();
					}

		// text cache -----------------------------------------
					var textCache = {};

					//single line text info
					var metrics = ctx.measureText(renderCache.labRef);
					var w1 = metrics.width;
					var h1 = this.MAP_FONT_MAX;
					var m = 0;
					var p = 0;
					if (renderCache.styleLabel) {
						m = (renderCache.styleLabel.margin != undefined) ? parseInt(renderCache.styleLabel.margin) : this.LABEL_BG_MARGIN ;
						p = (renderCache.styleLabel.padding != undefined) ? parseInt(renderCache.styleLabel.padding) : this.LABEL_BG_PADDING ;
						w1 += (m*2)+(p*2);
						h1 += (m*2)+(p*2);
					}

					textCache = {
						"lr":renderCache.labRef,
						"w1":w1,
						"h1":h1,
						"margin":m,
						"padding":p
					};

					//two line text info
					var midPoint = renderCache.labRef.length/2;
					var pos = -1;
					var off;
					var bestPos = null;
					var bestOff;
					var c;
					while((c = renderCache.labRef.indexOf(" ",pos+1)) >= 0) {
						pos = c;
						off = Math.abs(c - midPoint);
						if(bestPos) {
							if(off < bestOff) {
								bestPos = pos;
								bestOff = off;
							}
						}
						else {
							bestPos = pos;
							bestOff = off;
						}
					}

					//check if we have a break candidate
					if(bestPos) {
						var stra = renderCache.labRef.substr(0,bestPos);
						var strb = renderCache.labRef.substr(bestPos+1,renderCache.labRef.length);
						var w2a = ctx.measureText(stra).width;
						var w2b = ctx.measureText(strb).width;
						var w2 = w2a > w2b ? w2a : w2b;
						var h2 =  2 * this.MAP_FONT_MAX;

						if (renderCache.styleLabel) {
							w2 += (m*2)+(p*2);
							h2 += (m*2)+(p*2);
						}

						var sf1 = this.getScaleFactor(spaceWidth,spaceHeight,w1,h1);
						var sf2 = this.getScaleFactor(spaceWidth,spaceHeight,w2,h2);

						if(sf2 > sf1) {
							//use the two line info
							textCache.sc = 1 / sf1;
							textCache.sa = stra;
							textCache.sb = strb;
							textCache.w2 = w2;
							textCache.h2 = h2;
						}
					}

					renderCache.textCache = textCache;
			//complete text cache creation

					//set these whether we do cache or not
					if(textCache.sc) {
						renderCache.w = textCache.w2;
						renderCache.h = textCache.h2;
						renderCache.labRef = textCache.sa;
						renderCache.labRef2 = textCache.sb;
					}
					else {
						renderCache.w = textCache.w1;
						renderCache.h = textCache.h1;
					}
					renderCache.m = textCache.margin;
					renderCache.p = textCache.padding;


					//for text, use text centering
					renderCache.nax = 0;
					renderCache.nay = 0;
				}

			}
			else if((renderCache.labType == 2)||(renderCache.labType == 4)) {
				//icon label
				if(renderCache.labType == 2) {
					var iconInfo = this.themeMap.getIcon(renderCache.labRef,this.updateIcons);
					if(iconInfo.pending) {
						this.addIconTileAndCache(iconInfo,tile,renderCache);
					}
					else {
						renderCache.icon = iconInfo.icon;
					}
				}
				else {
					renderCache.icon = renderCache.labRef;
				}
				if(renderCache.icon) {
					renderCache.w = renderCache.icon.w;
					renderCache.h = renderCache.icon.h;
					renderCache.nax = -renderCache.w/2;
					renderCache.nay = -renderCache.h/2;
				}
			}
			else if(renderCache.labType == 3) {
				//image
				var imgInfo = this.themeMap.getImage(renderCache.labRef,this.updateImages);
				if(imgInfo.pending) {
					this.addImageTileAndCache(imgInfo,tile,renderCache);
				}
				else {
					renderCache.img = imgInfo.img;
				}
				if(renderCache.img) {
					renderCache.w = renderCache.img.width;
					renderCache.h = renderCache.img.height;
					renderCache.nax = -renderCache.w/2;
					renderCache.nay = -renderCache.h/2;
				}
			}
		}
	}

	return renderCache;
}

/*
 *  Gets the optimal scale factor for fitting a rectangle in an available space.
 *  @private
 */
micello.maps.MapCanvas.prototype.getScaleFactor = function (availWidth,availHeight,width,height) {
	var wFactor = availWidth / width;
	var hFactor = availHeight / height;
	return (wFactor > hFactor) ? hFactor : wFactor;
}

/*
 *  Draws the label background for any geometries that have one.
 *  @private
 */
micello.maps.MapCanvas.prototype.drawLabelBackground = function (ctx,w,h,m,p,styleLabel) {

        ctx.fillStyle = (styleLabel.m) ? styleLabel.m : this.LABEL_BG_COLOR ;

        var r = (styleLabel.radius != undefined) ? parseInt(styleLabel.radius) : this.LABEL_BG_RADIUS ;

        w = w-(m*2); // adjust width
        h = h-(m*2);

        var x = -(w/2)-(p/2);
        var y = -(h/2)-(p/2);

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + (w+p) - r, y);
        ctx.quadraticCurveTo(x + (w+p), y, x + (w+p), y + r);
        ctx.lineTo(x + (w+p), y + (h+p) - r);
        ctx.quadraticCurveTo(x + (w+p), y + (h+p), x + (w+p) - r, y + (h+p));
        ctx.lineTo(x + r, y + (h+p));
        ctx.quadraticCurveTo(x, y + (h+p), x, y + (h+p) - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();


        if (styleLabel.shadow) {
                if (styleLabel.shadow == true) {
                        ctx.shadowColor = this.LABEL_BG_SHADOW_COLOR;
                        ctx.shadowBlur = this.LABEL_BG_SHADOW_BLUR;
                        ctx.shadowOffsetX = this.LABEL_BG_SHADOW_XOFF;
                        ctx.shadowOffsetY = this.LABEL_BG_SHADOW_YOFF;
                } else if (styleLabel.shadow == false) {
                        ctx.shadowColor = "rgba(0,0,0,0.0)"; // reset shadow
                } else {
                        ctx.shadowColor = styleLabel.shadow[0];
                        ctx.shadowBlur = styleLabel.shadow[1];
                        ctx.shadowOffsetX = styleLabel.shadow[2];
                        ctx.shadowOffsetY = styleLabel.shadow[3];
                }
        } else {
                ctx.shadowColor = "rgba(0,0,0,0.0)"; // reset shadow
        }

        ctx.fill();
        ctx.shadowColor = "rgba(0,0,0,0.0)"; // reset shadow

        if (styleLabel.o) {
                ctx.strokeStyle = styleLabel.o;
                ctx.stroke();
        }

}


/** This method draws an individual path.
 * @private */
micello.maps.MapCanvas.prototype.renderPath = function(ctx,geom,style,scale,tile) {

	var geomType = geom.gt;
	if(geomType == undefined) geomType = 2; // area
	var gw = geom.gw;
	var path = geom.shp;

	var instr;

	ctx.beginPath();
	var l = path.length;
	for(var ip = 0; ip < l; ip++) {
		instr = path[ip];
		switch(instr[0]) {
			case 0:  //move to
				ctx.moveTo(instr[1],instr[2]);
				break;

			case 1: //line to
				ctx.lineTo(instr[1],instr[2]);
				break;

			case 2: //quad to
				ctx.quadraticCurveTo(instr[1],instr[2],instr[3],instr[4]);
				break;

			case 3: //cubic to
				ctx.bezierCurveTo(instr[1],instr[2],instr[3],instr[4],instr[5],instr[6]);
				break;

			case 4: //close path
				ctx.closePath();
				break;
		}
	}

	if(geomType == 2) {
		//area
                if (style.shadow != undefined && style.shadow != false) {
                        var s = style.shadow;
                        if (s === true) {
                                ctx.shadowColor = this.SHADOW_COLOR;
                                ctx.shadowBlur = this.SHADOW_BLUR*(scale*1.5);
                                ctx.shadowOffsetX = this.SHADOW_X*(scale+1);
                                ctx.shadowOffsetY = this.SHADOW_Y*(scale+1);
                        } else {
                                ctx.shadowColor = s[0];
                                ctx.shadowBlur = s[1]*(scale*2);
                                ctx.shadowOffsetX = s[2]*(scale+1);
                                ctx.shadowOffsetY = s[3]*(scale+1);
                        }
                }

		if(style.m != undefined) {
			ctx.fillStyle = style.m;
                        ctx.fill();
		}

                ctx.shadowColor = "rgba(0,0,0,0)";

                if (style.img != undefined && style.img != false) { // background image / texture
                     if (!style.pattern && !style.error) {

                        var imgInfo = {};
                        imgInfo.pending = [tile];
                        imgInfo.img = new Image();
                        var mapCanvas = this;
                        imgInfo.img.onload = function() {
                                mapCanvas.updateImages(imgInfo); // update these tiles when images get loaded
                        }

                        if (style.img == true) { // default texture for this geom type
                            imgInfo.img.src = micello.maps.HOST_URL+"/webmap/patterns/"+geom.t+".png";
                        } else { // user specified texture url
                            if( style.img.substr(0, 4) ) {
                                srcTmp  = style.img.split(":");
                                finalUrl = micello.maps.PROTOCOL+":"+srcTmp[1];
                            } else {
                                finalUrl = micello.maps.PROTOCOL+"://"+style.img;
                            }                    
                            imgInfo.img.src = finalUrl;
                        }

                        style.error = false;
                        imgInfo.img.onerror = function (e) { // prevents repetative 404s
                            style.error = true;
                        }

                        try { // this makes Firefox happy
                            var pattern = ctx.createPattern(imgInfo.img, 'repeat');
                        } catch (ex) {}

                        style.pattern = pattern; // cache the pattern

                    }

                    if (style.pattern) { // the pattern exists
                        ctx.fillStyle = style.pattern;
                        ctx.fill();
                    }

                }

		if((style.o != undefined)&&(style.w)) {
			ctx.strokeStyle = style.o;
			ctx.lineWidth = style.w / scale;
			ctx.stroke();
		}
	}
	else if(geomType == 3) {
		if(style.m != undefined) {
			//linear area
			ctx.strokeStyle = style.m;
			ctx.lineWidth = gw;
			ctx.stroke();
		}
	}
	else if(geomType == 1) {
		if((style.m != undefined)&&(style.w)) {
			//line
			ctx.strokeStyle = style.m;
			ctx.lineWidth = style.w / scale;
			ctx.stroke();
		}
	}
	else {
		micello.maps.onMapError("other geom type: " + geomType);
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

	if(!mapObject) {
		//hit check map geom
		var temp;
		var geomArray;
		var gList = level.gList;
		for(gList.start(); ((geomArray = gList.currentList()) != null); gList.next()) {
			temp = this.hitCheck(geomArray,x,y);
			if(temp) mapObject = temp;
		}
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

/** This method checks if the canvas coordinates intersect an geometry in the lists passed.
 * @private */
micello.maps.MapCanvas.prototype.hitCheck = function(geomArray,mapX,mapY) {
	var clickedGeom = null;
	var i;
	var cnt = geomArray.length;
	for(i=0;i<cnt;i++) {
		var geom = geomArray[i];
		var geomType = geom.gt;

//we only support area and icon selection now
if((geomType != 2)&&(geomType != 0)) continue;

		if((geom.shp)||((geom.l)&&((!geom.shp)||(geom.el)))) {

			//make sure we have the bounding box
			if(!geom.mm) this.loadGeomMinMax(geom);

			//check bb
			if((mapX > geom.mm[0][0])&&(mapY > geom.mm[0][1])&&(mapX < geom.mm[1][0])&&(mapY < geom.mm[1][1])) {
				var hit = false;
				if(geom.shp) {
					if(micello.geom.pathHit(geom.shp,mapX,mapY)) hit = true;
				}
				if((geom.l)&&((!geom.shp)||(geom.el))) {
					if(micello.geom.rotRectHit(geom.l,mapX,mapY)) hit = true;
				}
				if(hit) clickedGeom = geom;
			}
		}
	}
	return clickedGeom;
}

//-----------------------
// asynchconous image and icon loading
//-----------------------

/**This is a function that triggers a redraw when a label image loads.
 * @private */
micello.maps.MapCanvas.prototype.updateImages = function(imgInfo) {
	
	var list;
	var i;
	var clientData = imgInfo.clientData;
	if(!clientData) return;

	var mapControl = clientData.mapControl;

	//update the render info
	var renderInfo;
	list = clientData.infos;
	if(list) {
		for(i = 0; i < list.length; i++) {
			renderInfo = list[i];
			renderInfo.img = imgInfo.img;

			renderInfo.w = renderInfo.img.width;
			renderInfo.h = renderInfo.img.height;
			renderInfo.nax = -renderInfo.w/2;
			renderInfo.nay = -renderInfo.h/2;
		}
	}

	//invaidate the tiles
	var tile;
	list = clientData.tiles;
	if(list) {
		for(i = 0; i < list.length; i++) {
			tile = list[i];
			tile.invalid = true;
		}
	}
	//delete pending data
	delete imgInfo.clientData;

	//call draw with a long
	micello.maps.asynchDraw.waitDraw(mapControl,mapControl.IMAGE_DRAW_WAIT,mapControl.mapControl.mapName);
}

/**This is a function that triggers a redraw when a label image loads.
 * @private */
micello.maps.MapCanvas.prototype.updateIcons = function(iconInfo) {

	var list;
	var i;
	var clientData = iconInfo.clientData;
	if(!clientData) return;

	var mapControl = clientData.mapControl;

	//update the render info
	var renderInfo;
	list = clientData.infos;
	if(list) {
		for(i = 0; i < list.length; i++) {
			renderInfo = list[i];
			renderInfo.icon = iconInfo.icon;

			renderInfo.w = renderInfo.icon.w;
			renderInfo.h = renderInfo.icon.h;
			renderInfo.nax = -renderInfo.w/2;
			renderInfo.nay = -renderInfo.h/2;
		}
	}

	//invaidate the tiles
	var tile;
	list = clientData.tiles;
	if(list) {
		for(i = 0; i < list.length; i++) {
			tile = list[i];
			tile.invalid = true;
		}
	}

	//delete pending data
	delete iconInfo.clientData;

	//call draw with a long
	micello.maps.asynchDraw.waitDraw(mapControl,mapControl.IMAGE_DRAW_WAIT,mapControl.mapControl.mapName);
}

/** This is a function adds this tile and renderCache to the list of objects needing update
 *for the image. We attach a variable "clientData" to hold redraw info.
 * @private */
micello.maps.MapCanvas.prototype.addImagetileAndCache = function(imgInfo,tile,renderCache) {
	var i;
	var list;
	var add;

	var clientData = imgInfo.clientData;
	if(!clientData) {
		clientData = {};
		clientData.mapControl = this;
		clientData.tiles = [];
		clientData.infos = [];
		imgInfo.clientData = clientData;
	}

	add = true;
	if(!clientData.tiles) clientData.tiles = [];
	list = clientData.tiles;
	for(i = 0; i < list.length; i++) {
		if(list[i] == tile) {
			add = false;
			break;
		}
	}
	if(add) {
		list.push(tile);
	}

	add = true;
	if(!clientData.infos) clientData.infos = [];
	list = clientData.infos;
	for(i = 0; i < list.length; i++) {
		if(list[i] == renderCache) {
			add = false;
			break;
		}
	}
	if(add) {
		list.push(renderCache);
	}
}

/** This is a function adds this tile and renderCache to the list of objects needing update
 *for the icon. We attach a variable "clientData" to hold redraw info.
 * @private */
micello.maps.MapCanvas.prototype.addIconTileAndCache = function(iconInfo,tile,renderCache) {
	var i;
	var list;
	var add;

	var clientData = iconInfo.clientData;
	if(!clientData) {
		clientData = {};
		clientData.mapControl = this;
		clientData.tiles = [];
		clientData.infos = [];
		iconInfo.clientData = clientData;
	}

	add = true;
	if(!clientData.tiles) clientData.tiles = [];
	list = clientData.tiles;
	for(i = 0; i < list.length; i++) {
		if(list[i] == tile) {
			add = false;
			break;
		}
	}
	if(add) {
		list.push(tile);
	}

	add = true;
	if(!clientData.infos) clientData.infos = [];
	list = clientData.infos;
	for(i = 0; i < list.length; i++) {
		if(list[i] == renderCache) {
			add = false;
			break;
		}
	}
	if(add) {
		list.push(renderCache);
	}
}


//-----------------
//theme
//-----------------

//TEMPORARY METHOD - BACKWARD COMPATIBILITY CODE-----------
micello.maps.MapCanvas.prototype.check = function(nameList,name) {
	var i;
	for(i = 0; i < nameList.length; i++) {
		if(nameList[i] == name) return;
	}
	nameList.push(name);
}

//----------------------
//utilities
//----------------------

/** This method loads the minmax bounding box for a geometry.
 * @private */
micello.maps.MapCanvas.prototype.loadGeomMinMax = function(geom) {
	var mm = micello.geom.getInvalidMinMax();
	if(geom.shp) {
		micello.geom.loadPathMinMax(geom.shp,mm);
	}
	if((geom.l)&&((!geom.shp)||(geom.el))) {
		micello.geom.loadRotRectMinMax(geom.l,mm)
	}
	geom.mm = mm;
}

/** This is a utility to see if an element is in an array.
 * @private */
micello.maps.MapCanvas.prototype.arrayContains = function(a,e) {
	var i;
	for(i = 0; i < a.length; i++) {
		if(a[i] == e) return true;
	}
	return false;
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

//===========================================
// MAP TILE
//============================================

/**
 * This is constructror takes the dom element that will host the tile, the
 * height and width dimensions and the z index for the tile.
 *
 * @class This class is a individual map tile for the map.
 *
 * @private
 */
micello.maps.MapTile = function(mapElement,width,height,zIndex) {
	this.mapElement = mapElement;
	this.canvas = document.createElement("canvas");

	this.canvas.style.position = "absolute";
	this.canvas.style.zIndex = zIndex;
	this.canvas.style.display = "none";

        //this enables this element to be dragged
        this.canvas.mapTarget = true;
	this.mapElement.appendChild(this.canvas);
        
	this.width = width;
	this.height = height;
	this.canvas.width = width;
	this.canvas.height = height;

	this.invalid = true;
	this.connected = false;
	this.clearZoomCache(false);
}

/** This method initializes a tile
 * @private */
micello.maps.MapTile.prototype.init = function(mapView,levelId,tileX,tileY) {
		//assign parameters to the tile
		this.lid = levelId;
		this.zoomInt = mapView.getZoomInt();
		this.tileX = tileX;
		this.tileY = tileY;
		this.elementX = tileX * this.width;
		this.elementY = tileY * this.height;
		this.elementMaxX = this.elementX + this.width;
		this.elementMaxY = this.elementY + this.height;

		//get map coordinates of tile
		this.setMinMax(mapView);

		this.scale = mapView.getZoom();

		this.key = micello.maps.MapTile.getKey(mapView,levelId,tileX,tileY);

		this.invalid = true;
		this.connected = false;
		this.zoomCache = false;
}

/** Get the bounds of this tile in map coordinates.
 * @private */
micello.maps.MapTile.prototype.setMinMax = function(mapView) {
	//get min max based on top left corner
	this.minX = mapView.canvasToMapX(this.elementX,this.elementY);
	this.minY = mapView.canvasToMapY(this.elementX,this.elementY);
	this.maxX = this.minX;
	this.maxY = this.minY;

	//factor in the rest of the corners
	this.updateMinMax(mapView,this.elementMaxX,this.elementY);
	this.updateMinMax(mapView,this.elementX,this.elementMaxY);
	this.updateMinMax(mapView,this.elementMaxX,this.elementMaxY);
}

/** helper for tile bounds.
 * @private */
micello.maps.MapTile.prototype.updateMinMax = function(mapView,cx,cy) {
	//get min max based on top left corner
	var mapX = mapView.canvasToMapX(cx,cy);
	if(mapX < this.minX) this.minX = mapX;
	if(mapX > this.maxX) this.maxX = mapX;
	var mapY = mapView.canvasToMapY(cx,cy);
	if(mapY < this.minY) this.minY = mapY;
	if(mapY > this.maxY) this.maxY = mapY;
}

/** This method gets a unique key for a tile
 * @private */
micello.maps.MapTile.getKey = function(mapView,levelId,tileX,tileY) {
	return levelId + '|' + mapView.getZoomInt() + '|' + tileX + '|' + tileY;
}

/** This method takes the tile off of the map.
 * @private */
micello.maps.MapTile.prototype.disconnect = function() {
	this.canvas.style.display = "none";
	this.connected = false;
}

/** This method puts the tile on the map.
 * @private */
micello.maps.MapTile.prototype.connect = function() {
	this.canvas.style.left = this.elementX + "px";
	this.canvas.style.top = this.elementY + "px";
	this.canvas.style.display = "block";
	this.connected = true;
}

/** This method returns true if the input coordinates (in map space) intersects the tile.
 * @private */
micello.maps.MapTile.prototype.mapIntersects = function(minmax) {
	return ((this.minX < minmax[1][0])&&(this.minY < minmax[1][1])&&
		(this.maxX > minmax[0][0])&&(this.maxY > minmax[0][1]));
}

micello.maps.MapTile.prototype.setZoomCache = function(newScale) {
	if(micello.maps.MapGUI.setCssScale) {
		this.zoomCache = true;
		var factor = newScale/this.scale;
		micello.maps.MapGUI.setCssScale(this.canvas,factor);
		this.canvas.style.left = (factor * this.elementX + (factor - 1) * this.width/2) + "px";
		this.canvas.style.top = (factor * this.elementY + (factor - 1) * this.width/2) + "px";

	}
}

micello.maps.MapTile.prototype.clearZoomCache = function(disconnect) {
	if(micello.maps.MapGUI.setCssScale) {
		this.zoomCache = false;
		micello.maps.MapGUI.setCssScale(this.canvas,1.0);
		if(disconnect) {
			this.disconnect();
		}
	}
}

/**
 * This constructor takes the map control and the map canvas. It should not be
 * called explicitly. It should be called by the map control.
 *
 * @class This class manages the view of the map. It contains functions to set the
 * view as well as to read it.
 */
micello.maps.MapView = function(mapControl,viewportElement,mapElement,mapCanvas, mapGUI,mapEvent) {
	/** The map control
	 * @private */
	this.mapControl = mapControl;

	/** The map control
	 * @private */
	this.mapCanvas = mapCanvas;
        
	/** The map event
	 * @private */
        this.mapEvent = mapEvent;
        
	/** The GUI for the map.
	 * @private */
        this.mapGUI = mapGUI;

	/** The containing div for the map.
	 * @private */
	this.viewport = viewportElement;

	/** The containing div for the map.
	 * @private */
	this.mapElement = mapElement;

	/** The x coordinate of the map element in the viewport coordinates
	 * @private */
	this.mapXInViewport = 0;
	/** The y coordinate of the map element in the viewport coordinates
	 * @private */
	this.mapYInViewport = 0;

	/** This is the zoom scale - it should be set internally using setQuantizedScale.
	 * @private */
	this.scale = 0;

	/** This is an integer that represents the zoom level
	 * @private */
	this.zoomInt = 0;

	/** The zoom scale of the map
	 * @private */
	this.setQuantizedScale(1.0);

	/** map coordinates to canvas coordinate
	 * @private */
	this.m2c = [1,0,0,1,0,0];
	/** canvas coordinates to map coordiantes
	 * @private */
	this.c2m = [1,0,0,1,0,0];
	/** base transform for map to canvas
	 * @private */
	this.baseM2C = [1,0,0,1];
	/** base transform for canvas to map
	 * @private */
	this.baseC2M = [1,0,0,1];
	/** drawing base offset
	 * @private */
	this.baseOffM = [0,0];
	/** drawing base offset
	 * @private */
	this.baseOffC = [0,0];
	/** If this flag is set, the control automatically puts N at the top of the page.
	 * @private */
	this.northAtTop = false;
	/** This flag indicates a custom base transform is being used.
	 * @private */
	this.customView = false;

	/**
	 * This method is a callback for when the zoom or center of the map changes.
	 * @param {Object} event This object holds information on the view change.
	 * @event  */
	this.onViewChange = null;

	/** This is the object (re)used in calling onViewChanged events.
	 * @private */
	this.event = {};

	/* @private */
	this.defaultMapX = 0;
	/* @private */
	this.defaultMapY = 0;
	/* @private */
	this.defaultW = 0;
	/* @private */
	this.defaultH = 0;
	/* @private */
	this.drawingSet = false;
	
	/*	@private
	 *	This can be overridden to position the center of the map at a certain fraction of the viewport width
	 */
	this.offsetXFraction = 0.5;
	/*	@private
	 *	This can be overridden to position the center of the map at a certain fraction of the viewport height
	 */
	this.offsetYFraction = 0.5;
	
	/*	@private
	 *	This can be overridden to define the minimum zoom level of a map
	 */	
	this.minWidthFraction = 1;
	/*	@private
	 *	This can be overridden to define the minimum zoom level of a map
	 */	
	this.minHeightFraction = 1;
	
}

/**
 * This method translates the map view by the amount dx, dy in screen coordinates.
 */
micello.maps.MapView.prototype.translate = function(dx,dy) {
	//test pan - don't allow map outside of view
	var tempX = this.mapXInViewport + dx;
	var tempY = this.mapYInViewport + dy;
	if(	(tempX + this.baseWidth * this.scale < this.viewport.offsetWidth * this.offsetXFraction) ||
		(tempX > this.viewport.offsetWidth * this.offsetXFraction) ||
		(tempY + this.baseHeight * this.scale < this.viewport.offsetHeight * this.offsetYFraction) ||
		(tempY > this.viewport.offsetHeight * this.offsetYFraction)) return;

	this.mapXInViewport = tempX;
	this.mapYInViewport = tempY;
	this.mapElement.style.left = this.mapXInViewport + "px";
	this.mapElement.style.top = this.mapYInViewport + "px";

	this.mapCanvas.onPan(-this.mapXInViewport,-this.mapYInViewport,
		-this.mapXInViewport + this.viewport.offsetWidth,
		-this.mapYInViewport + this.viewport.offsetHeight);

        /* Deprecated Event */
	if(this.onViewChange) {
		this.event.pan = 1;
		this.event.zoom = 0;
		this.onViewChange(this.event);
	}
        
        /* Fire the event */
        var e = {};
        e.minPixX = -this.mapXInViewport;
        e.minPixY = -this.mapYInViewport;
        e.maxPixX = -this.mapXInViewport + this.viewport.offsetWidth;
        e.maxPixY = -this.mapYInViewport + this.viewport.offsetHeight;
        this.mapEvent.dispatchEvent('pan', e);
}

/**
 * This method increases the zoom scale.  The fixedPointX and Y are optional arguments. Typically the should
 * be left undefined. If they are set, then that point on the map canavs will remain fix as the zoom in occurs.
 */
micello.maps.MapView.prototype.zoomIn = function(fixedPointX,fixedPointY) {
	this.setZoom(this.scale * 2.0,fixedPointX,fixedPointY);
}

/**
 * This method decreases the zoom scale. This method will not allow a zoom out if the current map
 * size is smaller than the viewport. The fixedPointX and Y are optional arguments. Typically the should
 * be left undefined. If they are set, then that point on the map canavs will remain fix as the zoom out occurs.
 */
micello.maps.MapView.prototype.zoomOut = function(fixedPointX,fixedPointY) {
	this.setZoom(this.scale/2.0,fixedPointX,fixedPointY);
}

/**
 * This method set the zoom scale. From within the application, the zoom scale
 * takes on discrete values given by the initial scale of one and the discrete zoom
 * in/out jumps. This function allows arbitrary setting of the zoom scale.
 * This method will not allow a zoom out if the current map
 * size is smaller than the viewport.
 * The fixedPointX and Y are optional arguments. Typically the should
 * be left undefined. If they are set, then that point on the map canavs will remain fix as the zoom occurs.
 */
micello.maps.MapView.prototype.setZoom = function(scale,fixedPointX,fixedPointY) {

	//limit zoom out
	if((scale * this.baseWidth < this.viewport.offsetWidth * this.minWidthFraction) &&
		(scale * this.baseHeight < this.viewport.offsetHeight * this.minHeightFraction)) {
		var scaleW = this.viewport.offsetWidth * this.minWidthFraction / this.baseWidth;
		var scaleH = this.viewport.offsetHeight * this.minHeightFraction / this.baseHeight;
		scale = (scaleH < scaleW) ? scaleH : scaleW;
	}

	if(!fixedPointX) {
		//set center of viewport as fixed point if there is none
		fixedPointX = this.viewport.offsetWidth * this.offsetXFraction - this.mapXInViewport;
		fixedPointY = this.viewport.offsetHeight * this.offsetYFraction - this.mapYInViewport;
	}

	if(scale <= 0) {
		scale = 1.0;
	}

	//set the scale, as aquantized number
	var oldScale = this.scale;
	this.setQuantizedScale(scale);

        //convert to transform
        this.setTransformScale();

	var width = Math.ceil(this.baseWidth * this.scale);
	var height = Math.ceil(this.baseHeight * this.scale);
	

	//keep a point fixed
	var newFixedPointX = fixedPointX * this.scale/oldScale;
	var newFixedPointY = fixedPointY * this.scale/oldScale;
	this.mapXInViewport += fixedPointX - newFixedPointX;
	this.mapYInViewport += fixedPointY - newFixedPointY;

	//limit the position to keep the map in the view
	if(this.mapXInViewport + width < this.viewport.offsetWidth  * this.offsetXFraction) {
		this.mapXInViewport = this.viewport.offsetWidth * this.offsetXFraction - width;
	}
	else if(this.mapXInViewport > this.viewport.offsetWidth * this.offsetXFraction) {
		this.mapXInViewport = this.viewport.offsetWidth * this.offsetXFraction;
	}
	if(this.mapYInViewport + height < this.viewport.offsetHeight * this.offsetYFraction) {
		this.mapYInViewport = this.viewport.offsetHeight * this.offsetYFraction - height;
	}
	else if(this.mapYInViewport > this.viewport.offsetHeight * this.offsetYFraction) {
		this.mapYInViewport = this.viewport.offsetHeight * this.offsetYFraction;
	}

	//update css

	//reset this in case it was updated
	micello.maps.MapGUI.setCssOrigin(this.mapElement,0,0);
	micello.maps.MapGUI.setCssScale(this.mapElement,1)

	this.mapElement.style.width = width + "px";
	this.mapElement.style.height = height + "px";
	this.mapElement.style.left = this.mapXInViewport + "px";
	this.mapElement.style.top = this.mapYInViewport + "px";

	//redraw
	this.mapCanvas.onZoom();
        
        // v 0.5.10 - if map scale is displayed, refresh the GUI to update the UIscale value
        if (this.mapGUI.MAP_SCALE_VIEW != "off") {
            this.mapGUI.onResize();
        }

	if(this.onViewChange) {
		this.event.pan = 0;
		this.event.zoom = 1;
		this.onViewChange(this.event);
	}
        
        /* Fire the event */
        var e = {};
        e.originalScale = oldScale;
        e.scale = this.scale;
        e.fixedPointX = newFixedPointX;
        e.fixedPointY = newFixedPointY;
        e.mapXInViewport = this.mapXInViewport;
        e.mapYInViewport = this.mapYInViewport;
        this.mapEvent.dispatchEvent('zoom', e);
}

/**
 * This methods sets a best fit viewport to the map based on the .
 */
micello.maps.MapView.prototype.setView = function(centerX,centerY,width,height) {
	this.defaultMapX = centerX;
	this.defaultMapY = centerY;
	this.defaultW = width;
	this.defaultH = height;
	this.resetView();
	
	this.mapCanvas.onZoom();

	if(this.onViewChange) {
		this.event.pan = 0;
		this.event.zoom = 1;
		this.onViewChange(this.event);
	}
}

/**
 * This methods sets a best fit viewport to the map based on the .
 */
micello.maps.MapView.prototype.recenter = function(centerMapX,centerMapY) {
	var pixelMapX = this.scale * centerMapX;
	var pixelMapY = this.scale * centerMapY;
	var currentCenterPixX = this.viewport.offsetWidth * this.offsetXFraction - this.mapXInViewport;
	var currentCenterPixY = this.viewport.offsetHeight * this.offsetYFraction - this.mapYInViewport;
	this.translate(currentCenterPixX - pixelMapX, currentCenterPixY - pixelMapY);
}

/**
 * This methods returns the current zoom scale.
 */
micello.maps.MapView.prototype.getZoom = function() {
	return this.scale;
}

/**
 * This methods returns the an integer zoom level associated with the zoom scale.
 */
micello.maps.MapView.prototype.getZoomInt = function() {
	return this.zoomInt;
}

/** This method returns the map to the default view. */
micello.maps.MapView.prototype.home = function() {
	this.resetView();

	this.mapCanvas.onZoom();

	if(this.onViewChange) {
		this.event.pan = 0;
		this.event.zoom = 1;
		this.onViewChange(this.event);
	}
}

/** Gets the internal width of the viewport. */
micello.maps.MapView.prototype.getViewportWidth = function() {
	return this.viewport.clientWidth;
}

/** Gets the internal height of the viewport. */
micello.maps.MapView.prototype.getViewportHeight = function() {
	return this.viewport.clientHeight;
}

/** This converts from map screen pixels to map coordinates. */
micello.maps.MapView.prototype.canvasToMapX = function(mapCanvasX,mapCanvasY) {
	return this.c2m[0] * mapCanvasX + this.c2m[2] * mapCanvasY + this.c2m[4];
}

/** This converts from map screen pixels to map coordinates. */
micello.maps.MapView.prototype.canvasToMapY = function(mapCanvasX,mapCanvasY) {
	return this.c2m[1] * mapCanvasX + this.c2m[3] * mapCanvasY + this.c2m[5];
}

/** This converts from map coordinates map screen pixels. */
micello.maps.MapView.prototype.mapToCanvasX = function(mapX,mapY) {
	return this.m2c[0] * mapX + this.m2c[2] * mapY + this.m2c[4];
}

/** This converts from map coordinates map screen pixels. */
micello.maps.MapView.prototype.mapToCanvasY = function(mapX,mapY) {
	return this.m2c[1] * mapX + this.m2c[3] * mapY + this.m2c[5];
}

/** This converts from map screen pixels to map coordinates. */
micello.maps.MapView.prototype.viewportToMapX = function(viewportX,viewportY) {
	return this.canvasToMapX(viewportX - this.mapXInViewport,viewportY - this.mapYInViewport);
}

/** This converts from map screen pixels to map coordinates. */
micello.maps.MapView.prototype.viewportToMapY = function(viewportX,viewportY) {
	return this.canvasToMapY(viewportX - this.mapXInViewport,viewportY - this.mapYInViewport);
}

/** This method returns the viewport X coordinate in the map element space.
 * @private */
micello.maps.MapView.prototype.getViewportX = function() {
	return -this.mapXInViewport;
}

/** This method returns the viewport Y coordinate in the map element space.
 * @private */
micello.maps.MapView.prototype.getViewportY = function() {
	return -this.mapYInViewport;
}

/** This returns the transform from map to canvas coordinates
 * @private */
micello.maps.MapView.prototype.getM2C = function() {
	return this.m2c;
}

/** This returns the transform from canvas to map coordinates
 * @private */
micello.maps.MapView.prototype.getC2M = function() {
	return this.c2m;
}

/** This method should be called when a drawing changes.
 * @private */
micello.maps.MapView.prototype.updateDrawing = function(drawing) {
	//check for north at top
	if((drawing)&&(this.northAtTop)&&(drawing.ar)) {
		this.setBaseAngRad(-drawing.ar);
	}
	else if(!this.customView) {
		this.setBaseAngRad(0);
	}
	//set the default transform
	var i;
	for(i = 0; i < 4; i++) {
		this.m2c[i] = this.baseM2C[i];
		this.c2m[i] = this.baseC2M[i];
	}
	this.m2c[4] = 0;
	this.m2c[5] = 0;
	this.c2m[4] = 0;
	this.c2m[5] = 0;

	if(!drawing) {
		this.baseWidth = 0;
		this.baseHeight = 0;
		this.defaultMapX = 0;
		this.defaultMapY = 0;
		this.defaultW = 0;
		this.defaultH = 0;
		this.drawingSet = false;
	}
	else {
		//get transformation from map to canvas
		var corners = [];
		corners.push([this.mapToCanvasX(drawing.w,0),this.mapToCanvasY(drawing.w,0)]);
		corners.push([this.mapToCanvasX(0,drawing.h),this.mapToCanvasY(0,drawing.h)]);
		corners.push([this.mapToCanvasX(drawing.w,drawing.h),this.mapToCanvasY(drawing.w,drawing.h)]);

		//start with values from first corner, the base transform of [0,0]
		var minX = 0;
		var minY = 0;
		var maxX = 0;
		var maxY = 0;

		for(i = 0; i < 3; i++) {
			if(minX > corners[i][0]) minX = corners[i][0];
			if(minY > corners[i][1]) minY = corners[i][1];
			if(maxX < corners[i][0]) maxX = corners[i][0];
			if(maxY < corners[i][1]) maxY = corners[i][1];
		}

		//fill the transform so the min canvas values is 0,0
		this.baseOffM[0] = -minX;
		this.baseOffM[1] = -minY;

		//get the canvas width, at scale 0
		this.baseWidth = maxX - minX;
		this.baseHeight = maxY - minY;

		//get the c2m offset
		this.baseOffC[0] = -this.canvasToMapX(-minX,-minY);
		this.baseOffC[1] = -this.canvasToMapY(-minX,-minY);

		//get default view
		if(drawing.v) {
			this.defaultMapX = drawing.v.cx;
			this.defaultMapY = drawing.v.cy;
			this.defaultW = drawing.v.w;
			this.defaultH = drawing.v.h;
		}
		else {
			this.defaultMapX = drawing.w/2;
			this.defaultMapY = drawing.h/2;
			this.defaultW = this.baseWidth;
			this.defaultH = this.baseHeight;
		}
		this.drawingSet = true;
	}
	this.resetView();
        
}


/** This method resets the view to a zoom scale to the default and the center of the map
 * being the center of the drawing. If ther is no drawing, the center is set to 0,0.
 * The default default scael is picked so the drawing is visible in the viewport.
 * There is no redraw and no view change events are called.
 * @private
 */
micello.maps.MapView.prototype.resetView = function() {
	if((this.drawingSet)&&(this.defaultW > 0)&&(this.defaultH > 0)) {
		
		var screenWidthFraction = (this.offsetXFraction > 0.5) ? 2*(1-this.offsetXFraction) : 2*this.offsetXFraction ;
//		var screenWidthFraction;
//		if (this.offsetXFraction > 0.5) {
//			screenWidthFraction = 2*(1-this.offsetXFraction);
//		} else {
//			screenWidthFraction = 2 * this.offsetXFraction;
//		}
		
		var screenHeightFraction = (this.offsetYFraction > 0.5) ? 2*(1-this.offsetYFraction) : 2*this.offsetYFraction ;
//		var screenHeightFraction;
//		if (this.offsetYFraction > 0.5) {
//			screenHeightFraction = 2*(1-this.offsetYFraction);
//		} else {
//			screenHeightFraction = 2 * this.offsetYFraction;
//		}
		
		var widthFraction = this.viewport.clientWidth * screenWidthFraction / this.defaultW;
		var heightFraction = this.viewport.clientHeight * screenHeightFraction / this.defaultH;
		var scale = (widthFraction > heightFraction) ? heightFraction : widthFraction;
		this.setQuantizedScale(scale);
	}
	else {
		this.setQuantizedScale(1.0);
	}

	this.setTransformScale();

	var width = this.baseWidth * this.scale;
	var height = this.baseHeight * this.scale;
	
	this.mapXInViewport = this.viewport.offsetWidth * this.offsetXFraction - this.mapToCanvasX(this.defaultMapX,this.defaultMapY);
	this.mapYInViewport = this.viewport.offsetHeight * this.offsetYFraction - this.mapToCanvasY(this.defaultMapX,this.defaultMapY);

	this.mapElement.style.width = width + "px";
	this.mapElement.style.height = height + "px";
	this.mapElement.style.left = this.mapXInViewport + "px";
	this.mapElement.style.top = this.mapYInViewport + "px";
}

/** This method sets the transforms for the given scale value.
 * @private
 */
micello.maps.MapView.prototype.setTransformScale = function() {
	var i;
	for(i = 0; i < 4; i++) {
		this.m2c[i] = this.baseM2C[i] * this.scale;
		this.c2m[i] = this.baseC2M[i] / this.scale;
	}
	for(i = 0; i < 2; i++) {
		this.m2c[4+i] = this.baseOffM[i] * this.scale;
		this.c2m[4+i] = this.baseOffC[i];
	}
}

/** This is a factor to quantize the scale
 * @private */
micello.maps.MapView.SCALE_QUANT = 65536.0

/** This quantizes the scale factor.
 * @private
 */
micello.maps.MapView.prototype.setQuantizedScale = function(scale) {
	this.zoomInt = Math.floor(scale * micello.maps.MapView.SCALE_QUANT);
	this.scale = this.zoomInt / micello.maps.MapView.SCALE_QUANT;
}

/** This method sets the transforms for the given scale value.
 * @private
 */
micello.maps.MapView.prototype.setBaseAngRad = function(aRad) {
    
        while (aRad>Math.PI) {
            aRad -= 2*Math.PI;
        }
        while (aRad<-Math.PI) {
            aRad += 2*Math.PI;
        }
    
        var c= Math.cos(aRad);
	var s = Math.sin(aRad);
	this.baseM2C = [c,-s,s,c];
	this.baseC2M = [c,s,-s,c];
	
	this.mapCanvas.baseAngleRad = aRad;
}

/** This method sets the transforms for the given scale value.
 */
micello.maps.MapView.prototype.setTopNorth = function(northAtTop) {
	this.northAtTop = northAtTop;
	this.customView = false;
}

/** This method sets the the default perspective. The argument baseTrans should be a 2x2 matrix giving the
 * transformation of the view. The argument aRad shoudl be set to give the update to the label rotation.
 * @private
 */
micello.maps.MapView.prototype.setBaseTransform = function(baseTrans,aRad) {
	var sqrtDet = Math.sqrt(baseTrans[0]*baseTrans[3] - baseTrans[1]*baseTrans[2]);
	this.baseM2C[0] = baseTrans[0]/sqrtDet;
	this.baseM2C[1] = baseTrans[1]/sqrtDet;
	this.baseM2C[2] = baseTrans[2]/sqrtDet;
	this.baseM2C[3] = baseTrans[3]/sqrtDet;
	this.baseC2M[0] = this.baseM2C[3];
	this.baseC2M[1] = -this.baseM2C[1];
	this.baseC2M[2] = -this.baseM2C[2];
	this.baseC2M[3] = this.baseM2C[0];
	this.customView = true;

	this.mapCanvas.baseAngleRad = aRad;
}/**
 * This constructor takes the map control, container element and map view. It should not be
 * called explicitly. To create a popup. the method createPopup from the MapControl should
 * be used.
 *
 * @class This class is a popup object that appears on the map. There are two forms.
 * First is the menu popup which includes an optional title and optional command list,
 * with each command having a callback handler. Second is an info window which is a ballon
 * that displays HTML.
 */
micello.maps.MapPopup = function(mapCanvas,parentElement,view) {
	/** This is the map control.
	 * @private */
	this.mapCanvas = mapCanvas;

	/** This is the map view.
	 * @private */
	this.view = view;

	/** This flag indicates if the popup is active, meaning should be visible if it is
	 * on the active level.
	 * @private */
	this.isActive = false;

	/** This flag indicates if the popup should be visible.
	 * @private */
	this.isVisible = false;

	/** This is the pixel position on the map container.
	 * @private */
	this.containerX = 0;

	/** This is the pixel position on the map containter.
	 * @private */
	this.containerX = 0;
	
	/** This is the data describing the popup format.
	 * @private */
	this.data = null;

	/** This is the container element for the popup.
	 * @private */
	this.parentElement = parentElement;

	/** This is the continer for the popup content.
	 * @private */
	this.mainDiv = null;
}

/** This gives the max fraction of the viewport size for the infowindow. */
micello.maps.MapPopup.MAX_FRACTION = .6;
/** This gives the maximum width of an infowindow. */
micello.maps.MapPopup.MAX_WIDTH = 300;
/** This gives the maximum height of an infowindow. */
micello.maps.MapPopup.MAX_HEIGHT = 300;
/** This is used to layout the close button on an infowindow.
 * @private */
micello.maps.MapPopup.INFO_CLOSE_MARGIN = 5;
/** This is used to layout the close button on an popup menu.
 * @private */
micello.maps.MapPopup.MENU_CLOSE_MARGIN = 5;

/**
 * This function sets the data for the popup. See the format for MapPopup data in the
 * object specification
 */
micello.maps.MapPopup.prototype.setData = function(data) {
	this.data = data;

	//remove the old popup if there was one
	if(this.mainDiv != null) {
		this.parentElement.removeChild(this.mainDiv);
		this.mainDiv = null;
	}

	if(data.type == micello.maps.popuptype.MENU) {
		this.createMenuPopup(data);
	}
	else if(data.type == micello.maps.popuptype.INFOWINDOW) {
		this.createInfoPopup(data);
	}
}

/** This function exectues a command.
 * @private */
micello.maps.MapPopup.prototype.exeCmd = function(command) {
	command.func();
}

/**
 * This function is called internally to the package to reposition the popup during map motion
 * @private
 */
micello.maps.MapPopup.prototype.update = function() {
	var currentLevel = this.mapCanvas.data.getCurrentLevel();

	//if there is no current level or if the popup is not active, just make set not visible
	if((!currentLevel)||(!this.isActive)) {
		this.setVisible(false);
		return;
	}

	//if active, check if it should be visible and update its position if necesssary
	if(this.data) {
		if(currentLevel.id != this.data.lid) {
			//make not visible if necessary
			this.setVisible(false);
		}
		else {
			//make it visible if necessary
			this.setVisible(true);

			//update position if necessary
			var containerX = this.view.mapToCanvasX(this.data.mapX,this.data.mapY);
			var containerY = this.view.mapToCanvasY(this.data.mapX,this.data.mapY);
                        
                        if (this.data.ox) {containerX -= this.data.ox;}
                        if (this.data.oy) {containerY -= this.data.oy;}
                        
                        var mapHeight = this.parentElement.clientHeight;
                        var mapWidth = this.parentElement.clientWidth;
                        var mapMiddle = Math.floor(this.parentElement.clientWidth / 2);
                        var mapPadLeft = 20;
                        var mapPadRight =  this.parentElement.clientWidth - 20;
                        var mainDivCenterPoint = Math.floor(this.mainDiv.clientWidth / 2)-5;
                        //var mainDivHeight = this.mainDiv.clientHeight;
                        
			if((this.containerX != containerX)||(this.containerY != containerY)) {
                                this.mainDiv.style.bottom = String(mapHeight-containerY) + "px";
                                this.mainDiv.style.left = String(containerX-20) + "px";
				this.containerX = containerX;
				this.containerY = containerY;
			}
		}
	}
}

/**
 * This function sets the popup to active, meaning it will be displayed if it is on the proper level.
 */
micello.maps.MapPopup.prototype.setActive = function(isActive) {
	this.isActive = isActive;
	this.update();
}

/**
 * This function makes the popup visible/not visible, if it is not currently.
 * @private
 */
micello.maps.MapPopup.prototype.setVisible = function(isVisible) {
	if(this.isVisible != isVisible) {
		if(isVisible) {
			this.mainDiv.style.display = "block";
			this.isVisible = true;
		}
		else {
			this.mainDiv.style.display = "none";
			this.isVisible = false;
		}
	}
}

/**
 * This function creates the menu popup element
 * @private
 */
micello.maps.MapPopup.prototype.createMenuPopup = function(data) {

	var popup = this;

	this.mainDiv = document.createElement("div");
        this.mainDiv.className = "menu";
	this.mainDiv.style.position = "absolute";
	this.mainDiv.style.zIndex = micello.maps.MapGUI.POPUP_ZINDEX;
	this.mainDiv.style.bottom = "0px";
	this.mainDiv.style.left = "0px";
	this.containerX = 0;
	this.containerY = 0;

	this.menuWrapperDiv = document.createElement("div");
        this.menuWrapperDiv.className = "menuWrapper";
        this.mainDiv.appendChild(this.menuWrapperDiv);

	var table = document.createElement("ul");
        table.className = "menuTable";
        table.className += " micello-rounded";
        table.className += " micello-pop-shadow";
	if(data.title) {
		var titleCell = document.createElement("li");
                titleCell.className = "menuTitle";
		titleCell.innerHTML = data.title;
		table.appendChild(titleCell);

                var closeButton = document.createElement("img");
                closeButton.className = "menuClose";
                closeButton.src = micello.maps.request.CLOSE_URL;
                
                closeButton.onclick = function() {
                    popup.setActive(false);
                }
                closeButton.ontouchstart = function () { // redundant touch event for mobile browsers
                    popup.setActive(false);
                }
                
                titleCell.appendChild(closeButton);

	}
	if(data.commands) {
		var i;
		var cnt = data.commands.length;
		for(i=0;i<cnt;i++) {
			var itemCell = document.createElement("li");
                        itemCell.className = "menuItem";

			var command = data.commands[i];
			var link = document.createElement("a");
                        link.className = "menuLink";
			link.href = "";
			link.innerHTML = command.name;
			link.cmd = command;
			link.onclick = function(e) {
                                e.preventDefault();
				popup.setActive(false);
				this.cmd.func();
				return false;
			}
			link.ontouchstart = function() { // redundant touch events for mobile browsers
				popup.setActive(false);
				this.cmd.func();
				return false;
			}
			itemCell.appendChild(link);
			table.appendChild(itemCell);
		}
	}
        
        var arrowTip = document.createElement("div");
        arrowTip.className = "menuTip";
        table.appendChild(arrowTip);
        
	this.menuWrapperDiv.appendChild(table);

	this.mainDiv.style.display = "none";
	this.isVisible = false;

	this.parentElement.appendChild(this.mainDiv);
}

/**
 * This function creates the info popup element
 * @private
 */
micello.maps.MapPopup.prototype.createInfoPopup = function(data) {


	this.mainDiv = document.createElement("div");
        this.mainDiv.className = "infoOut";
        this.mainDiv.setAttribute('id', 'infoDiv');
	this.mainDiv.style.position = "absolute";
	this.mainDiv.style.zIndex = micello.maps.MapGUI.POPUP_ZINDEX;
	this.mainDiv.style.bottom = "0px";
	this.mainDiv.style.left = "0px";
	this.containerX = 0;
	this.containerY = 0;

	this.wrapperDiv = document.createElement("div");
        this.wrapperDiv.className = "infoWrapper";
        this.mainDiv.appendChild(this.wrapperDiv);
        
	var infoBubble = document.createElement("div");
        infoBubble.className = "infoBack";
        infoBubble.className += " micello-rounded";
        infoBubble.className += " micello-pop-shadow";
        
	this.wrapperDiv.appendChild(infoBubble);

        //so space below infobubble allows map drag
        this.mainDiv.mapTarget = true;

	var infoDiv = document.createElement("div");
        infoDiv.className = "infoIn";
        

	var viewportWidth = this.view.getViewportWidth();
	var viewportHeight = this.view.getViewportHeight();

        var maxWidth = Math.floor(viewportWidth * micello.maps.MapPopup.MAX_FRACTION);
        if(maxWidth > micello.maps.MapPopup.MAX_WIDTH) maxWidth = micello.maps.MapPopup.MAX_WIDTH;
        var maxHeight = Math.floor(viewportHeight * micello.maps.MapPopup.MAX_FRACTION);
        if(maxHeight > micello.maps.MapPopup.MAX_HEIGHT) maxHeight = micello.maps.MapPopup.MAX_HEIGHT;
        infoDiv.style.maxWidth = maxWidth + "px";
        infoDiv.style.maxHeight = maxHeight + "px";

        infoBubble.appendChild(infoDiv);

        var arrowTip = document.createElement("div");
        arrowTip.className = "menuTip";
//        infoDiv.appendChild(arrowTip);
        this.wrapperDiv.appendChild(arrowTip);


	//add as string or html (html dom element has tagname
	if(data.html) { 
		if(data.html.tagName) infoDiv.appendChild(data.html);
		else infoDiv.innerHTML = data.html;
	}
	
        var popup = this;
        var closeButton = document.createElement("img");
        closeButton.className = "infoClose";
        closeButton.src = micello.maps.request.CLOSE_URL;
        closeButton.onclick = function() {
                popup.setActive(false);
        }
        closeButton.ontouchstart = function (e) {
                popup.setActive(false);
        }
        infoBubble.appendChild(closeButton);
//        infoDiv.appendChild(closeButton);
        
	this.mainDiv.style.display = "none";
	this.isVisible = false;

	this.parentElement.appendChild(this.mainDiv);
}

/**
 * @namespace This namespace contains some geometry functions.
*/
micello.geom = {};

/**
 * This finds the roots of a linear equation, loading the results into the vector res.
 * The return value is the nubmer of roots found.
 * @private
 */
micello.geom.linearRoots = function(a,b,res) {
	if(a == 0) {
		return 0;
	}
	else {
		res[0] = -b/a;
		return 1;
	}
}

/**
 * This method finds the roots of the cubic equation ax^2 + bx + c
 * and loads them into the argument vector res. The return value is the number
 * of roots.
 * @private
 */
micello.geom.quadraticRoots = function(a,b,c,res) {
	if(a == 0) {
		return micello.geom.linearRoots(b,c,res);
	}
	var v1 = b*b - 4*a*c;
	if(v1 < 0) {
		return 0;
	}
	else {
		var v2 = -b/(2*a);
		v1 = Math.sqrt(v1)/(2*a);
		res[0] = v2 + v1;
		res[1] = v2 - v1;
		return 2;
	}
}

/**
 * This method finds the roots of the cubic equation ax^3 + bx^2 + cx + d * and loads them
 * into the argument vector res. The return value is the number of roots.
 * @private
 */
micello.geom.cubicRoots = function(a,b,c,d,res) {
	if(a != 0) {
		b = b/a;
		c = c/a;
		d = d/a;
		a = 1;
	}
	else {
		return micello.geom.quadraticRoots(b,c,d,res);
	}

	var v1 = b / (3 * a);
	var v2 = 1 / (3 * a);
	var v3 = 2*b*b*b - 9*a*b*c + 27*a*a*d;
	var vt = b*b - 3*a*c;
	var v4 = v3*v3 - 4*vt*vt*vt;

	if(v4 > 0) {
		return micello.geom.caseOne(v1,v2,v3,v4,res);
	}
	else if(v4 == 0) {
		return micello.geom.caseTwo(v1,v2,v3,res);
	}
	else {
		return micello.geom.caseThree(v1,v2,v3,v4,res);
	}
}

/**
 * cubic roots - argument of two cube roots are real and different
 * @private
 */
micello.geom.caseOne = function(v1,v2,v3,v4,res) {
	var rv4 = Math.sqrt(v4)
	var cr1 = micello.geom.cubeRoot(.5*(v3 + rv4));
	var cr2 = micello.geom.cubeRoot(.5*(v3 - rv4));
	res[0] = -v1 - v2 * cr1 - v2 * cr2;
	return 1;
}

/**
 * cubic roots - argument of two cube roots are real and the same
 * @private
 */
micello.geom.caseTwo = function(v1,v2,v3,res) {
	var cr1 = micello.geom.cubeRoot(.5*v3);
	res[0] = -v1 - 2 * v2 * cr1;
	res[2] = res[1] = -v1 + v2 * cr1;
	return 3;
}

/**
 * cubic roots - argument of cube roots is complex
 * @private
 */
micello.geom.caseThree = function(v1,v2,v3,v4,res) {
	var irv4 = Math.sqrt(-v4);
	var theta = Math.atan2(irv4,v3);
	var mag = .5 * Math.sqrt(v3*v3 - v4);
	//take complex root
	var rootAngle1 = theta / 3;
	var rootAngle2 = rootAngle1 + 2*Math.PI/3;
	var rootAngle3 = rootAngle1 - 2*Math.PI/3;
	var rootMag = micello.geom.cubeRoot(mag);
	res[0] = -v1 - 2 * v2 * rootMag * Math.cos(rootAngle1);
	res[1] = -v1 - 2 * v2 * rootMag * Math.cos(rootAngle2);
	res[2] = -v1 - 2 * v2 * rootMag * Math.cos(rootAngle3);
	return 3;
}

/**
 * Returns the cube root of a nubmer, use log and exp
 * @private
 */
micello.geom.cubeRoot = function(x) {
	if(x == 0) return 0;
	else if(x > 0) return Math.exp(Math.log(x)/3);
	else return -Math.exp(Math.log(-x)/3);
}

/**
 * This method finds the intersection of a bezier line with a vertical line starting from the
 * reference point and traveling upwards.
 * DETAILS: This is for finding a point inside an area. Point on boundary will be false.
 *  - intersect includes the start point of the input line but not the end point
 *  - intersect does not include the reference point
 *  - if the two lines travel together, this does NOT count as an intersect
 * @private
 */
micello.geom.intersectLine = function(ax0,ay0,ax1,ay1,x0,y0) {

	if(ax0 == ax1) {
		return 0;
	}
	else {
		var tint = (x0 - ax0)/ (ax1 - ax0);
		if((tint >= 0)&&(tint < 1)) {
			var yint = (ay1 - ay0) * tint + ay0;
			if(yint > y0) {
				return 1;
			}
			else {
				return 0;
			}
		}
		else {
			return 0;
		}
	}
}

/**
 * This method finds the intersection of a bezier quadratic curve with a vertical line starting from the
 * reference point and traveling upwards.
 * DETAILS: This is for finding a point inside an area. Point on boundary will be false.
 *  - intersect includes the start point of the input line but not the end point
 *  - intersect does not include the reference point
 *  - if the two lines travel together, this does NOT count as an intersect
 * @private
 */
micello.geom.intersectQuad = function(ax0,ay0,ax1,ay1,ax2,ay2,x0,y0) {
	var res = new Array(2);
	var ci = 0;
	var ct = micello.geom.quadraticRoots((ax2-2*ax1+ax0),(ax1-ax0),(ax0-x0),res);
	for(var i = 0; i < ct; i++) {
		var tint = res[i];
		if((tint >= 0)&&(tint < 1)) {
			var yint = (ay2-2*ay1+ay0)*tint*tint + 2*(ay1-ay0)*tint + ay0;
			if(yint > y0) ci++;
		}
	}
	return ci;
}

/**
 * This method finds the intersection of a bezier cubic curve with a vertical line starting from the
 * reference point and traveling upwards.
 * DETAILS: This is for finding a point inside an area. Point on boundary will be false.
 *  - intersect includes the start point of the input line but not the end point
 *  - intersect does not include the reference point
 *  - if the two lines travel together, this does NOT count as an intersect
 * @private
 */

micello.geom.intersectCube = function(ax0,ay0,ax1,ay1,ax2,ay2,ax3,ay3,x0,y0) {

	var res = new Array(3);
	var ci = 0;

	var ct = micello.geom.cubicRoots((ax3-3*ax2+3*ax1-ax0),3*(ax2-2*ax1+ax0),3*(ax1-ax0),(ax0-x0),res);

	for(var i = 0; i < ct; i++) {
		var tint = res[i];
		if((tint >= 0)&&(tint < 1)) {
			var yint = (ay3-3*ay2+3*ay1-ay0)*tint*tint*tint + 3*(ay2-2*ay1+ay0)*tint*tint + 3*(ay1-ay0)*tint + ay0;
			if(yint > y0) ci++;
		}
	}
	return ci;
}

/**
 * This function finds the min and max values of a cubic bezier curve and uses them
 * to update the minmax vector. The minmax matrix is composed of the entries [[xmin,ymin],[xmax,ymax]].
 * The parameter isX should be set true if the input parameters are the x component of the cubic
 * curve and false for the y component.
 * @private
 */
micello.geom.cubeMinMax = function(ax0,ax1,ax2,ax3,isX,minmax) {
	var res = new Array(5);

	var ct = micello.geom.quadraticRoots(3*(ax3-3*ax2+3*ax1-ax0),6*(ax2-2*ax1+ax0),3*(ax1-ax0),res);

	//add the endpoints (even if they are already in there)
	res[ct++] = 0.0;
	res[ct++] = 1.0;

	//determine x or y minmax
	var pIndex = isX ? 0 : 1;

	for(var i = 0; i < ct; i++) {
		var tint = res[i];
		if((tint >= 0)&&(tint <= 1)) {
			var xt = (ax3-3*ax2+3*ax1-ax0)*tint*tint*tint + 3*(ax2-2*ax1+ax0)*tint*tint + 3*(ax1-ax0)*tint + ax0;
			if(xt < minmax[0][pIndex]) minmax[0][pIndex] = xt;
			if(xt > minmax[1][pIndex]) minmax[1][pIndex] = xt;
		}
	}
}

/**
 * This function finds the min and max values of a quadratic bezier curve and uses them
 * to update the minmax vector. The minmax matrix is composed of the entries [[xmin,ymin],[xmax,ymax]].
 * The parameter isX should be set true if the input parameters are the x component of the quadratic
 * curve and false for the y component.
 * @private
 */
micello.geom.quadMinMax = function(ax0,ax1,ax2,isX,minmax) {
	var res = new Array(4);

	var ct = micello.geom.linearRoots(2*(ax2-2*ax1+ax0),2*(ax1-ax0),res);

	//add the endpoints (even if they are already in there)
	res[ct++] = 0.0;
	res[ct++] = 1.0;

	//determine x or y minmax
	var pIndex = isX ? 0 : 1;

	for(var i = 0; i < ct; i++) {
		var tint = res[i];
		if((tint >= 0)&&(tint <= 1)) {
			var xt = (ax2-2*ax1+ax0)*tint*tint + 2*(ax1-ax0)*tint + ax0;
			if(xt < minmax[0][pIndex]) minmax[0][pIndex] = xt;
			if(xt > minmax[1][pIndex]) minmax[1][pIndex] = xt;
		}
	}
}

/**
 * This function finds the min and max values of a quadratic bezier curve and uses them
 * to update the minmax vector. The minmax matrix is composed of the entries [[xmin,ymin],[xmax,ymax]].
 * The parameter isX should be set true if the input parameters are the x component of the quadratic
 * curve and false for the y component.
 * @private
 */
micello.geom.lineMinMax = function(ax0,ax1,isX,minmax) {
	//determine x or y minmax
	var pIndex = isX ? 0 : 1;

	if(ax0 < minmax[0][pIndex]) minmax[0][pIndex] = ax0;
	if(ax0 > minmax[1][pIndex]) minmax[1][pIndex] = ax0;

	if(ax1 < minmax[0][pIndex]) minmax[0][pIndex] = ax1;
	if(ax1 > minmax[1][pIndex]) minmax[1][pIndex] = ax1;
}

/** This method takes a path object and an x,y coordinate and tells if the point is in the path.
 * @private */
micello.geom.pathHit = function(path,x,y) {
	var instr;

	var l = path.length;
	var hitCount = 0;
	var oldX = 0;
	var oldY = 0;
	var startX = null;
	var startY = null;
	for(var ip = 0; ip < l; ip++) {
		instr = path[ip];

		switch(instr[0]) {

			case 0:
				oldX = instr[1];
				oldY = instr[2];

				//for an unclosed subsegment
				if((startX)&&(startY)) {
					if((oldX != startX)||(oldY != startY)) {
						hitCount += micello.geom.intersectLine(oldX,oldY,startX,startY,x,y);
					}
				}

				startX = oldX;
				startY = oldY;
				break;

			case 1:
				hitCount += micello.geom.intersectLine(oldX,oldY,instr[1],instr[2],x,y);
				oldX = instr[1];
				oldY = instr[2];
				break;

			case 2:
				hitCount += micello.geom.intersectQuad(oldX,oldY,instr[1],instr[2],instr[3],instr[4],x,y);
				oldX = instr[3];
				oldY = instr[4];
				break;

			case 3:
				hitCount += micello.geom.intersectCube(oldX,oldY,instr[1],instr[2],instr[3],instr[4],instr[5],instr[6],x,y);
				oldX = instr[5];
				oldY = instr[6];
				break;

			case 4:
				if((startX)&&(startY)) {
					//close if necessary
					if((oldX != startX)||(oldY != startY)) {
						hitCount += micello.geom.intersectLine(oldX,oldY,startX,startY,x,y);
					}
				}
				break;
		}
	}

	return ((hitCount & 1) != 0);
}

/** This is a minmax box that should always show as invalid.
 * @private */
micello.geom.getInvalidMinMax = function() {
	return [[Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY],[Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY]];
}

/** This method calculates a minmax matrix [[xmin,ymin],[xmax,ymax]] for the path. If there is no
 * known value of minmax, either null or INVALID_MINMAX can be passed in.
 * @private */
micello.geom.loadPathMinMax = function(path,minmax) {
	var instr;

	var l = path.length;
	var oldX = 0;
	var oldY = 0;
	for(var ip = 0; ip < l; ip++) {
		instr = path[ip];

		switch(instr[0]) {

			case 0:
				oldX = instr[1];
				oldY = instr[2];
				if(!minmax) minmax = [[oldX,oldY],[oldX,oldY]];
				break;

			case 1:
				micello.geom.lineMinMax(oldX,instr[1],true,minmax);
				micello.geom.lineMinMax(oldY,instr[2],false,minmax);
				oldX = instr[1];
				oldY = instr[2];
				break;

			case 2:
				micello.geom.quadMinMax(oldX,instr[1],instr[3],true,minmax);
				micello.geom.quadMinMax(oldY,instr[2],instr[4],false,minmax);
				oldX = instr[3];
				oldY = instr[4];
				break;

			case 3:
				micello.geom.cubeMinMax(oldX,instr[1],instr[3],instr[5],true,minmax);
				micello.geom.cubeMinMax(oldY,instr[2],instr[4],instr[6],false,minmax);
				oldX = instr[5];
				oldY = instr[6];
				break;
		}
	}

	return minmax;
}

/** This method returns true if the point is inside the shape.
 * @private */
micello.geom.rotRectHit = function(rr,x,y) {
	var px = x - rr[0];
	var py = y - rr[1];

	var xx = Math.cos(rr[4]);
	var xy = Math.sin(rr[4]);
	var yx = -xy;
	var yy = xx;

	return ((Math.abs(px*xx + py*xy) <= rr[2]/2.0) && (Math.abs(px*yx + py*yy) <= rr[3]/2.0));
}

/** This method returns the bounding box for a rotated rectangle
 * defined by the given transform.
 * @private */
micello.geom.loadRotRectMinMax = function(rr,minmax) {
	var c = Math.cos(rr[4]);
	var s = Math.sin(rr[4]);

	var awx = (Math.abs(c * rr[2]) + Math.abs(s * rr[3]))/2;
	var awy = (Math.abs(s * rr[2]) + Math.abs(c * rr[3]))/2;

	var minX = rr[0] - awx;
	var minY = rr[1] - awy;
	var maxX = rr[0] + awx;
	var maxY = rr[1] + awy;

	if(!minmax) minmax = [[minX,minY],[maxX,maxY]];
	else  {
		minmax[0][0] = Math.min(minX,minmax[0][0]);
		minmax[0][1] = Math.min(minY,minmax[0][1]);
		minmax[1][0] = Math.max(maxX,minmax[1][0]);
		minmax[1][1] = Math.max(maxY,minmax[1][1]);
	}

	return minmax;
}/**
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
micello.maps.request.loadCommunity = function(communityId,onDownload,mv,ev) {
	if(mv === undefined) mv = '-';
	if(ev === undefined) ev = '-';
	var url = micello.maps.HOST_URL + "/map/" + communityId + "/mv/"+ mv + "/ev/" + ev + "/v5_map/com-map/" + micello.maps.lang;
	micello.maps.request.doRequest(url,onDownload,micello.maps.onMapError,"GET");
}

/** This method downloads the drawing entity.
 * The values mv and ev (map version and entity version) are optional. */
micello.maps.request.loadDrawingEntity = function(communityId,drawingId,onDownload,mv,ev) {
	if(mv === undefined) mv = '-';
	if(ev === undefined) ev = '-';
	var url = micello.maps.HOST_URL + "/map/" + communityId + "/mv/"+ mv + "/ev/" + ev + "/v5_map/drawing-entity/" + drawingId + "/" + micello.maps.lang;
	micello.maps.request.doRequest(url,onDownload,micello.maps.onMapError,"GET");
}

/** This method downloads the level geometry.
 * The values mv and ev (map version and entity version) are optional.
 **/
micello.maps.request.loadLevelGeom = function(communityId,drawingId,levelId,onDownload,mv,ev) {
	if(mv === undefined) mv = '-';
	if(ev === undefined) ev = '-';
	var url = micello.maps.HOST_URL + "/map/" + communityId + "/mv/"+ mv + "/ev/" + ev + "/v5_map/level-geom/" + levelId + "/" + micello.maps.lang;
	micello.maps.request.doRequest(url,onDownload,micello.maps.onMapError,"GET");
}

/** This method downloads the json object from a plain url. */
micello.maps.request.loadDataObject = function(url,onDownload) {
	micello.maps.request.doRequest(url,onDownload,micello.maps.onMapError,"GET");
}

/** This method downloads the entity info for the given geometry.
 * The values mv and ev (map version and entity version) are optional.*/
micello.maps.request.loadGeomDetail = function(communityId,geom,onDownload,mv,ev) {
	if(mv === undefined) mv = '-';
	if(ev === undefined) ev = '-';
	if((geom)&&(geom.id)) {
		var onReqDownload = function(data) {
			onDownload(geom,data);
		}
		var url = micello.maps.HOST_URL + "/map/" + communityId + "/mv/"+ mv + "/ev/" + ev + "/v5_map/geom-detail/" + geom.id + "/" + micello.maps.lang;
		micello.maps.request.doRequest(url,onReqDownload,micello.maps.onMapError,"GET");
	}
}

/** This method downloads the entity info for the given geometry.
 * The values mv and ev (map version and entity version) are optional.*/
micello.maps.request.loadEntityDetail = function(communityId,entity,onDownload,mv,ev) {
	if(mv === undefined) mv = '-';
	if(ev === undefined) ev = '-';
	if((entity)&&(entity.id)) {
		var onReqDownload = function(data) {
			onDownload(entity,data);
		}
		var url = micello.maps.HOST_URL + "/map/" + communityId + "/mv/"+ mv + "/ev/" + ev + "/v5_map/entity-detail/" + entity.id + "/" + micello.maps.lang;
		micello.maps.request.doRequest(url,onReqDownload,micello.maps.onMapError,"GET");
	}
}

/** This method downloads the entity info for the given geometry. */
micello.maps.request.routeRequest = function(communityId,routeStarts,routeEnds,onDownload,mv,ev) {
	if((communityId)&&(routeStarts)&&(routeEnds)) {
		var cnt;
		var i;
		var body = '{"type":"route","form":"v5","start":[';
		cnt = routeStarts.length;
		for(i = 0; i < cnt; i++) {
			if(i > 0) {
				body += ',';
			}
			body += this.getRouteLocation(routeStarts[i]);
		}
		body += '],"end":[';
		cnt = routeEnds.length;
		for(i = 0; i < cnt; i++) {
			if(i > 0) {
				body += ',';
			}
			body += this.getRouteLocation(routeEnds[i]);
		}
		body += ']}';

		if(mv === undefined) mv = '-';
		if(ev === undefined) ev = '-';

		var onReqDownload = function(data) {
			if(data.msg) {
				micello.maps.onMapError(data.msg);
			}
			if(data.annotation) {
				onDownload(data.annotation);
			}
		}
		var url = micello.maps.ROUTE_URL + "/route/" + communityId + "/mv/" + mv + "/ev/" + ev + "/" + micello.maps.lang;

		micello.maps.request.doRequest(url,onReqDownload,micello.maps.onMapError,"POST",body);
	}
}

micello.maps.request.getRouteLocation = function(routeLocation) {
	var locString = '{"t":"';
	locString += routeLocation.t;
	locString += '",';
	if(routeLocation.t == "gid") {
		locString += '"gid":' + routeLocation.gid;
		if(routeLocation.lid) {
			locString += ',"lid":' + routeLocation.lid;
		}
		if(routeLocation.alt) {
			locString += ',"alt":' + this.getRouteLocation(routeLocation.alt)
		}
		locString += "}"
	}
	else if(routeLocation.t == "mc") {
		locString += '"mx":' + routeLocation.mx;
		locString += ',"my":' + routeLocation.my;
		locString += ',"lid":' + routeLocation.lid;
		locString += "}"
	}
	return locString;
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
        url = url+"?"+micello.maps.request.getStdParams();
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
 * This method does ah HTTP request to the given URL. On success, the requeted data
 * is passed to the function onDownload. On failure, a msg is passed to the function
 * onFailure. The argument httpMethod determimes the request method ("get" or "post")
 * and the argument body gives the http body to be sent with the request.
 */
micello.maps.request.getStdParams = function() {
	var stdParams = "key=" + micello.maps.key;
	return stdParams;
}

/**
 * This method defines the UI for an elegant error message on the screen. This method can be 
 * overriden by the developer and handled in their own way.
 */
micello.maps.request.errorHandler = function(msg) {

	document.getElementById("micello-map").style.backgroundImage = "none";

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
        eM = document.getElementById("micello-map-msg");
        eM.style.display = "none";
    }, 7000);
    
}

micello.maps.onMapError = micello.maps.request.errorHandler;
/**
 * @namespace This namespace provides functions to manage user input for map problems.
 * @private 
 */
micello.maps.mapproblem = {};

/** This method creates the html for a problem infowindow.
 *  @private */
micello.maps.mapproblem.getProblemReportHTML = function(mapControl, geom) {

	micello.maps.mapproblem.geom = geom;
	micello.maps.mapproblem.mapControl = mapControl;
        mapGUI = mapControl.getMapGUI();
        
        var mapproblem = document.createElement("div");
        mapproblem.setAttribute('id', 'mapproblem');
        
        mpTitle = document.createElement("div");
        mpTitle.setAttribute('id', 'mapproblem-title');
        mpTitle.innerHTML = "Report a Problem";
        mapproblem.appendChild(mpTitle);
        
        if((geom)&&(geom.nm)) {
            mpSubTitle = document.createElement("div");
            mpSubTitle.setAttribute('id', 'mapproblem-subtitle');
            mpSubTitle.innerHTML += geom.nm;
            mapproblem.appendChild(mpSubTitle);
        }
        
        mpDesc = document.createElement("div");
        mpDesc.setAttribute('id', 'mapproblem-desc');
        mpDesc.innerHTML = "Do you see something that requires attention? ";
        mapproblem.appendChild(mpDesc);
        
        mpTextArea = document.createElement("div");
        mpTextArea.setAttribute('id', 'mapproblem-textarea');
        mapproblem.appendChild(mpTextArea);
        
        mpTextAreaActual = document.createElement("textarea");
        mpTextAreaActual.setAttribute('id', '_prob_text');
        mpTextArea.appendChild(mpTextAreaActual);
        mpTextAreaActual.focus();
        
        mpButton = document.createElement("div");
        mpButton.setAttribute('id', 'mapproblem-button');
        mpButton.innerHTML = "Send Report";
        mpButton.onclick = function () { 
            micello.maps.mapproblem.submitAction();
        };
        mpButton.ontouchend = function () { 
            micello.maps.mapproblem.submitAction();
        }
        mpTextArea.appendChild(mpButton);
        
        mpTextAreaActual.onfocus = function () {
            mapGUI.KEY_COMMANDS = false;
        };
        mpTextAreaActual.onblur = function () {
            mapGUI.KEY_COMMANDS = true;
        };
    
	return mapproblem;
}

/** 
 *  @private */
micello.maps.mapproblem.submitAction = function () {
    
    var textArea = document.getElementById("_prob_text");
    var text = textArea.value;
    if( !text ) {
        mpDesc = document.getElementById("mapproblem-desc");
        mpDesc.innerHTML = "<span class=\"mapproblem-error\">Please enter a message</span>";
        return false;
    }
    mpButton = document.getElementById("mapproblem-button");
    mpButton.onclick = false;
    mpButton.ontouchend = false;
    mpButton.innerHTML = "Sending..."
    mpButton.style.backgroundColor = "#ccc";
    mpButton.style.color = "#fff";
    micello.maps.mapproblem.submitProblemInfo();
    
}

/** This method submits the current problem info.
 *  @private */
micello.maps.mapproblem.submitProblemInfo = function() {
    
	var textArea = document.getElementById("_prob_text");
	var text = textArea.value;

	var community = null;
	var geom = micello.maps.mapproblem.geom;
	community = micello.maps.mapproblem.mapControl.getMapData().getCommunity();
	
	micello.maps.request.userInput(text,geom,community);

	//micello.maps.mapproblem.mapControl.hideInfoWindow();
        
}

/** This method submits the current problem info.
 *  @private */
micello.maps.mapproblem.onSuccess = function() {
 
        var mapproblem = document.getElementById("mapproblem");
        mapproblem.innerHTML = "";
        mpTitle = document.createElement("div");
        mpTitle.setAttribute('id', 'mapproblem-title');
        mpTitle.innerHTML = "Thank You!";
        mapproblem.appendChild(mpTitle);
        
        mpDesc = document.createElement("div");
        mpDesc.setAttribute('id', 'mapproblem-desc');
        mpDesc.innerHTML = "We have received your map feedback and we will address your submission as soon as possible. ";
        mapproblem.appendChild(mpDesc);
        
        mpButton = document.createElement("div");
        mpButton.setAttribute('id', 'mapproblem-button-complete');
        mpButton.innerHTML = "I'm Done";
        mpButton.onclick = function () { 
            micello.maps.mapproblem.mapControl.hideInfoWindow();
        };
        mpButton.ontouchend = function () { 
            micello.maps.mapproblem.mapControl.hideInfoWindow();
        }
        mapproblem.appendChild(mpButton);
        
}


/** This method submits the current problem info.
 *  @private */
micello.maps.mapproblem.onFailure = function() {
 
        var mapproblem = document.getElementById("mapproblem");
        mapproblem.innerHTML = "";
        mpTitle = document.createElement("div");
        mpTitle.setAttribute('id', 'mapproblem-title');
        mpTitle.innerHTML = "We Had A Problem";
        mapproblem.appendChild(mpTitle);
        
        mpDesc = document.createElement("div");
        mpDesc.setAttribute('id', 'mapproblem-desc');
        mpDesc.innerHTML = "Your submission unfortunately did not go through successfully. Please try again.";
        mapproblem.appendChild(mpDesc);
}





/** MapMomentum Class: This is the momentum class handler -- it is essentially an extension of the mapCanvas since all animations happen on the canvas
 * @class This class that manages the momentum
 * */
micello.maps.MapMomentum = function(mapCanvas) {
    
    this.mapCanvas = mapCanvas;
    this.sC = [];//starting coordinates; 0 = x/top; 1 = y/left
    this.maxDelta = 350;//this is maximum length of animation
    this.length = '2.0s';//this is how long the anim should last
    this.mmThreshold = '20';//the amount of seconds per pixels to pass before momentum-ing
    this.div = '';//the div used in this animation
    this.nm = 'mapMomentum';
    this.style = null;
    this.running = false;
    
}

/**
 * This kicks off the momentum animation -- this is usually called from the mapGui
 * because we need to listen for touch/mouse actions
 * @param {div} The div that will be animated
 * @param {sC} The starting coordinates as defined by the caller[0][x,y] = from; [1][x,y] = to
 * @param {mvC} The length of the mouse/touch movement[x,y]
 * @param {spC} The speed of the mouse/touch movement[x,y]
 * @param {spC} The duration of the mouse/touch movement (in milliseconds)
 * @private
 */
micello.maps.MapMomentum.prototype.begin = function(div, sC, mvC, spC, dur) {
    
    this.div = div;
    this.sC[0] = sC;
    this.sC[1] = [];
    this.cB = [0, 1, 0, 1];
    this.mvC = mvC; 
    this.spC = spC; 
    this.aC = [Math.abs(this.spC[0]/dur*100), Math.abs(this.spC[1]/dur*100)]; //the accelration of the movement
    var mM = this;

    if( this.aC[0] < this.mmThreshold || this.aC[1] < this.mmThreshold ) {
        return;
    }
   this.createRules();
    micello.util.addCss(this.div, {
        webkitAnimationName: this.nm,
        animationName: this.nm,
        webkitAnimationIterationCount: 1,
        animationIterationCount: 1,
        webkitAnimationPlayState: 'running',
        animationPlayState: 'running',
        webkitAnimationDuration: this.length,
        animationDuration: this.length,
        webkitAnimationTimingFunction: 'cubic-bezier('+this.cB[0]+','+this.cB[1]+','+this.cB[2]+','+this.cB[3]+')',
        animationTimingFunction: 'cubic-bezier('+this.cB[0]+','+this.cB[1]+','+this.cB[2]+','+this.cB[3]+')',
    });
    
    animEndHandler = function (e) {
        mM.animationEnd();
    }
    
    animStartHandler = function (e) {
        mM.running = true;

    }
    
    this.div.addEventListener('webkitAnimationEnd', animEndHandler);
    this.div.addEventListener('animationEnd', animEndHandler);
    this.div.addEventListener('webkitAnimationStart', animStartHandler);
    this.div.addEventListener('animationStart', animStartHandler);
}

/**
 * This kills the animation and shut down all the styles / css used as well as triggers a mapView translate
 * @private
 */
micello.maps.MapMomentum.prototype.animationEnd = function() {

    this.mapCanvas.view.translate(this.sC[1][0]-this.sC[0][0],this.sC[1][1]-this.sC[0][1]);
    micello.util.addCss(this.div, {
        webkitAnimationName: '',
        animationName: '',
        webkitAnimationPlayState: 'paused',
        animationPlayState: 'paused',
    });

    this.removeKeyFrameRule();
    this.running = false;
    this.div.removeEventListener('webkitAnimationEnd',animEndHandler);
    this.div.removeEventListener('animationEnd',animEndHandler);
    this.div.removeEventListener('webkitAnimationStart',animStartHandler);
    this.div.removeEventListener('animationStart',animStartHandler);
    
}

/**
 * This creates the Style/CSS rules to drive the animation
 * @private
 */
micello.maps.MapMomentum.prototype.createRules = function() {

    if( this.mvC[0] > this.maxDelta ) { this.mvC[0] = this.maxDelta; }
    if(  this.mvC[0] < -this.maxDelta ) { this.mvC[0] = -this.maxDelta; }
    if( this.mvC[1] > this.maxDelta ) { this.mvC[1] = this.maxDelta; }
    if(  this.mvC[1] < -this.maxDelta ) { this.mvC[1] = -this.maxDelta; }
    
    var tempX =  this.sC[0][0] + this.mvC[0];
    var tempY = this.sC[0][1] + this.mvC[1];
    
    this.sC[1][0] = tempX;
    this.sC[1][1] = tempY;

rule = this.nm+" {\
    0% {\
        top: "+ this.sC[0][1] +"px;\
        left: "+ this.sC[0][0]+"px;\
    }\
    100% {\
        top: "+ this.sC[1][1] +"px;\
        left: "+ this.sC[1][0]+"px;\
    }\
}";
    this.addKeyFrameRule(rule);

}

/**
 * This adds the key frame rule to the CSS style
 * @param {rule} The rule defined which drives the animation
 * @private
 */
micello.maps.MapMomentum.prototype.addKeyFrameRule = function(rule) {

    this.style = micello.util.addElem('mapAnim', 'style');
    document.head.appendChild(this.style);
    var vendorPrefix = micello.util.vendorPrefix();
    /* This is a dumb hard code for now -- fix in the future */
    if( vendorPrefix.css != '-ms-' ) {
        this.style.sheet.insertRule("@"+vendorPrefix.css+"keyframes " + rule, 0);
    } else {
        this.style.sheet.insertRule("@keyframes " + rule, 0);
    }
    
    
}

/**
 * This removes the key frame rule from the CSS style
 * @private
 */
micello.maps.MapMomentum.prototype.removeKeyFrameRule = function() {
    
    var sheet = this.style.sheet ? this.style.sheet : this.style.styleSheet;
    if (sheet.cssRules) { // all browsers, except IE before version 9
        if (sheet.cssRules.length > 0) {   
            sheet.deleteRule (0);
        }
    }
    
}

/**
 * This aborts the momentum mid-flight and calls the formal animationEnd to clean every thing up
 * @private
 */
micello.maps.MapMomentum.prototype.killMomentum = function () {

    if( this.running === true ) {
        /* If this is killed prematurely, we need to update the end coordinates */
        this.sC[1][0] = this.div.offsetLeft;
        this.sC[1][1] = this.div.offsetTop; 
        this.animationEnd();
    }
}
/** MapEvent Class: This is the custom map event handler to allow for listeners to react to events triggered within the SDK 
 * @class This class that manages the core map event system
 * */
micello.maps.MapEvent = function(mapControl) {
    this.events = [];
    this.mapControl = mapControl;
}

/**
 * This sets an event listener for the named event
 * @param {eventName} The named event to listen for
 * @param {callback} the custom callback to fire when named event is dispatched
 */
micello.maps.MapEvent.prototype.addListener = function(eventName, callback) {
    
    if(!callback) { return; }
    
    if( !this.events[eventName] ) {
        this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    
}

/**
 * This removes an event listener from the events queue
 * @param {eventName} The named event to remove from
 * @param {callback} the custom callback to remove
 */
micello.maps.MapEvent.prototype.removeListener = function(eventName, callback) {
    var updatedEvents = [];
    var c = null;
    for( i = 0; i < this.events[eventName].length; i++ ) {
        if( callback !== this.events[eventName][i] ) {
            c = this.events[eventName][i];
            updatedEvents[eventName].push(c);
        }
    }
    this.events[eventName] = updatedEvents;
}

/**
 * This pushes the callback for named event to the top of the heap (fired first)
 * @param {eventName} The named event to prioritize the callback within
 * @param {callback} the custom callback to push to the top
 * @private
 */
micello.maps.MapEvent.prototype.orderListener = function(eventName, callback, whereTo) {
    
    var updatedEvents = [];
    var c = null;
    var cToMove = null;
    
    /* Find the callback in question */
    for( i = 0; i < this.events[eventName].length; i++ ) {
        if( callback === this.events[eventName][i] ) {
            cToMove = this.events[eventName][i];
            break;
        }
    }
    
    if( whereTo == 'first' ) {
        /* Shove the prioritized callback in first */
        updatedEvents.push(cToMove);
    }
    
    /* Now reorganize */
    for( i = 0; i < this.events[eventName].length; i++ ) {
        if( callback !== this.events[eventName][i] ) {
            c = this.events[eventName][i];
            updatedEvents.push(c);
        }
    }
    
    if( whereTo == 'last' ) {
        /* Shove the prioritized callback in last */
        updatedEvents.push(cToMove);
    }
    
    this.events[eventName] = updatedEvents;
}

/**
 * This pushes the callback for named event to the top of the heap (fired first)
 * @param {eventName} The named event to prioritize the callback within
 * @param {callback} the custom callback to push to the top
 */
micello.maps.MapEvent.prototype.priorityFirstListener = function(eventName, callback) {
    this.orderListener(eventName, callback, 'first');
}

/**
 * This pushes the callback for named event to the bottom of the heap (fired last)
 * @param {eventName} The named event to prioritize the callback within
 * @param {callback} the custom callback to push to the bottom
 */
micello.maps.MapEvent.prototype.priorityLastListener = function(eventName, callback) {
    this.orderListener(eventName, callback, 'last');
}

/**
 * This dispatches the event to be consumed by all listeners. The callbacks are called with an event object that includes any custom args sent by the 
 * dispatching class as well as standard properties including the event name
 * @param {eventName} The named event to dispatch
 * @param {argsIn} the argument object to send out during the dispatch
 * @private
 */
micello.maps.MapEvent.prototype.dispatchEvent = function(eventName, args) {
    
    var callback = null;
    
    if( !args ) {
       args = {};
    }
    if( !this.events[eventName] ) {
        return;
    }
    for( i = 0; i < this.events[eventName].length; i++ ) {
        callback = this.events[eventName][i];
        if( callback ) {
            callback.call(null, args);
        }
    }
}/**
 * This constructor makes a standard info window processing object..
 *
 * @class This classes manages the standard info window.
 */
micello.maps.StandardInfoWindow = function(themeMap) {
	this.themeMap = themeMap;
	this.geom = null;
	this.entities = null;
	this.geomDetail = null;
	this.entityDetails = {};
	this.table = null;
}


/** This method is the callback that converts retreived info to an infowindow
 * @private */
micello.maps.StandardInfoWindow.prototype.createInfoElement = function(geom, community) {

	var cid = community.id;
	var mv = community.mv;
	var ev = community.ev;
	
	this.table = document.createElement("table");
	this.table.className = "infoTable";
	
	//construct the entity list - detail and internal (or empty array)
	if((geom.me)&&(geom.me.length > 0)) {
		if((geom.ie)&&(geom.ie.length > 0)) {
			this.entities = geom.me.concat(geom.ie);
		}
		else {
			this.entities = geom.me;
		}
	}
	else if((geom.ie)&&(geom.ie.length > 0)) {
		this.entities = geom.ie;
	}
	else {
		this.entities = null;
	}
	
	//populate initial data based on non-detail objects
	this.populateData(geom,this.entities);
	
	//check for a remote detail for geom
	var instance = this;
	if(geom.d == 1) {
		var geomCallback = function(geom,data) {
			instance.updateGeomDetail(geom,data);
		}

		micello.maps.request.loadGeomDetail(cid,geom,geomCallback,mv,ev);
	}
	else {
		this.geomDetails = geom;
	}
	
	//check for remote detail for entities
	var i;
	var entity
	if(this.entities){
		var entityCallback = function(entity,data) {
			instance.updateEntityDetail(entity,data);
		}
		for(i = 0; i < this.entities.length; i++) {
			entity = this.entities[i];
			if(entity.d == 1) {
				micello.maps.request.loadEntityDetail(cid,entity,entityCallback,mv,ev);
			}
			else {
				this.entityDetails[String(entity.id)] = entity;
			}
		}
	}
	
	return this.table;
}

/** @private */
micello.maps.StandardInfoWindow.prototype.populateData = function(geom,entityList) {
	
	var i;
	var entity;
	var props;
	var title;
	var label;
	
	//entity details
	if(entityList){
		for(i = 0; i < entityList.length; i++) {
			entity = entityList[i];
			props = entity.p;
			if(props) {
				label = this.themeMap.getEntityLabel(entity);
				if(label) {
					title = this.themeMap.convertLabelToText(label);
					if(title) {
						this.addObjectDetail(title,props);
					}
				}
			}
		}
	}
	
	//geom details
	label = this.themeMap.getGeomLabel(geom);
	if(label) {
		title = this.themeMap.convertLabelToText(label);
		if(title) {
			props = geom.p;
			this.addObjectDetail(title,props);
		}
	}
}

/** @private */
micello.maps.StandardInfoWindow.prototype.addObjectDetail = function(title,props) {
	var row;
	var rowCount = this.table.rows.length;
	var cell;
	
	//title
	if(title) {
		row = this.table.insertRow(rowCount++);
		cell = row.insertCell(0);
cell.className = "infoTitle";
		cell.colSpan = "2";
		cell.innerHTML = title;
	}
	
	//get body fields
	var displayInfo = [
		["description",null],
		["phone",this.getPhoneLink],
		["email",this.getEmailLink],
		["url",this.getHttpLink],
		["hours",null]
	]
	
	var i;
	var key;
	var value;
	var linkFunc;
	for(i = 0; i < displayInfo.length; i++) {
		key = displayInfo[i][0];
		linkFunc = displayInfo[i][1];
		value = props[key];
		if(value != null) {
			row = this.table.insertRow(rowCount++);
			this.addInfoRow(key,value,linkFunc,row);
		}
	}
}

/** @private */
micello.maps.StandardInfoWindow.prototype.addInfoRow = function(label,value,linkFunc,row) {
	var labelDisplay = this.themeMap.translate("info:" + label,label);
	var cell = row.insertCell(0);
	cell.className = "infoItemNm";
	cell.innerHTML = labelDisplay;
	cell = row.insertCell(1);
	cell.className = "infoItemVal";
	if(linkFunc) {
		var link = linkFunc(value);
		cell.appendChild(link);
	}
	else {
		cell.innerHTML = value;
	}
	
}

/** This processes the geometry detail response. 
** @private */
micello.maps.StandardInfoWindow.prototype.updateGeomDetail = function(geom,geomDetail) {
	this.geomDetail = geomDetail;
	this.checkCompletion();
}


/** This processes the entity detail response. 
 * @private */
micello.maps.StandardInfoWindow.prototype.updateEntityDetail = function(entity,entityDetail) {
	this.entityDetails[String(entity.id)] = entityDetail;
	this.checkCompletion();
}

/** This checks if all the geometry and entity details have arrived. If so,
 * it updates the table with the full data. 
 * @private */
micello.maps.StandardInfoWindow.prototype.checkCompletion = function() {
	
	//make sure the table is active (and hasn't been removed)
	if(!this.table.parentNode) return;
	
	var entityCount = 0;
	var id;
	for(id in this.entityDetails) {
		entityCount++;
	}
	if((this.geomDetails)&&((!this.entities)||(entityCount == this.entities.length))) {
		var entityDetailList;
		if(this.entities) {
			entityDetailList = [];
			for(var i = 0; i < this.entities.length; i++) {
				id = this.entities[i].id;
				entityDetailList.push(this.entityDetails[String(id)]);
			}
		}
		//get rid of old data
		while(this.table.rows.length > 0) {
			this.table.deleteRow(this.table.rows.length-1);
		}
		
		//update the tabel
		this.populateData(this.geomDetails,entityDetailList);
	}
}

/** This utility method creates an HTML link element for a phone number. */
micello.maps.StandardInfoWindow.prototype.getPhoneLink = function(phone) {
	var ref = "tel:" + phone.replace(/[^\d]/g, "");
	return  micello.maps.getUrlLink(ref,phone,false);
}

/** This utility method creates an HTML link element for an email. */
micello.maps.StandardInfoWindow.prototype.getEmailLink = function(email) {
	var ref = "mailto:" + email
	return  micello.maps.getUrlLink(ref,email,false);
}

/** This utility method creates an HTML link element for a url. */
micello.maps.StandardInfoWindow.prototype.getHttpLink = function(url) {
	var start = url.substr(0,7).toLowerCase();
	if(start != "http://") url = "http://" + url;
	var text;
	text = (url.length > micello.maps.MapControl.MAX_URL_LENGTH) ? "<em>click to open</em>" : url;
	return  micello.maps.getUrlLink(url,text,true);
}

// private

/** This methods creates an HTML link for different types of urls.
 * @private */
micello.maps.getUrlLink = function(url,innerHTML,newWindow) {
	var link = document.createElement("a");
	link.href = url;
	if(newWindow) link.target="_blank";
	link.innerHTML = innerHTML;
	return link;
}



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

	if(!micello.maps.key) {
		micello.maps.onMapError("You must have a Micello Map Key to user the Micello Map API.");
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

	/** Used for routing - the destination object
	 * @private */
	this.routeTo = null;
	/** Used for routing - the origin object
	 * @private */
	this.routeFrom = null;
	/** This is true if there is a route being shown.
	 * @private */
	this.routeActive = false;
	/** This is the route overlay.
	 * @private */
	this.routeOverlay = null;

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
/** This flag is used to show all in the popup flags. */
micello.maps.MapControl.SHOW_ALL = 15;

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

//----------------------
// Routes
//----------------------

/** This method reqeusts navigation from the given geometry. If both the
 * from and to are set, a network request will be made and the route plotted on the map. */
micello.maps.MapControl.prototype.requestNavToGeom = function(geom,lid,doIsoLevel) {
    
    
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
	var ends = [];
	ends.push(temp);
	this.requestNavTo(ends);
}

/** This method reqeusts navigation from the given geometry. If both the
 * from and to are set, a network request will be made and the route plotted on the map. */
micello.maps.MapControl.prototype.requestNavFromGeom = function(geom,lid,doIsoLevel) {
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
micello.maps.MapControl.prototype.requestNavTo = function(routeTo) {
	//remove old pin placements and route
	this.data.removeAnnotation("route");
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
micello.maps.MapControl.prototype.requestNavFrom = function(routeFrom) {
	//remove old pin placements and route
	this.data.removeAnnotation("route");
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
micello.maps.MapControl.prototype.clearRoute = function() {
	//hide overlay
	this.routeTo = null;
	this.routeFrom = null;
	this.routeActive = false;
	this.data.removeAnnotation("route");
	this.mapEvent.dispatchEvent('routeCleared');
}

//private

/** This internal method reqeusts navigation from the given geometry. If both the
 * from and to are set, a network request will be made and the route plotted on the map.
 * @private
 */
micello.maps.MapControl.prototype.getRoute = function() {
	if((this.routeTo)&&(this.routeFrom)) {
		this.routeActive = true;

		var mapControl = this;
		var cid = this.data.getCommunity().id;
		var mv = this.data.mapVersion;
		var ev = this.data.entityVersion;
		var routeCallback = function(route) {
			mapControl.data.removeAnnotation("route");
			mapControl.showAnnotation(route,"route");
			mapControl.mapEvent.dispatchEvent('routeReceived', route);
		}
		micello.maps.request.routeRequest(cid,this.routeFrom,this.routeTo,routeCallback,mv,ev);
	}
}

/** This internal method places a route start and marker. The argument isDest
* tells if this is the start or end marker.
 * @private
 */
micello.maps.MapControl.prototype.setRouteMarker = function(isDest) {
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
			this.data.addMarkerOverlay(marker,true);
		}
	}
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
	else {
		var title = this.getTitleInfo(mapObject);
		if(title != null) {
			this.showDefaultGeomPopup(mapObject,title);
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
	if(this.popupFlags & micello.maps.MapControl.SHOW_REPORT) this.loadInputCmd(geom,commands);

	this.showPopupMenu(geom,title,commands);
}


/** This method shows the default into window for a given geometry. It is
 * used for the default action for the showInfo event. */
micello.maps.MapControl.prototype.showDefaultInfoWindow = function(geom) {
	var community = this.data.getCommunity();
	if(!community) return;
	
	var standardInfoWindow = new micello.maps.StandardInfoWindow(this.themeMap);
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

		var mapMgr = this;
		var command = {"name":"Navigate To","func":function(){mapMgr.requestNavToGeom(geom,lid,true);}};
		commands.push(command);

		command = {"name":"Navigate From","func":function(){mapMgr.requestNavFromGeom(geom,lid,true);}};
		commands.push(command);

		if(this.routeActive) {
			command = {"name":"Clear Route","func":function(){mapMgr.clearRoute();}};
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
		micello.maps.onMapError("Unknown error - go inside failed");
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
		micello.maps.onMapError("Unknown error - go inside failed");
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

//----------------------
// Utilities
//----------------------

/** This method takes an annotation list object and shows the annotations on the map.
 * If the name argument is not null it will be used as the annotation name for each object. */
micello.maps.MapControl.prototype.showAnnotation = function(annObj,name) {
	var go = annObj.g;
	var gi = annObj.i;
	var mo = annObj.m;

	var obj;
	var i;
	if(go) {
		for(i=0;i<go.length;i++) {
			obj = go[i];
			if(name) obj.anm = name;
			this.data.addGeometryOverlay(obj);
		}
	}
	if(gi) {
		for(i=0;i<gi.length;i++) {
			obj = gi[i];
			if(name) obj.anm = name;
			this.data.addGeometryOverlay(obj);
		}
	}
	if(mo) {
		for(i=0;i<mo.length;i++) {
			obj = mo[i];
			if(name) obj.anm = name;
			this.data.addMarkerOverlay(obj);
		}
	}
}

//-----------------------------
// Initialization
//-----------------------------

/** This method creates the control.
 * @private */
micello.maps.MapControl.prototype.createControl = function(mapElementId) {
        
	/** The MapEvent object for the map control.
	 * @private */
	this.mapEvent = new micello.maps.MapEvent(this);
        
	/** The MapGUI object for the map control.
	 * @private */
	this.mapGUI = new micello.maps.MapGUI(this,mapElementId,this.mapEvent);

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
	var mapControl = this;
	var onCommunityLoad = function(e) {
		var community = mapControl.data.getCommunity();
		if(community.id == e.id) {
			mapControl.loadCommunityOverrides(community);
		}
	}
	this.mapEvent.addListener("communityloaded",onCommunityLoad);
 
        
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
	this.mapEvent.addListener("themeloaded",onThemeReady);
		
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
	this.mapCanvas.themeMap = this.themeMap;

}

/** This method processes the community specific overrides
 * @private */
micello.maps.MapControl.prototype.loadCommunityOverrides = function(community) {
	if(community.or) {
		var overrides = community.or;
		var themeMap = this.themeMap;
		
		if(overrides.stringsUrls) {
			var addStringsFunction = function(stringsJson) {
				themeMap.addStrings(stringsJson)
			}
			this.loadUrlObjects(overrides.stringsUrls,addStringsFunction);
		}
		
		if(overrides.themeMapUrls) {
			var addThemeMapFunction = function(themeMapsJson) {
				themeMap.addThemeMap(themeMapsJson)
			}
			this.loadUrlObjects(overrides.themeMapUrls,addThemeMapFunction);
		}
		
		if((overrides.themeUrls)&&(!micello.maps.themeUrl)&&(micello.maps.themeName)) {
			var themeUrls = overrides.themeUrls[micello.maps.themeName];
			if((themeUrls)&&(themeUrls.length > 0)) {
				var addThemeFunction = function(themeJson) {
					themeMap.addTheme(themeJson)
				}
				this.loadUrlObjects(themeUrls,addThemeFunction);
			}
		}
	}
}

/** This method downloads and adds theoverride thememaps
 * @private */
micello.maps.MapControl.prototype.loadUrlObjects = function(urls,addFunction) {
	if(!urls) return;

	var mapCanvas = this.mapCanvas;
	var onDownload = function(stringsJson) {
		//clear cache on each add. Preferebly there is only one.
		addFunction(stringsJson);
		mapCanvas.clearRenderCache();
	}
	for(var i = 0; i < urls.length; i++) {
		var url = urls[i];
		micello.maps.request.loadDataObject(url,onDownload);
	}
}

///** This method downloads and adds theoverride thememaps
// * @private */
//micello.maps.MapControl.prototype.loadStrings = function(stringsUrls) {
//	if(!stringsUrls) return;
//
//	var themeMap = this.themeMap;
//	var mapCanvas = this.mapCanvas;
//	var onDownload = function(stringsJson) {
//		//clear cache on each add. Preferebly there is only one.
//		themeMap.addStrings(stringsJson);
//		mapCanvas.clearRenderCache();
//	}
//	for(var i = 0; i < stringsUrls.length; i++) {
//		var url = stringsUrls[i];
//		micello.maps.request.loadDataObject(url,onDownload);
//	}
//}
//
///** This method downloads and adds theoverride thememaps
// * @private */
//micello.maps.MapControl.prototype.loadThemeMaps = function(themeMapUrls) {
//	if(!themeMapUrls) return;
//
//	var themeMap = this.themeMap;
//	var mapCanvas = this.mapCanvas;
//	var onDownload = function(themeMapJson) {
//		//clear cache on each add. Preferebly there is only one.
//		themeMap.addThemeMap(themeMapJson);
//		mapCanvas.clearRenderCache();
//	}
//	for(var i = 0; i < themeMapUrls.length; i++) {
//		var url = themeMapUrls[i];
//		micello.maps.request.loadDataObject(url,onDownload);
//	}
//}
//
///** This method downloads and adds theoverride themes
// * @private */
//micello.maps.MapControl.prototype.loadThemeOverrides = function(themeUrls) {
//	if(!themeUrls) return;
//
//	var themeMap = this.themeMap;
//	var mapCanvas = this.mapCanvas;
//	var onDownload = function(themeJson) {
//		//clear cache on each add. Preferebly there is only one.
//		themeMap.addTheme(themeJson);
//		mapCanvas.clearRenderCache();
//	}
//	for(var i = 0; i < themeUrls.length; i++) {
//		var url = themeUrls[i];
//		micello.maps.request.loadDataObject(url,onDownload);
//	}
//}
	//If the map is dynamically loaded, these variables need to be defined at the end
if(micello.maps.initCallback) {
	micello.maps.initCallback();
}