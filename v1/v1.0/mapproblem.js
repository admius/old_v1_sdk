/**
 * @namespace This namespace provides functions to manage user input for map problems.
 * @private 
 */
micello.maps.mapproblem = {};

/** This method creates the html for a problem infowindow.
 *  @private */
micello.maps.mapproblem.getProblemReportHTML = function(mapControl, geom) {

	micello.maps.mapproblem.geom = geom;
	micello.maps.mapproblem.mapControl = mapControl;
        mapGUI = mapControl.getMapGUI();
        
        var mapproblem = document.createElement("div");
        mapproblem.setAttribute('id', 'mapproblem');
        
        mpTitle = document.createElement("div");
        mpTitle.setAttribute('id', 'mapproblem-title');
        mpTitle.innerHTML = "Report a Problem";
        mapproblem.appendChild(mpTitle);
        
        if((geom)&&(geom.nm)) {
            mpSubTitle = document.createElement("div");
            mpSubTitle.setAttribute('id', 'mapproblem-subtitle');
            mpSubTitle.innerHTML += geom.nm;
            mapproblem.appendChild(mpSubTitle);
        }
        
        mpDesc = document.createElement("div");
        mpDesc.setAttribute('id', 'mapproblem-desc');
        mpDesc.innerHTML = "Do you see something that requires attention? ";
        mapproblem.appendChild(mpDesc);
        
        mpTextArea = document.createElement("div");
        mpTextArea.setAttribute('id', 'mapproblem-textarea');
        mapproblem.appendChild(mpTextArea);
        
        mpTextAreaActual = document.createElement("textarea");
        mpTextAreaActual.setAttribute('id', '_prob_text');
        mpTextArea.appendChild(mpTextAreaActual);
        mpTextAreaActual.focus();
        
        mpButton = document.createElement("div");
        mpButton.setAttribute('id', 'mapproblem-button');
        mpButton.innerHTML = "Send Report";
        mpButton.onclick = function () { 
            micello.maps.mapproblem.submitAction();
        };
        mpButton.ontouchend = function () { 
            micello.maps.mapproblem.submitAction();
        }
        mpTextArea.appendChild(mpButton);
        
        mpTextAreaActual.onfocus = function () {
            mapGUI.KEY_COMMANDS = false;
        };
        mpTextAreaActual.onblur = function () {
            mapGUI.KEY_COMMANDS = true;
        };
    
	return mapproblem;
}

/** 
 *  @private */
micello.maps.mapproblem.submitAction = function () {
    
    var textArea = document.getElementById("_prob_text");
    var text = textArea.value;
    if( !text ) {
        mpDesc = document.getElementById("mapproblem-desc");
        mpDesc.innerHTML = "<span class=\"mapproblem-error\">Please enter a message</span>";
        return false;
    }
    mpButton = document.getElementById("mapproblem-button");
    mpButton.onclick = false;
    mpButton.ontouchend = false;
    mpButton.innerHTML = "Sending..."
    mpButton.style.backgroundColor = "#ccc";
    mpButton.style.color = "#fff";
    micello.maps.mapproblem.submitProblemInfo();
    
}

/** This method submits the current problem info.
 *  @private */
micello.maps.mapproblem.submitProblemInfo = function() {
    
	var textArea = document.getElementById("_prob_text");
	var text = textArea.value;

	var community = null;
	var geom = micello.maps.mapproblem.geom;
	community = micello.maps.mapproblem.mapControl.getMapData().getCommunity();
	
	micello.maps.request.userInput(text,geom,community);

	//micello.maps.mapproblem.mapControl.hideInfoWindow();
        
}

/** This method submits the current problem info.
 *  @private */
micello.maps.mapproblem.onSuccess = function() {
 
        var mapproblem = document.getElementById("mapproblem");
        mapproblem.innerHTML = "";
        mpTitle = document.createElement("div");
        mpTitle.setAttribute('id', 'mapproblem-title');
        mpTitle.innerHTML = "Thank You!";
        mapproblem.appendChild(mpTitle);
        
        mpDesc = document.createElement("div");
        mpDesc.setAttribute('id', 'mapproblem-desc');
        mpDesc.innerHTML = "We have received your map feedback and we will address your submission as soon as possible. ";
        mapproblem.appendChild(mpDesc);
        
        mpButton = document.createElement("div");
        mpButton.setAttribute('id', 'mapproblem-button-complete');
        mpButton.innerHTML = "I'm Done";
        mpButton.onclick = function () { 
            micello.maps.mapproblem.mapControl.hideInfoWindow();
        };
        mpButton.ontouchend = function () { 
            micello.maps.mapproblem.mapControl.hideInfoWindow();
        }
        mapproblem.appendChild(mpButton);
        
}


/** This method submits the current problem info.
 *  @private */
micello.maps.mapproblem.onFailure = function() {
 
        var mapproblem = document.getElementById("mapproblem");
        mapproblem.innerHTML = "";
        mpTitle = document.createElement("div");
        mpTitle.setAttribute('id', 'mapproblem-title');
        mpTitle.innerHTML = "We Had A Problem";
        mapproblem.appendChild(mpTitle);
        
        mpDesc = document.createElement("div");
        mpDesc.setAttribute('id', 'mapproblem-desc');
        mpDesc.innerHTML = "Your submission unfortunately did not go through successfully. Please try again.";
        mapproblem.appendChild(mpDesc);
}





