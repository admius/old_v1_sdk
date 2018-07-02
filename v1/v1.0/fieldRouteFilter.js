
// this code implements a filter for the position that factors in the navigation network.
//The two methods defined here should override the ones of the same name in the
//field route class to implement the filter.
//(all functions ana variables need to be wrapped in a child class order to do this.)

//---------------------
// Route Constants
//---------------------

//effective distance for a level change node
var LEVEL_CHANGE_EFFECTIVE_DISTANCE = 10;
var MAX_FEEDFORWARD_MPH = 6;
var MAX_FEEDFORWARD_MET_PER_SEC = MAX_FEEDFORWARD_MPH / 2.25;

var UNDEFINED_ERROR_RADIUS = 10;
var MIN_ERROR_RADIUS = 3;

//probability of a measurement being random instead of standard gaussian
var MEAS_PROB_OFFSET = .25; //must be less than 1
//
//probability of a random jump in evolution of positino
var EVOLVE_JUMP_PROB = .25; // must be less that 1

var previousPos;
var currentPos;

//--------------------
// Implementation methods
//--------------------

/** This method does preprocessing on the measurement. */
function onMeasUpdate(pos) {

	//make sure radius is defined and not too small
	if(!pos.r) {
		pos.r = UNDEFINED_ERROR_RADIUS;
	}
	else if(pos.r < MIN_ERROR_RADIUS) {
		pos.r = MIN_ERROR_RADIUS;
	}

	//process position
	previousPos = currentPos;
	currentPos = pos;

	//feed forward old measurement, if there is one
	if(previousPos) {
		var deltaTSec = (currentPos.t - previousPos.t)/1000;
		loadFeedForwardProb(deltaTSec);
	}

	//apply the probability from this measurement
	loadMeasProb(currentPos);

	//update evolved prob with this measurement prob
	doMeasUpdate();
}

/** This method returns the current node. */
function getCurrentNode(pos) {

	var dm = fieldRoute.d;

	//get the max probl node
	var maxProb = 0;
	var maxNode;

	var d,lm,l,nm,n;
	for(var dKey in dm) {
		d = dm[dKey];
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			nm = l.n;
			for(var nKey in nm) {
				n = nm[nKey];
				if(n.evolvedProb > maxProb) {
					maxProb = n.evolvedProb;
					maxNode = n;
				}
			}
		}
	}

	//return the max probability node, in an array
	return maxNode;
}


//===================================================
// Feed forward
//===================================================

/** This method loads the probability for the user being at each node for
 * a given measurement. It combines a probability distribution function (below) with
 * a chance the distribution is wrong and the user is placed uniformly
 * on the map. */
function loadMeasProb(pos) {
	var dm = fieldRoute.d;
	var d;
	var lm;
	var l;
	var nm;
	var n;
	var metersPerMap;
	var totalProbability = 0;

	//get the measurement probability for each node based on a gaussian
	for(var dKey in dm) {
		d = dm[dKey];
		metersPerMap = d.s;
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			nm = l.n;
			for(var nKey in nm) {
				n = nm[nKey];
				setMeasProb(n,metersPerMap,pos);
				totalProbability += n.measProb;
			}
		}
	}

	//renormalize with added uncertainty
	var multiplier = (1 - MEAS_PROB_OFFSET) / totalProbability;
	var offset = MEAS_PROB_OFFSET / numNodes;
	for(var dKey in dm) {
		d = dm[dKey];
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			nm = l.n;
			for(var nKey in nm) {
				//get corrected prob
				n = nm[nKey];
				n.measProb = multiplier * n.measProb + offset;
			}
		}
	}
}

/** This method sets the unnormalized measurement probability based on the difference in
 * distance based a pure gaussian. This should be normalized and updated
 * elsewhere to account for bad measurements. */
function setMeasProb(n,metersPerMap,pos) {
	if(n.lid == pos.lid) {
		var distMeters = getDistMeters(n.mx,n.my,pos.mx,pos.my,metersPerMap);
		n.measProb = Math.exp(-Math.pow(distMeters/pos.r,2)/2);
	}
	else {
		n.measProb = 0;
	}
}

