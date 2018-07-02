/**
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
