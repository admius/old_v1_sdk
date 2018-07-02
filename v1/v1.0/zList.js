/**
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


