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
	this.IMAGE_LOOKUP_BASE = "icon:"; //not a typo
	
	this.LABEL_DELIMITER = ", ";

	this.styleTree = null;
	this.labelTree = null;
	this.styleMap = null;
	this.iconMap = null;
	this.labelStyleMap = null;
	this.markerMap = null;
	this.stringsTable = null;

	this.themeMapUrl = null;
	this.themeUrl = null;
	this.stringsUrl = null;

	this.loaded = false;
	
	this.defaultStyle = null;
	this.defaultLabelStyle = null;

	//cache
	this.imageCache = {};
	this.iconCache = {};

	this.DEFAULT_STYLE_NAME = "Object";
	this.DEFAULT_LABEL_STYLE_NAME = "default";
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
	var onError = function(msg) {
		micello.maps.onError(instance.mapEvent,msg,"micello.maps.ThemeMap.loadData >> onError");
	}
	if(this.themeMapUrl) {
		var themeMapCallback = function(themeMap) {
			instance.onThemeMapLoad(themeMap);
		}
		micello.maps.request.loadDataObject(this.themeMapUrl,themeMapCallback,onError);
	}
	if(this.themeUrl) {
		var themeCallback = function(theme) {
			instance.onThemeLoad(theme);
		}
		micello.maps.request.loadDataObject(this.themeUrl,themeCallback,onError);
	}
	if(this.stringsUrl) {
		var stringsCallback = function(themeMap) {
			instance.onStringsLoad(themeMap);
		}
		micello.maps.request.loadDataObject(this.stringsUrl,stringsCallback,onError);
	}
}

/** This method returns thge font family array. */
micello.maps.ThemeMap.prototype.getLabelStyle = function(labelStyleName) {
	if(this.labelStyleMap) {
		return this.labelStyleMap[labelStyleName];
	}
	else {
		return null;
	}
}

/** This method returns an icon object from a url.
 * The icons are loaded asynchronously if not in memory. When it is loaded, ondoad
 * will be called.*/
micello.maps.ThemeMap.prototype.getIcon = function(url,onload,onError) {
	var iconInfo = this.iconCache[url];
	if(!iconInfo) {
		iconInfo = {};
		iconInfo.url = url;
		this.iconCache[url] = iconInfo;
	}
	if((!iconInfo.icon)&&(!iconInfo.pending)) {
		iconInfo.onload = onload;
		var iconCallback = function(icon) {
			delete iconInfo.pending;
			iconInfo.icon = icon;
			if(iconInfo.onload) {
				iconInfo.onload(iconInfo);
			}
		}
		iconInfo.pending = true;
		micello.maps.request.loadDataObject(url,iconCallback,onError);
	}
	return iconInfo;
}


/** This method returns an image object, loaded from the given url.
 * The images are loaded asynchronously if not in memory. When it is loaded, onload
 * will be called.*/
