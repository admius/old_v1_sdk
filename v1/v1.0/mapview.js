/**
 * This constructor takes the map control and the map canvas. It should not be
 * called explicitly. It should be called by the map control.
 *
 * @class This class manages the view of the map. It contains functions to set the
 * view as well as to read it.
 */
micello.maps.MapView = function(mapControl,viewportElement,mapElement,mapCanvas, mapGUI,mapEvent) {
    
    this.camera = new THREE.PerspectiveCamera( 45, DISPLAY_WIDTH/DISPLAY_HEIGHT, 1, 4000 );
    
    //this.cameraLocation = new THREE.Vector3( 0, 0, 500 );
    this.cameraTarget = new THREE.Vector3( 0, 0, 0 );
    
    this.camera.lookAt(this.cameraTarget);
    this.camera.position.set( 200, 300, 1000 );
    
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
	 * @private */
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
}