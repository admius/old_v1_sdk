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



