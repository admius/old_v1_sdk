
micello.maps.MapRenderer = function(redrawMapFunction) {

	this.redrawMap = redrawMapFunction;
	this.themeMap = null;

	/** @private */
	this.defaultLabelStyle = {
		"font":"Arial, Helvetica, sans-serif",
		"minFont":9,
		"maxFont":28,
		"fill":"#000000"
	};

	this.RENDER_FONT_SIZE = 28;
	this.BIG_FONT_SIZE = 144;

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

	this.uniqueId = 0;
}

micello.maps.MapRenderer.prototype.setThemeMap = function(themeMap) {
	this.themeMap = themeMap;
}

/** This method draws an individual tile .
 * @private */
micello.maps.MapRenderer.prototype.drawTile = function(currentLevel,tile,mapToCanvasTransform) {

	//render
	var ctx = tile.canvas.getContext('2d');

	if(ctx){
		ctx.clearRect(0,0,tile.canvas.width,tile.canvas.height);

        // assign font for whole context
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';

		ctx.save();

		//transform from data coordinates to tile coordinates
		ctx.translate(-tile.elementX,-tile.elementY);
		ctx.transform(mapToCanvasTransform[0],mapToCanvasTransform[1],mapToCanvasTransform[2],mapToCanvasTransform[3],mapToCanvasTransform[4],mapToCanvasTransform[5]);

		//render main geom
		var geomArray;
		var gList = currentLevel.gList;
		for(gList.start(); ((geomArray = gList.currentList()) != null); gList.next()) {
			this.render(ctx,geomArray,tile);
		}

		ctx.restore();
	}

	//flag tile as valid
	tile.invalid = false;
}

/** This method renders a geometry array on a canvas context.
 * @private */
micello.maps.MapRenderer.prototype.render = function(ctx,geomArray,tile) {

	if((!this.themeMap)||(!this.themeMap.isLoaded())) return;

	var count = geomArray.length;
	var zoomScale = tile.scale;
	var i;
	var geom;
	var renderCache;
	var style;

	//---------------
	//render geometry
	//---------------
	for(i = 0; i < count; i++) {
		geom = geomArray[i];

		//check for tile intersection
		if(!geom.mm) this.loadGeomMinMax(geom);
		if((geom.mm)&&(!tile.mapIntersects(geom.mm))) continue;

		//load the render cache if needed
		if(!geom.renderCache) {
			geom.renderCache = this.getRenderCache(ctx, geom);
		}
		renderCache = geom.renderCache;

		//geometry, path
		if((renderCache)&&(renderCache.style)) {
			style = renderCache.style;
			if((style.zmin)&&(style.zmin > zoomScale)) continue;

			//check if style is pending loaded resources
			if((style.pending & micello.maps.MapRenderer.TEXTURE)&&(style.textureInfo)) {
				this.updateCacheObjects(style.textureInfo,tile,style);
			}

			this.renderPath(ctx,geom,style,zoomScale,tile);
		}
	}

	//---------------
	//render label
	//---------------
	for(i = 0; i < count; i++) {
		geom = geomArray[i];

		//check for tile intersection
		if((geom.mm)&&(!tile.mapIntersects(geom.mm))) continue;

		//load the render cache, if needed (it should already be done)
		if(!geom.renderCache) {
			geom.renderCache = this.getRenderCache(ctx, geom);
		}
		renderCache = geom.renderCache;

		//check if there are pending resources
		if(renderCache.pending) {
			if((renderCache.pending & micello.maps.MapRenderer.IMAGE)&&(renderCache.imgInfo)) {
				this.updateCacheObjects(renderCache.imgInfo,tile,renderCache);
			}
			if((renderCache.pending & micello.maps.MapRenderer.ICON)&&(renderCache.iconInfo)) {
				this.updateCacheObjects(renderCache.iconInfo,tile,renderCache);
			}
		}

		//render the label
		this.renderLabel(ctx,geom,zoomScale)
	}
}


/*
 *  This mehdo loads the style and label cache
 *
 *  @private
 */
