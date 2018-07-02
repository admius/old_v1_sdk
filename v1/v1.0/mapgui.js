/**
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
	this.mapElement.addEventListener("DOMMouseScroll", function (e) {mapGUI.onMouseWheel(e);}, false);
    this.mapElement.addEventListener("mousewheel", function (e) {mapGUI.onMouseWheel(e);}, false);        
        
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


/** This displays a message for the map. */
micello.maps.MapGUI.prototype.msgDisplay = function(msg) {

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
        var eM = document.getElementById("micello-map-msg");
        eM.style.display = "none";
    }, 7000);

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
		if( drawing ) {
			this.createUI(drawing);

			var level = this.data.getCurrentLevel();
			this.UILevelsCorrection(level);
		}

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
                //no op, for now - was some animation code here
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
        
        //no op - was animation code
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

    e.preventDefault();
    
	// SCROLL ZOOMING BELOW THIS POINT
    if (e.detail) {
        e.wheelDelta = -e.detail/3;
    }
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
	this.ui.nameTxt.innerHTML = community.p.name;
    micello.util.addClass(this.ui.nameTxt, 'ui_name_text');
    micello.util.addCss(this.ui.nameTxt, { color: this.NAME_COLOR });

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
        
		var comName = community.d[cnt].p.name;
		if( !comName ) { comName = 'Map '+community.d[cnt].id; }
        drawingName.innerHTML = comName;
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
        width: '50%',
        height: '50%',
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
        mapGui.UIDrawingArrowToggle(heightManager);
        mapGui.conditionalUI();

    }

	this.ui.drwLst.addEventListener("DOMMouseScroll", function (e) {mapGui.ui.drwLst.onMouseWheel(e);}, false);
	this.ui.drwLst.addEventListener("mousewheel", function (e) {mapGui.ui.drwLst.onMouseWheel(e);}, false);
	
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
    this.UIDrawingArrow(lvlArwWdth, heightManager);
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
micello.maps.MapGUI.prototype.UIDrawingArrow = function (lvlArwWdth, heightManager) {
    
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
        mapGui.UIDrawingArrowToggle(heightManager);
        

    }
    
    this.UIDrawingArrowToggle(heightManager);
    
    
}

/** @private */
micello.maps.MapGUI.prototype.UIDrawingArrowToggle = function (heightManager) {

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
	
	this.ui.levelsFlrs.addEventListener("DOMMouseScroll", function (e) {mapGui.ui.levelsFlrs.onMouseWheel(e);}, false);
	this.ui.levelsFlrs.addEventListener("mousewheel", function (e) {mapGui.ui.levelsFlrs.onMouseWheel(e);}, false);

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
    
    /* Add in the version info */
    this.ui.attribution.versionInfo = micello.util.addElem('ui-version-info');
    this.ui.attribution.versionInfo.innerHTML = '&copy; m: '+community.mv+' | e: '+community.ev;
    var vInfoHeight = calcHeight;
    micello.util.addCss(this.ui.attribution.versionInfo, {
        position: 'absolute',
        top: vInfoHeight+'px',
        left: '0',
        visibility: 'visible',
        opacity: '.15',
        display: 'block',
        filter: 'alpha(opacity=15)',
        fontSize: '60%',
        lineHeight: '9px',
   
    });
    this.ui.attribution.appendChild(this.ui.attribution.versionInfo);
    
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
	var position;
	var cnt;
	var tmpPos;
    
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
            
            case "left bottom":
            case "center bottom":
			case "right bottom":
				
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
    var position;
	var cnt;
	
    for ( position in this.UISections) {
        
		/* This prevents intrusion of foreign elements to our UI Sections objects */
		if( typeof this.UISections[position] !== 'array') { continue; }
		
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
}