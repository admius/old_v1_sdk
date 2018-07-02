/** MapEvent Class: This is the custom map event handler to allow for listeners to react to events triggered within the SDK 
 * @class This class that manages the core map event system
 * */
micello.maps.MapEvent = function(mapControl) {
    this.events = [];
    this.mapControl = mapControl;
}

/**
 * This sets an event listener for the named event
 * @param {string} eventName The named event to listen for
 * @param {string} callback The custom callback to fire when named event is dispatched
 */
micello.maps.MapEvent.prototype.addListener = function(eventName, callback) {
    
    if(!callback) { return; }
    
    if( !this.events[eventName] ) {
        this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    
}

/**
 * This removes an event listener from the events queue
 * @param {string} eventName The named event to remove from
 * @param {string} callback the custom callback to remove
 */
micello.maps.MapEvent.prototype.removeListener = function(eventName, callback) {
    var updatedEvents = [];
    var c = null;
    for( i = 0; i < this.events[eventName].length; i++ ) {
        if( callback !== this.events[eventName][i] ) {
            c = this.events[eventName][i];
            updatedEvents[eventName].push(c);
        }
    }
    this.events[eventName] = updatedEvents;
}

/**
 * This pushes the callback for named event to the top of the heap (fired first)
 * @param {string} eventName The named event to prioritize the callback within
 * @param {string} callback the custom callback to push to the top
 * @param {string} whereTo Either first or last
 * @private
 */
micello.maps.MapEvent.prototype.orderListener = function(eventName, callback, whereTo) {
    
    var updatedEvents = [];
    var c = null;
    var cToMove = null;
    
    /* Find the callback in question */
    for( i = 0; i < this.events[eventName].length; i++ ) {
        if( callback === this.events[eventName][i] ) {
            cToMove = this.events[eventName][i];
            break;
        }
    }
    
    if( whereTo == 'first' ) {
        /* Shove the prioritized callback in first */
        updatedEvents.push(cToMove);
    }
    
    /* Now reorganize */
    for( i = 0; i < this.events[eventName].length; i++ ) {
        if( callback !== this.events[eventName][i] ) {
            c = this.events[eventName][i];
            updatedEvents.push(c);
        }
    }
    
    if( whereTo == 'last' ) {
        /* Shove the prioritized callback in last */
        updatedEvents.push(cToMove);
    }
    
    this.events[eventName] = updatedEvents;
}

/**
 * This pushes the callback for named event to the top of the heap (fired first)
 * @param {string} eventName The named event to prioritize the callback within
 * @param {string} callback The custom callback to push to the top
 */
micello.maps.MapEvent.prototype.priorityFirstListener = function(eventName, callback) {
    this.orderListener(eventName, callback, 'first');
}

/**
 * This pushes the callback for named event to the bottom of the heap (fired last)
 * @param {string} eventName The named event to prioritize the callback within
 * @param {string} callback The custom callback to push to the bottom
 */
micello.maps.MapEvent.prototype.priorityLastListener = function(eventName, callback) {
    this.orderListener(eventName, callback, 'last');
}

/**
 * This dispatches the event to be consumed by all listeners. The callbacks are called with an event object that includes any custom args sent by the 
 * dispatching class as well as standard properties including the event name
 * @param {string} eventName The named event to dispatch
 * @param {object} args the argument object to send out during the dispatch
 */
micello.maps.MapEvent.prototype.dispatchEvent = function(eventName, args) {
    
    var callback = null;
    
    if( !args ) {
       args = {};
    }
    if( !this.events[eventName] ) {
        return;
    }
    for( i = 0; i < this.events[eventName].length; i++ ) {
        callback = this.events[eventName][i];
        if( callback ) {
            callback.call(null, args);
        }
    }
}