micello.maps.MapRenderer.prototype.getRenderCache = function (ctx, geom) {
	var renderCache = {};
	//for anonymous functions
	var instance = this;

	//geometry style
	var style = this.themeMap.getStyle(geom);
	renderCache.style = style;
	if(style) {
		//check for visibility
		renderCache.geomVisible = ((renderCache.style.m)||((renderCache.o)&&(renderCache.style.w)));

		//check for loading a texxture for this style
		if(style.img) {

			//for style, it might pass here multiple times
			if(!style.textureInfo) {

				//I define these two functions inline because I needed access to the contecxt (ctx) object
				//I keep them as member objects so I don't have to redefine the functions every time
				if(!this.applyImagePattern) {
					this.applyImagePattern = function(style,textureInfo) {
						var pattern
						try { // this makes Firefox happy
							pattern = ctx.createPattern(textureInfo.img, 'repeat');
						}
						catch (ex) {}
						style.pattern = pattern;
					}
				}
				if(!this.onTextureLoad) {
					this.onTextureLoad = function(resInfo) {
						micello.maps.MapRenderer.updateResourceObject(resInfo, instance.applyImagePattern, micello.maps.MapRenderer.TEXTURE);
					}
				}
				//create the on texture error callback just once
				if(!this.onTextureError) {
					this.onTextureError = function(resInfo) {
						micello.maps.MapRenderer.updateResourceObject(resInfo, micello.maps.MapRenderer.TEXTURE, instance.mapEvent);
					}
				}

				//load the texture image, passing the handler
				var textureInfo = this.themeMap.getImage(style.img,this.onTextureLoad,this.onTextureError);
				if(textureInfo.pending) {
					if(renderCache.pending === undefined) renderCache.pending = 0;
					style.pending |= micello.maps.MapRenderer.TEXTURE;
					style.textureInfo = textureInfo;
					style.cacheId = this.getUniqueString();
				}
				else {
					this.applyImagePattern(style,textureInfo);
				}
			}
		}
	}

	//label
	if(geom.l) {
		var labelStyle;
		if((renderCache.style)&&(renderCache.style.l)) {
			labelStyle = this.themeMap.getLabelStyle(renderCache.style.l);
		}
		if(!labelStyle) labelStyle = this.themeMap.defaultLabelStyle;
		if(!labelStyle) labelStyle = this.defaultLabelStyle;
		renderCache.labelStyle = labelStyle;

		var labInf = geom.l;
		var spaceWidth = labInf[2];
		var spaceHeight = labInf[3];
		if(spaceWidth <= 0) spaceWidth = 1;
		if(spaceHeight <= 0) spaceHeight = 1;

		var labelInfo = this.themeMap.getLabel(geom);
		if(labelInfo) {
			renderCache.labInfo = labelInfo;

			if(labelInfo.lt == 1) {
				//text label
				if((labelStyle)&&((labelStyle.fill)||((labelStyle.outline)&&(labelStyle.outlineWidth)))) {
					var text;
					if(labelInfo.r) {
						text = labelInfo.r;
					}
					else if(labelInfo.ar) {
						text = this.themeMap.translate(labelInfo.ar,labelInfo.ar);
					}
					else {
						text = null;
					}

					if(text == null) {
						renderCache.labelVisible = false;
						renderCache.w = 0;
						renderCache.h = 0;
					}
					else {
						renderCache.labelVisible = true;

						if(labelStyle.caps) {
							text = text.toUpperCase();
						}

						// text cache -----------------------------------------
						var font = labelStyle.font ? labelStyle.font : this.defaultLabelStyle.font;
						ctx.font = this.RENDER_FONT_SIZE + "px " + font;

						//single line text info
						var metrics = ctx.measureText(text);
						var w1 = metrics.width;
						var h1 = this.RENDER_FONT_SIZE;
						var padding = labelStyle.padding ? labelStyle.padding : 0;
						w1 += 2 * padding;
						h1 += 2 * padding;

						var textInfo = {
							"lr":text,
							"w1":w1,
							"h1":h1
						};

						//two line text info
						var midPoint = text.length/2;
						var pos = -1;
						var off;
						var bestPos = null;
						var bestOff;
						var c;
						while((c = text.indexOf(" ",pos+1)) >= 0) {
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
							var stra = text.substr(0,bestPos);
							var strb = text.substr(bestPos+1,text.length);
							var w2a = ctx.measureText(stra).width;
							var w2b = ctx.measureText(strb).width;
							var w2 = w2a > w2b ? w2a : w2b;
							var h2 =  2 * this.RENDER_FONT_SIZE;

							w2 += 2 * padding;
							h2 += 2 * padding;

							var sf1 = this.getScaleFactor(spaceWidth,spaceHeight,w1,h1);
							var sf2 = this.getScaleFactor(spaceWidth,spaceHeight,w2,h2);

							var twoLines;
							if(sf2 > sf1) {
								//use the two line info
								textInfo.sc = 1 / sf1;
								textInfo.lr1 = stra;
								textInfo.lr2 = strb;
								textInfo.w2 = w2;
								textInfo.h2 = h2;
								twoLines = true;
							}
							else {
								twoLines = false;
							}

						}

						if(twoLines) {
							renderCache.w = textInfo.w2;
							renderCache.h = textInfo.h2;
						}
						else {
							renderCache.w = textInfo.w1;
							renderCache.h = textInfo.h1;
						}

						renderCache.textInfo = textInfo;
					}

					//for text, use text centering
					renderCache.nax = 0;
					renderCache.nay = 0;
				}

			}
			else if(labelInfo.lt == 2) {
				//icon label

				//load the icon
				//create the on icon error callback just once
				if(!this.onIconError) {
					this.onIconError = function(resInfo) {
						micello.maps.MapRenderer.updateResourceObject(resInfo, micello.maps.MapRenderer.ICON, instance.mapEvent);
					}
				}
				var iconInfo = this.themeMap.getIcon(labelInfo.url,micello.maps.MapRenderer.onIconLoad,this.onIconError);
				if(iconInfo.pending) {
					if(renderCache.pending === undefined) renderCache.pending = 0;
					renderCache.pending |= micello.maps.MapRenderer.ICON;
					renderCache.iconInfo = iconInfo;

					//needed to identify object
					if(!renderCache.cacheId) {
						renderCache.cacheId = this.getUniqueString();
					}

				}
				else {
					micello.maps.MapRenderer.iconApplyResource(renderCache,iconInfo);
				}

			}
			else if(labelInfo.lt == 3) {
				//image

				//create the on image error callback just once
				if(!this.onImageError) {
					this.onImageError = function(resInfo) {
						micello.maps.MapRenderer.updateResourceObject(resInfo, micello.maps.MapRenderer.IMAGE, instance.mapEvent);
					}
				}
				var imgInfo = this.themeMap.getImage(labelInfo.url,micello.maps.MapRenderer.onImageLoad,this.onImageError);
				if(imgInfo.pending) {
					if(renderCache.pending === undefined) renderCache.pending = 0;
					renderCache.pending |= micello.maps.MapRenderer.IMAGE;
					renderCache.imgInfo = imgInfo;

					//needed to identify object
					if(!renderCache.cacheId) {
						renderCache.cacheId = this.getUniqueString();
					}
				}
				else {
					micello.maps.MapRenderer.imageApplyResource(renderCache,imgInfo);
				}
			}
		}
	}

	return renderCache;
}

