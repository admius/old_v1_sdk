
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
}