/**
 * This method evolves the probability states for the nodes, according to
 * an assumed forward motion.
 *
 * Feed forward Logic:
 *
 * To feed forward an amount of time, it is assumed the user
 * has an equal probability of traveling any speed between 0 and
 * MAX_FEEDFORWARD_MET-PER_SEC. Also, it is assume the user travels along
 * the recommended path. Finally, there is a probability that the user instaed appears
 * magically at any other position on the map.
 *
 * Probabilities are redistributed from points along a link to the points at the
 * two ends, according to the progress along the link.
 *
 * The input from this method is a node and a time span. Then the field route
 * evolved probability is updated. Note that it should be cleared before
 * processing any nodes with this function. */
function loadFeedForwardProb(deltaTSec) {
	var dm = fieldRoute.d;

	//clear the old evolved prob
	var d,lm,l,nm,n;
	for(var dKey in dm) {
		d = dm[dKey];
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			nm = l.n;
			for(var nKey in nm) {
				n = nm[nKey];
				n.temp = 0;
			}
		}
	}

	//evolve each node
	for(var dKey in dm) {
		d = dm[dKey];
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			nm = l.n;
			for(var nKey in nm) {
				n = nm[nKey];
				feedNodeForward(n,deltaTSec);
			}
		}
	}

	//add the random jump probability if needed
	for(var dKey in dm) {
		d = dm[dKey];
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			nm = l.n;
			for(var nKey in nm) {
				n = nm[nKey];
				n.evolvedProb = n.temp * (1 - EVOLVE_JUMP_PROB) + EVOLVE_JUMP_PROB / numNodes;
			}
		}
	}
}

/** This feeds forward uniformly across forward links. */
function feedNodeForward(node, deltaTSec) {
	//get the end distance
	var maxDist = deltaTSec * MAX_FEEDFORWARD_MET_PER_SEC;
	var startProb = node.evolvedProb;

	//handle the case of 0 distance traveled
	if(maxDist <= 0) {
		node.temp = startProb;
		return;
	}

	//special treatment if we have less than this distance to go
	//we don't want extra probability to accumulate at the end
	//if the person is still routing the presumably aren't there yet
	//so we will distribute the probability equally to the end, rather than
	//distributing extra there.
	if(maxDist > node.dm) maxDist = node.dm;

	var currentNode = node;
	var nextNode;
	var remainingDist = maxDist;
	var nl;
	while(true) {
		if(!currentNode.nn) {
			//we shouldn't get here
			break;
		}
		nl = currentNode.nl ? currentNode.nl : currentNode.lid;
		nextNode = lookupNode(currentNode.nn,nl);
		if(!nextNode) {
			//we shouldn't get here
			break;
		}

		var linkLength = node.dm - nextNode.dm;
		var midTraveledFrac;
		var linkDistTraveled;
		if(linkLength <= remainingDist) {
			midTraveledFrac = .5;
			linkDistTraveled = linkLength;
			remainingDist -= linkLength;
		}
		else {
			midTraveledFrac = remainingDist / (2 * linkLength);
			linkDistTraveled = remainingDist;
			remainingDist = 0;
		}

		//disribute this probability between the end nodes of the link
		currentNode.temp += startProb * (1 - midTraveledFrac) * (linkDistTraveled /maxDist);
		nextNode.temp += startProb * (midTraveledFrac) * (linkDistTraveled /maxDist);

		if(remainingDist <= 0) break;

		currentNode = nextNode;
	}

}

/** This method merges the measured probability with the previous
 * evolved probability.
 *
 * A problem with this method is it doesn't weight the effective size of
 * a node. Some nodes recieve data from much more area than others.
 * */
function doMeasUpdate() {
	//merge each node
	var totalProb = 0
	var dm = fieldRoute.d;
	var d,lm,l,nm,n;
	for(var dKey in dm) {
		d = dm[dKey];
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			nm = l.n;
			for(var nKey in nm) {
				n = nm[nKey];
				n.evolvedProb *= n.measProb;
				totalProb += n.evolvedProb;
			}
		}
	}

	//renormalize
	for(var dKey in dm) {
		d = dm[dKey];
		lm = d.lvl;
		for(var lKey in lm) {
			l = lm[lKey];
			nm = l.n;
			for(var nKey in nm) {
				n = nm[nKey];
				n.evolvedProb /= totalProb;
			}
		}
	}
}
