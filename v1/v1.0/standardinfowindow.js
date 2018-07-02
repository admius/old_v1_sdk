/**
 * This constructor makes a standard info window processing object..
 *
 * @class This classes manages the standard info window.
 */
micello.maps.StandardInfoWindow = function(mapControl) {
	this.mapControl = mapControl;
	this.geomDetail = null;
	this.entityDetails = {};
	this.table = null;
}


/** This method is the callback that converts retreived info to an infowindow
 * @private */
micello.maps.StandardInfoWindow.prototype.createInfoElement = function(geom, community) {

	var cid = community.id;
	var path = community.path;
	
	this.table = document.createElement("table");
	this.table.className = "infoTable";

	this.geomDetail = geom;
	this.entityDetails = {};

	var geomRequestList = [];
	var entityRequestList = [];

	if(geom.d == 1) {
		geomRequestList.push(geom.id);
	}
	
	//construct the entity list - detail and internal (or empty array
	var i;
	var entity;
	if(geom.me) {
		for(i = 0; i < geom.me.length; i++) {
			entity = geom.me[i];
			this.entityDetails[String.valueOf(entity.id)] = entity;
			if(entity.d == 1) {
				entityRequestList.push(entity.id);
			}
		}
	}

	//populate initial data based on non-detail objects
	this.populateData();
	
	var instance = this;
	if((geomRequestList.length > 0)||(entityRequestList > 0)) {
		var detailCallback = function(detail,data) {
			instance.updateDetail(detail,data);
		}
		var onError = function(msg) {
			micello.maps.onError(instance.mapEvent,msg,"micello.maps.StandardInfoWindow.createInfoElement >> onError");
		}
		micello.maps.request.loadDetail(cid,geomRequestList,entityRequestList,false,detailCallback,onError,path);
	}

	return this.table;
}

/** @private */
micello.maps.StandardInfoWindow.prototype.populateData = function() {

	//clear any old data
	while(this.table.rows.length) {
		this.table.deleteRow(0);
	}

	var eid;
	var entity;
	var props;
	var title;
	var label;

	var themeMap = this.mapControl.getThemeMap();
	
	//entity details
	if(this.entityDetails){
		for(eid in this.entityDetails) {
			entity = this.entityDetails[eid];
			props = entity.p;
			if(props) {
				label = themeMap.getEntityLabel(entity);
				if(label) {
					title = themeMap.convertLabelToText(label);
					if(title) {
						this.addObjectDetail(title,props);
					}
				}
			}
		}
	}
	
	//geom details
	label = themeMap.getGeomLabel(this.geomDetail);
	if(label) {
		title = themeMap.convertLabelToText(label);
		if(title) {
			props = this.geomDetail.p;
			this.addObjectDetail(title,props);
		}
	}
}

/** @private */
micello.maps.StandardInfoWindow.prototype.addObjectDetail = function(title,props) {
	var row;
	var rowCount = this.table.rows.length;
	var cell;
	
	//title
	if(title) {
		row = this.table.insertRow(rowCount++);
		cell = row.insertCell(0);
cell.className = "infoTitle";
		cell.colSpan = "2";
		cell.innerHTML = title;
	}
	
	//get body fields
	var displayInfo = [
		["description",null],
		["phone",this.getPhoneLink],
		["email",this.getEmailLink],
		["url",this.getHttpLink],
		["hours",null]
	]
	
	var i;
	var key;
	var value;
	var linkFunc;
	for(i = 0; i < displayInfo.length; i++) {
		key = displayInfo[i][0];
		linkFunc = displayInfo[i][1];
		value = props[key];
		if(value != null) {
			row = this.table.insertRow(rowCount++);
			this.addInfoRow(key,value,linkFunc,row);
		}
	}
}

/** @private */
micello.maps.StandardInfoWindow.prototype.addInfoRow = function(label,value,linkFunc,row) {
	var themeMap = this.mapControl.getThemeMap();
	var labelDisplay = themeMap.translate("info:" + label,label);
	var cell = row.insertCell(0);
	cell.className = "infoItemNm";
	cell.innerHTML = labelDisplay;
	cell = row.insertCell(1);
	cell.className = "infoItemVal";
	if(linkFunc) {
		var link = linkFunc(value);
		cell.appendChild(link);
	}
	else {
		cell.innerHTML = value;
	}
	
}

/** This processes the geometry detail response. 
** @private */
micello.maps.StandardInfoWindow.prototype.updateDetail = function(detailObject) {
	
	//make sure the table is active (and hasn't been removed)
	if(!this.table.parentNode) return;

	//unpack the details into our structure.
	var tag;
	var item;
	if(detailObject.gd) {
		for(tag in detailObject.gd) {
			item = detailObject.gd[tag];
			if(item.id == this.geomDetail.id) {
				this.geomDetail = item;
			}
		}
	}
	if(detailObject.ed) {
		for(tag in detailObject.ed) {
			item = detailObject.ed[tag];
			this.entityDetails[String.valueOf(item.id)] = item;
		}
	}
		
	//update the table
	this.populateData();
}

/** This utility method creates an HTML link element for a phone number. */
micello.maps.StandardInfoWindow.prototype.getPhoneLink = function(phone) {
	var ref = "tel:" + phone.replace(/[^\d]/g, "");
	return  micello.maps.getUrlLink(ref,phone,false);
}

/** This utility method creates an HTML link element for an email. */
micello.maps.StandardInfoWindow.prototype.getEmailLink = function(email) {
	var ref = "mailto:" + email
	return  micello.maps.getUrlLink(ref,email,false);
}

/** This utility method creates an HTML link element for a url. */
micello.maps.StandardInfoWindow.prototype.getHttpLink = function(url) {
	var start = url.substr(0,7).toLowerCase();
	if(start != "http://") url = "http://" + url;
	var text;
	text = (url.length > micello.maps.MapControl.MAX_URL_LENGTH) ? "<em>click to open</em>" : url;
	return  micello.maps.getUrlLink(url,text,true);
}

// private

/** This methods creates an HTML link for different types of urls.
 * @private */
micello.maps.getUrlLink = function(url,innerHTML,newWindow) {
	var link = document.createElement("a");
	link.href = url;
	if(newWindow) link.target="_blank";
	link.innerHTML = innerHTML;
	return link;
}



