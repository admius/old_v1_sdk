/** MapMomentum Class: This is the momentum class handler -- it is essentially an extension of the mapCanvas since all animations happen on the canvas
 * @class This class that manages the momentum
 * */
micello.maps.MapMomentum = function(mapCanvas) {
    
    this.mapCanvas = mapCanvas;
    this.sC = [];//starting coordinates; 0 = x/top; 1 = y/left
    this.length = '4.0s';//this is how long the anim should last
    this.div = '';//the div used in this animation
    this.nm = 'mapMomentum';
    this.style = null;
    this.running = false;
	this.currTimestamp = Date.now();
	this.totalTimeElapsed = 1;
	this.speed = [];
	this.move = [];
	this.currPos = [];
	this.lastPos = [];
    
}

/**
 * This consumes the mouse/touch move event and manages an array of these events to keep the latest two which
 * will be analyzed when the momentum is called into action (i.e. the mouseup/touchend occurs)
 * @param {object} e the original mouse/touch move event object
 * @param {float} moveX the amount of movement along the x axis
 * @param {float} moveY the amount of movement along the y axis
 * @private
 */
micello.maps.MapMomentum.prototype.track = function (e, currX, currY) {
	
	this.lastTimestamp = this.currTimestamp;
	this.currTimestamp = e.timeStamp;//elapsed time
	this.timeElapsed = this.currTimestamp - this.lastTimestamp;
	if( this.timeElapsed == 0 ) { return; }//if there was no timeElapsed, skip this for this round because nothing happened
	
	this.lastPos[0] = this.currPos[0];
	this.currPos[0] = currX;
	this.move[0] = this.currPos[0] - this.lastPos[0];
	
	this.lastPos[1] = this.currPos[1];
	this.currPos[1] = currY;
	this.move[1] = this.currPos[1] - this.lastPos[1];

	this.speed[0] = this.move[0]/this.timeElapsed; //speed along the X axis -- pixels per second
	this.speed[1] = this.move[1]/this.timeElapsed; //speed along the Y axis -- pixels per second
	
}

/**
 * This kicks off the momentum animation -- this is usually called from the mapGui
 * because we need to listen for touch/mouse actions
 * @param {div} The div that will be animated
 * @param {sC} The starting coordinates as defined by the caller[0][x,y] = from; [1][x,y] = to
 * @private
 */
micello.maps.MapMomentum.prototype.begin = function(div, sC, e) {
	
    this.div = div;
    this.sC[0] = sC;
    this.sC[1] = [];
    this.cB = [0, 1, 0, 1];
    var mM = this;

    if ( !this.createRules() ) { return false; }
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
        webkitAnimationTransitionTimingFunction: 'linear',
        animationTransitionTimingFunction: 'linear'
    });
    
    animEndHandler = function (e) {
        mM.animationEnd();
    }
    
    animStartHandler = function (e) {
        mM.running = true;

    }
    
    this.div.addEventListener('webkitAnimationEnd', animEndHandler);
    this.div.addEventListener('animationend', animEndHandler);
    this.div.addEventListener('webkitAnimationStart', animStartHandler);
    this.div.addEventListener('animationstart', animStartHandler);

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
    this.div.removeEventListener('animationend',animEndHandler);
    this.div.removeEventListener('webkitAnimationStart',animStartHandler);
    this.div.removeEventListener('animationstart',animStartHandler);
    
}

/**
 * This creates the Style/CSS rules to drive the animation
 * @private
 */
micello.maps.MapMomentum.prototype.createRules = function() {
    

	/* These are the exceptions -- if enough isnt triggered we just dont momemtum */
	if( Math.abs(this.move[0]) < 5 || Math.abs(this.move[1]) < 5 ) { return false; }
	
    var tempX =  this.sC[0][0] + (this.speed[0]*100);
    var tempY = this.sC[0][1] + (this.speed[1]*100);
    
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
	
	return true;

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