/** This method draws an individual path.
 * @private */
micello.maps.MapRenderer.prototype.renderPath = function(ctx,geom,style,scale,tile) {

	var geomType = geom.gt;
	if(geomType == undefined) geomType = 2; // area
	var gw = geom.gw;
	var path = geom.shp;
	if(!path) return;

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

		//apply shadow
		if (style.s) {
			var s = style.s;
			ctx.shadowColor = s[0];
			ctx.shadowBlur = s[1]*(scale*2);
			ctx.shadowOffsetX = s[2]*(scale+1);
			ctx.shadowOffsetY = s[3]*(scale+1);
		}
		else {
			ctx.shadowColor = "rgba(0,0,0,0.0)"; // reset shadow
		}

		//fill area
		if(style.m) {
			ctx.fillStyle = style.m;
			ctx.fill();
		}

		//apply texture
		if (style.pattern) { // the pattern exists
			ctx.fillStyle = style.pattern;
			ctx.fill();
		}

		//apply outline
		if((style.o)&&(style.w)) {
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
		micello.maps.onError(this.mapEvent,"other geom type: " + geomType,"micello.maps.MapRenderer.renderPath");
	}
}



micello.maps.MapRenderer.prototype.renderLabel = function(ctx,geom,zoomScale) {

		//exit if there is no label or if it has a 0 size
		var renderCache = geom.renderCache;
		if((!renderCache)||(!renderCache.w)||(!renderCache.h)) return;

		var labelInfo = renderCache.labInfo;
		var labelStyle = renderCache.labelStyle;
		var renderStyle;

		if((labelInfo.zmin)&&(labelInfo.zmin > zoomScale)) return;

		var labArea = geom.l;
		var spaceWidth = labArea[2];
		var spaceHeight = labArea[3];
		var labRot = labArea[4];
		if(spaceWidth <= 0) spaceWidth = 1;
		if(spaceHeight <= 0) spaceHeight = 1;

		var scaleFactor = this.getScaleFactor(spaceWidth,spaceHeight,renderCache.w,renderCache.h);

		var squareCase = ((Math.abs(renderCache.h/renderCache.w - 1) < this.SQAURE_TOL)||(Math.abs(spaceHeight/spaceWidth - 1) < this.SQUARE_TOL));

		var noRot = false;

		//additional text processing - check for style and zmin, and correct for text size limits for current zoom scale
		if(labelInfo.lt == 1) {
			//get style and check style zmin
			renderStyle = renderCache.style;
			if(!renderStyle) return;
			if((renderStyle.zmin)&&(renderStyle.zmin > zoomScale)) return;

			var font = labelStyle.font ? labelStyle.font : this.defaultLabelStyle.font;
			ctx.font = this.RENDER_FONT_SIZE + "px " + font;

			var maxFont = labelStyle.maxFont ? labelStyle.maxFont : this.BIG_FONT_SIZE;
			var minFont = labelStyle.minFont ? labelStyle.minFont : 0;

			//handle render scale
			var totalScale = scaleFactor * zoomScale;
			if (totalScale * maxFont < minFont) {
				return;
			}
			var maxScale = maxFont / this.RENDER_FONT_SIZE;
			if (totalScale > maxScale) {
				scaleFactor = maxScale / zoomScale;
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
		ctx.save()
		ctx.translate(labArea[0],labArea[1]);
		ctx.rotate(labRot);
		ctx.scale(scaleFactor,scaleFactor);
		ctx.translate(renderCache.nax,renderCache.nay);

		if((labelStyle.bgFill)||((labelStyle.bgOutline)&&(labelStyle.bgOutlineWidth))) {
			this.drawLabelBackground(ctx,renderCache.w,renderCache.h,labelStyle);
		}

		if(renderCache.textInfo) {
			var textInfo = renderCache.textInfo;

			ctx.fillStyle = labelStyle.fill;
			ctx.strokeStyle = labelStyle.outline;
			ctx.lineWidth = labelStyle.outlineWidth;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			if(textInfo.lr2) {

				if((labelStyle.outline)&&(labelStyle.outlineWidth)) {
					ctx.strokeText(textInfo.lr1,0,-this.RENDER_FONT_SIZE/2);
					ctx.strokeText(textInfo.lr2,0,this.RENDER_FONT_SIZE/2);
				}

				if(labelStyle.fill) {
					ctx.fillText(textInfo.lr1,0,-this.RENDER_FONT_SIZE/2);
					ctx.fillText(textInfo.lr2,0,this.RENDER_FONT_SIZE/2);
				}

			}
			else {
				if(labelStyle.fill) {
					ctx.fillText(textInfo.lr,0,0);
				}

				if((labelStyle.outline)&&(labelStyle.outlineWidth)) {
					ctx.strokeText(textInfo.lr,0,0);
				}
			}
		}
		else if(renderCache.icon) {
			var ip;
			var cntp = renderCache.icon.g.length;
			for(ip=0;ip<cntp;ip++) {
				var igeom = renderCache.icon.g[ip];
				renderStyle = igeom.os;
				if(!renderStyle) continue;
				this.renderPath(ctx,igeom,renderStyle,zoomScale);
			}
		}
		else if(renderCache.img) {
			ctx.drawImage(renderCache.img,0,0);
		}

		ctx.restore();
}

/*
 *  Draws the label background for any geometries that have one.
 *  @private
 */
micello.maps.MapRenderer.prototype.drawLabelBackground = function (ctx,w,h,labelStyle) {

	var bgPad = labelStyle.bgPadding ? labelStyle.bgPadding : 0;
	var labPad = labelStyle.padding ? labelStyle.padding : 0;

	var r = labelStyle.bgR ? bgR : 0 ;

	w = w-2*(labPad - bgPad); // adjust width
	h = h-2*(labPad - bgPad);

	var x = -w/2;
	var y = -h/2;

	if(r) {
		ctx.beginPath();
		ctx.moveTo(x+r, y);
		ctx.lineTo(x+w-r, y);
		ctx.quadraticCurveTo(x+w, y, x+w, y+r);
		ctx.lineTo(x+w, y+h-r);
		ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
		ctx.lineTo(x+r, y+h);
		ctx.quadraticCurveTo(x, y+h, x, y+h-r);
		ctx.lineTo(x, y+r);
		ctx.quadraticCurveTo(x, y, x+r, y);
		ctx.closePath();
	}
	else {
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x+w, y);
		ctx.lineTo(x+w, y+h);
		ctx.lineTo(x, y+h);
		ctx.lineTo(x, y);
		ctx.closePath();
	}

	if (labelStyle.shadow) {
		ctx.shadowColor = labelStyle.shadow[0];
		ctx.shadowBlur = labelStyle.shadow[1];
		ctx.shadowOffsetX = labelStyle.shadow[2];
		ctx.shadowOffsetY = labelStyle.shadow[3];
	}
	else {
		ctx.shadowColor = "rgba(0,0,0,0.0)"; // reset shadow
	}

	if(labelStyle.bgFill) {
		ctx.fillStyle = labelStyle.bgFill;
		ctx.fill();
	}
	ctx.shadowColor = "rgba(0,0,0,0.0)"; // reset shadow

	if((labelStyle.bgOutline)&&(labelStyle.bgOutlineWidth)) {
		ctx.strokeStyle = labelStyle.bgOutline;
		ctx.lineWidth = labelStyle.bgOutlineWidth;
		ctx.stroke();
	}
}

/** This method checks if the canvas coordinates intersect an geometry in the lists passed.
 * @private */
micello.maps.MapRenderer.prototype.hitCheck = function(level,mapX,mapY,zoomScale) {

	//hit check map geom
	var clickedGeom = null;
	var geomArray;
	var i;
	var cnt;
	var style;
	var gList = level.gList;
	for(gList.start(); ((geomArray = gList.currentList()) != null); gList.next()) {
		cnt = geomArray.length;
		
		//check this geom array
		for(i=0;i<cnt;i++) {
			var geom = geomArray[i];
			var geomVisible;
			var hit = false;

			if((geom.shp)&&(geom.gt == 2)) {
				//-----------------
				//check geom path areas
				//-----------------

				//make sure we have the bounding box
				if(!geom.mm) this.loadGeomMinMax(geom);

				//check bb
				if((mapX > geom.mm[0][0])&&(mapY > geom.mm[0][1])&&(mapX < geom.mm[1][0])&&(mapY < geom.mm[1][1])) {
					geomVisible = true;

					//check visibility
					if(geom.renderCache) {
						if(!geom.renderCache.geomVisible) geomVisible = false;

						if(geom.renderCache.style) {
							style = geom.renderCache.style;
							if((style.zmin)&&(style.zmin > zoomScale)) geomVisible = false;
						}
					}

					//hit check geom
					if(geomVisible) {
						if(micello.geom.pathHit(geom.shp,mapX,mapY)) hit = true;
					}
				}
			}
			if((geom.l)&&( ((geom.shp)&&(geom.gt == 2)&&((!geomVisible)||(geom.el))) || (geom.gt == 0) )) {
				//-------------------------
				// check labels for points and areas with geom not visible or that an external label.
				//-------------------------

				var check = true;
				if(geom.renderCache) {
					//make sure label exists
					if(!geom.renderCache.labelVisible) check = false;

					//make sure label is in range
					if(geom.renderCache.labInfo) {
						var labInfo = geom.renderCache.labInfo;
						if((labInfo.zmin)&&(labInfo.zmin > zoomScale)) check = false;

						if(labInfo.lt == 1) {
							//text label
							if((geom.renderCache)&&(geom.renderCache.style)) {
								style = geom.renderCache.style;
								if((style.zmin)&&(style.zmin > zoomScale)) check = false;
							}
						}
					}
				}

				if(check) {
					if(micello.geom.rotRectHit(geom.l,mapX,mapY)) hit = true;
				}
			}
			if(hit) clickedGeom = geom;
		}

		
	}
	return clickedGeom;
}


//----------------------
//utilities
//----------------------


/*
 *  Gets the optimal scale factor for fitting a rectangle in an available space.
 *  @private
 */
micello.maps.MapRenderer.prototype.getScaleFactor = function (availWidth,availHeight,width,height) {
	var wFactor = availWidth / width;
	var hFactor = availHeight / height;
	return (wFactor > hFactor) ? hFactor : wFactor;
}

/** This method loads the minmax bounding box for a geometry.
 * @private */
micello.maps.MapRenderer.prototype.loadGeomMinMax = function(geom) {
	var mm = micello.geom.getInvalidMinMax();
	if(geom.shp) {
		micello.geom.loadPathMinMax(geom.shp,mm);
	}
	if((geom.l)&&((!geom.shp)||(geom.el))) {
		micello.geom.loadRotRectMinMax(geom.l,mm)
	}
	geom.mm = mm;
}

micello.maps.MapRenderer.prototype.getUniqueString = function() {
	//if I don't use the "new" function, it will return the funtion rather than the string
	return new String(this.uniqueId++);
}

//-----------------------
// Asynchconous Resource Loading
// This code is used to store a reference to the resource in the render cache for 
// each object. To do this asynchronously it must keep track of the objects that need
// a copy of the resource and apply it when the resource arrives. Also it must keep
// a record of which tiles need to be redrawn when the resource arrives.
//-----------------------

/** Icon loading bit
 * @private */
micello.maps.MapRenderer.ICON = 1;
/** Icon loading bit
 * @private */
micello.maps.MapRenderer.IMAGE = 2;
/** Icon loading bit
 * @private */
micello.maps.MapRenderer.TEXTURE = 4;

//--------------
// Instance Functions
//--------------

/** This is a function adds the tile (if needed) to the list of tiles that need to be
 * redrawn when the resource loads, and the cacheParent (if needed) to the list of
 * cacheParents that need to be updated when the resource loads. Separately, when the
 * resource is requested, a onload method should be set to process the resource info
 * to update the tiles and cacheParents. Here, the cache parent is either a renderCache (for icon or image)
 * or a style object (for texture)
 *
 * @private */
micello.maps.MapRenderer.prototype.updateCacheObjects = function(resourceInfo,tile,cacheParent) {

	var clientData = resourceInfo.clientData;
	if(!clientData) {
		clientData = {};
		clientData.redrawMap = this.redrawMap;
		clientData.tiles = {};
		clientData.infos = {};
		resourceInfo.clientData = clientData;
	}

	//create a set of tiles for this resource
	if(!clientData.tiles[tile.key]) {
		clientData.tiles[tile.key] = tile;
	}

	//create a set of cache parents for this resource
	if(!clientData.infos[cacheParent.cacheId]) {
		clientData.infos[cacheParent.cacheId] = cacheParent;
	}
}

//--------------
// Static Functions
//--------------

/**This is a function that triggers a redraw when a resource loads. IT requires a function
 * applutResource which does case specific actions.
 *
 * @private */
micello.maps.MapRenderer.updateResourceObject = function(resInfo,applyResource, pendingBit) {

	var key;
	var clientData = resInfo.clientData;
	if(!clientData) return;

	//update the render info
	var cacheParent;
	if(clientData.infos) {
		for(key in clientData.infos) {
			cacheParent = clientData.infos[key];
			//apply the resource to the cacheparent
			applyResource(cacheParent,resInfo);
			if(cacheParent.pending) {
				cacheParent.pending &= ~pendingBit;
				if(cacheParent.pending === 0) delete cacheParent.pending;
			}
		}
	}

	//invaidate the tiles
	var tile;
	if(clientData.tiles) {
		for(key in clientData.tiles) {
			tile = clientData.tiles[key];
			//warning - if the tile has become a new tile, this might invalidate a good tile
			tile.invalid = true;
		}
	}
	//delete pending data
	delete resInfo.clientData;

	//call draw with a long
	clientData.redrawMap();
}

/** This method applies a loaded texture image.
 * @private
 */
micello.maps.MapRenderer.iconApplyResource = function(renderInfo,iconInfo) {
	renderInfo.icon = iconInfo.icon;
	renderInfo.w = renderInfo.icon.w;
	renderInfo.h = renderInfo.icon.h;
	renderInfo.nax = -renderInfo.w/2;
	renderInfo.nay = -renderInfo.h/2;
	renderInfo.labelVisible = true;
}

/** This method applies a loaded texture image.
 * @private
 */
micello.maps.MapRenderer.imageApplyResource = function(renderInfo,imgInfo) {
	renderInfo.img = imgInfo.img;
	renderInfo.w = renderInfo.img.width;
	renderInfo.h = renderInfo.img.height;
	renderInfo.nax = -renderInfo.w/2;
	renderInfo.nay = -renderInfo.h/2;
	renderInfo.labelVisible = true;
}

/** This is the full handler for a loaded icon.
 * @private
 */
micello.maps.MapRenderer.onIconLoad = function(resInfo) {
	micello.maps.MapRenderer.updateResourceObject(resInfo, micello.maps.MapRenderer.iconApplyResource, micello.maps.MapRenderer.ICON)
}

/** This is the full handler for a loaded image.
 * @private
 */
micello.maps.MapRenderer.onImageLoad = function(resInfo) {
	micello.maps.MapRenderer.updateResourceObject(resInfo, micello.maps.MapRenderer.imageApplyResource, micello.maps.MapRenderer.IMAGE)
}

/**This is a function that triggers a redraw when a resource loads. IT requires a function
 * applutResource which does case specific actions.
 *
 * @private */
micello.maps.MapRenderer.onResourceError = function(resInfo, pendingBit, mapEvent) {

	var key;
	var clientData = resInfo.clientData;
	if(!clientData) return;

	//clear the pending flag
	var cacheParent;
	if(clientData.infos) {
		for(key in clientData.infos) {
			cacheParent = clientData.infos[key];
			if(cacheParent.pending) {
				cacheParent.pending &= ~pendingBit;
				if(cacheParent.pending === 0) delete cacheParent.pending;
			}
		}
	}

	//delete pending data
	delete resInfo.clientData;

	micello.maps.onError(mapEvent,"Error loading theme resource","micello.maps.MapRenderer >> onResourceError");
}


