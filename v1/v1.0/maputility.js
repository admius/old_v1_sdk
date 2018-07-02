micello.util = {};

/**
 * This resolves an ID -- first checking the DOM to see if this is in use
 * already and if so, append a counter number kept by a static array in this method
 * @param {id} the ID resolved to an unused ID name
 * @private
 */
micello.util.resolveId = function (id) {
    
    var checkId = null;
    var exists = null;
    var done = false;
    var cnt = 0;
    while ( !done ) {

        checkId = this.buildId(cnt, id);
        exists = document.getElementById(checkId);
        if( !exists ) { break; }
        cnt++;
    }
    return checkId;
}

/**
 * This builds the selector ID in the incremental style required
 * @param {mn} The arbitrary incremental number given
  *@param {id} The id to munge and return
  *@private
 */
micello.util.buildId = function (mn, id) {
    if( mn === 0 ) {
        return id;
    } else {
        return id+'-'+mn;
    }
}

/**
 * This traverses the DOM looking for elements to match the id given
 * @param {id} The id selector to look for
 *@private
 */
micello.util.countElement = function (id) {
    
    var checkId = null;
    var exists = null;
    var done = false;
    var cnt = 0;
    while ( !done ) {
        checkId = id;
        if( cnt > 0 ) {
            checkId = checkId+'-'+cnt;
        }
        exists = document.getElementById(checkId);
        if( !exists ) { break; } else { cnt++; }
        
    }
    return cnt;
}

/**
 * This adds a new element to the DOM in a structured manner
 * @param {id} The new selector ID to add
 * @param {tag} (optional) if other than a div, specify here
 *@private
 */
micello.util.addElem = function (id) {
    var tag;
    if( arguments[1] ) {
        tag = arguments[1];
    } else {
        tag = 'div';
    }

    var newEl = document.createElement(tag);
    if( id ) {
        newEl.setAttribute("id", micello.util.resolveId(id));
    }
    return newEl;
}

/**
 * This adds a class to an element if it is not already added to the element
 * @param {ele} The referenced element to work against
 * @param {cls} the mixed type class to add if not already added (can be a string or array)
 *@private
 */
micello.util.addClass = function (ele,cls) {
  var s = typeof cls;
  if (s !== 'object') {
      clsArr = [];
      clsArr = [cls];
      cls = clsArr;
  } 
  for( i=0; i<cls.length; i++ ) {
    if (!micello.util.hasClass(ele,cls)) ele.className += " "+cls[i];
  }
}

/**
 * This checks to see if an element already has a class
 * @param {ele} The referenced element to work against
 * @param {cssClass} the class to check
 *@private
 */
micello.util.hasClass = function (el, cssClass) {
    return el.className && new RegExp("(^|\\s)" + cssClass + "(\\s|$)").test(el.className);
}

/**
 * This removes a class from the referenced element if it exists
 * @param {ele} The referenced element to work against
 * @param {cssClass} the class to remove
 *@private
 */
micello.util.removeClass = function (ele,cls) {
    
        if (this.hasClass(ele,cls)) {
            var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
            ele.className=ele.className.replace(reg,'');
        }
}

/**
 * This applies the object of styles to the element sent in
 * @param {el} The referenced element to work against
 * @param {styles} the object of css props to add
 *@private
 */
micello.util.addCss = function (el, styles) {
    for (var prop in styles) {
        if (!styles.hasOwnProperty || styles.hasOwnProperty(prop)) {
            el.style[prop] = styles[prop];
        }
    }
    return el;
}

/**
 * This removes the array of styles to the element sent in
 * @param {el} The referenced element to work against
 * @param {styles} the array of css props to add
 *@private
 */
micello.util.removeCss = function (el, styles) {
    for (var prop in styles) {
        if (!styles.hasOwnProperty || styles.hasOwnProperty(prop)) {
            el.style.removeProperty(prop);
        }
    }
    return el;
}

/**
 * Universal way to check to see if an value appears in an array
 * @param {arr} The array
 * @param {val} the value to look for
 *@private
 */
micello.util.inArray = function (arr, val) { 
    for (i = 0; i < arr.length; i++) if (val == arr[i]) return true; return false; 
}

/**
 * Universal way to check to see if a hex value has the appriate characters
 * @param {hex} The hex code to check
 *@private
 */
micello.util.hexCheck = function (hex) {
    if( hex.charAt(0) != "#" ) {
        return "#"+hex;
    }
    return hex;
}

/**
 * Sniff and find the vendor prefixes used for this device / browser and return all possible permutations
 *@private
 */
micello.util.vendorPrefix = function () {
    
    var styles = window.getComputedStyle(document.documentElement, ''),
        pre = (Array.prototype.slice
          .call(styles)
          .join('') 
          .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1],
        dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
      return {
        dom: dom,
        lowercase: pre,
        css: '-' + pre + '-',
        js: pre[0].toUpperCase() + pre.substr(1)
      };
    
}