micello.maps.ThemeMap.prototype.getImage = function(url,onload,onError) {
	var imgInfo = this.imageCache[url];
	if(!imgInfo) {
		imgInfo = {};
		url = micello.maps.request.fixProtocol(url);
		imgInfo.url = url;
		this.imageCache[url] = imgInfo;
	}
	if((!imgInfo.img)&&(!imgInfo.pending)) {
		imgInfo.onload = onload;
		imgInfo.img = new Image();
		imgInfo.img.onload = function() {
			delete imgInfo.pending;
			imgInfo.onload(imgInfo);
		}
		imgInfo.img.onerror = function() {
			delete imgInfo.pending;
			onError(imgInfo);
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
	if(labelInfo) {
		if(labelInfo.r) {
			return labelInfo.r;
		}
		else if(labelInfo.ar) {
			var refName = labelInfo.ar;
			var lookupName;

			if(labelInfo.lt == this.TEXT_LABEL_TYPE) {
				lookupName = refName;
			}
			else if(labelInfo.lt == this.ICON_LABEL_TYPE) {
				lookupName = this.ICON_LOOKUP_BASE + refName;
			}
			else if(labelInfo.lt == this.IMAGE_LABEL_TYPE) {
				lookupName = this.IMAGE_LOOKUP_BASE + refName;
			}
			else {
				return null;
			}
			return this.translate(lookupName,refName);
		}
	}
	return null;
}

/** This method returns a style object feature. It returns null
 * if the theme map is not loaded or a style is not found. */
micello.maps.ThemeMap.prototype.getStyle = function(feature) {
	if(this.styleTree == null) return null;

	var geometry = feature;
	var address = feature.a;
	var entities = feature.me;
	var entity;
	var valueEntry;
	var style;

	for(var it = 0; it < this.styleTree.length; it++) {

		valueEntry = this.styleTree[it];

		if((entities)&&(entities.length > 1)) {
			//multientity case - return first
			for(var i = 0; i < entities.length; i++) {
				entity = entities[i];

				//get regular label
				style = this.processValueEntry(geometry,entity,address,valueEntry,undefined,this.getStyleValue);
				if(style) {
					return style;
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

			style = this.processValueEntry(geometry,entity,address,valueEntry,undefined,this.getStyleValue);
			if(style) {
				return style;
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
	if(!this.labelStyleMap) this.labelStyleMap = {};
	if(!this.markerMap) this.markerMap = {};

	var styleType;
	var labelType;
	var iconType;
	var markerType;
	
	//copy from this theme
	for(styleType in theme.s) {
		this.styleMap[styleType] = theme.s[styleType];
	}
	for(iconType in theme.i) {
		var iconInfo = theme.i[iconType];
		if((theme.iurl)&&(iconInfo.rurl)) {
			iconInfo.url = theme.iurl + iconInfo.rurl;
		}
		this.iconMap[iconType] = iconInfo;
	}
	for(labelType in theme.l) {
		var labelInfo = theme.l[labelType];
		this.labelStyleMap[labelType] = labelInfo;
	}
	for(markerType in theme.m) {
		this.markerMap[markerType] = theme.m[markerType];
	}
	
	//update the default style
	this.defaultStyle = this.styleMap[this.DEFAULT_STYLE_NAME];
	this.defaultLabelStyle = this.labelStyleMap[this.DEFAULT_LABEL_STYLE_NAME];
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
							multiLabelText += this.LABEL_DELIMITER + labelText;
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
						multiLabelText += this.LABEL_DELIMITER + labelText;
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
		return {"lt":this.TEXT_LABEL_TYPE, "r":multiLabelText}
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
	var style = undefined;
	if((entry.n)&&(this.styleMap)) {
		var name = entry.n;
		if(name == "<value>") {
			name = value;
		}
		style = this.styleMap[name];
	}
	return style;
}

/** this method gets the return value. */
micello.maps.ThemeMap.prototype.getLabelValue = function(geometry,entity,address,entry,value) {
	var labelInfo;
	if(entry.lt !== undefined) {
		var labelType = entry.lt;
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

		if(labelType == 0) {
			//no label
			labelInfo = {};
			labelInfo.lt = 0;
		}
		else if(labelType == 1) {
			//text label
			labelInfo = {};
			labelInfo.lt = 1;
			if(entry.trans) {
				labelInfo.ar = labelRef;
			}
			else {
				labelInfo.r = labelRef;
			}
		}
		else if(labelType == 2) {
			//lookup label from theme
			labelInfo = this.iconMap[labelRef];
		}
		else if(labelType == 3) {
			labelInfo = {};
			labelInfo.lt = 3;
			labelInfo.url = labelRef;
		}
	}
	else {
		labelInfo = undefined;
	}
		
	return labelInfo;
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
	if((!this.styleTree)||((this.themeUrl)&&(!this.styleMap))||((this.stringsUrl)&&(!this.stringsTable))) return;

	this.loaded = true;
	if(this.mapEvent) {
        this.mapEvent.dispatchEvent('themeLoaded',this);
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
