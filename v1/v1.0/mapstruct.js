// THIS FILE SHOULD NOT BE IMPORTED BY ANY WEB PAGE!
// THESE OBJECTS ARE STRICTLY MEANT FOR DOCUMENTATION

if(!micello) micello = {};

/**
 * @namespace This namespace contains map structure definitions. These structure should not be
 * instantiated from their constructor. They should be created as standard objects with the
 * desired values populated.
 */
micello.mapstruct = {};

//=======================================
// Community Object
//=======================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the map data for a community object. A community may contain
 * one of more maps, or drawings.
 */
micello.mapstruct.Community = function() {}

/** This is the ID for the community.
 *  @type integer */
micello.mapstruct.Community.prototype.id = undefined;

/** This is the name for the community.
 *  @type String */
micello.mapstruct.Community.prototype.nm = undefined;

/** This is the version for the community.
 *  @type integer */
micello.mapstruct.Community.prototype.v = undefined;

/** This is an array of drawings for the community. There should be an entry for each drawing
 * containing the ID and the name. However, other data may or may not be loaded for a given drawing.
 * To determine if the drawing is fully loaded, check the presence of the level array. If the level
 * array is present, the drawing is fully loaded.
 *  @type Array:Drawing */
micello.mapstruct.Community.prototype.d = undefined;

//====================================
// Drawing
//====================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the map data for a drawing object. A drawing is the
 * name used for an individual map. The map may contain one or more levels, called drawing levels.
 */
micello.mapstruct.Drawing = function() {}

//------------
// Always loaded
//------------

/** This is the ID of the drawing object.
 *  @type integer */
micello.mapstruct.Drawing.prototype.id = undefined;

/** This is the name of the drawing.
 *  @type String */
micello.mapstruct.Drawing.prototype.nm = undefined;

/** This value indicates if the drawing is the root drawing in the community. The root drawing is the
 * highest level drawing in the community.
 *  @type boolean */
micello.mapstruct.Drawing.prototype.r = undefined;

//--------------
// Only present when fully loaded
//--------------

///** This is the version of the drawing
// *  @type integer */
//micello.mapstruct.Drawing.prototype.v = undefined;

/** This is the map type for the drawing.
 *  @type String */
micello.mapstruct.Drawing.prototype.mt = undefined;

/** This is the affine transformation to convert from map coordinates to longitude,latitude.
 *  @type Array:decimal[6] */
micello.mapstruct.Drawing.prototype.t = undefined;

/** This is the width of the map in map coordinates. These are equivelent to pixels if the
 *zoom scale is 1.
 *  @type decimal */
micello.mapstruct.Drawing.prototype.w = undefined;

/** This is the height of the map in map coordinates. These are equivelent to pixels if the
 *zoom scale is 1.
 *  @type decimal */
micello.mapstruct.Drawing.prototype.h = undefined;

/** This is the array of drawing levels in this drawing.
 *  @type Array:DrawingLevel */
micello.mapstruct.Drawing.prototype.l = undefined;

/** This is the angle of the vertical direction in map coordinates relative to true north, in radians.
 *  @type decimal */
micello.mapstruct.Drawing.prototype.ar = undefined;

///** This is the ID for the geometry that should be selected when this drawing is loaded.
// *  @type integer */
//micello.mapstruct.Drawing.prototype.sid = undefined;

///** This is the default initial view for this drawing. It is in the form of a view object
// *  @type View */
//micello.mapstruct.Drawing.prototype.v = undefined;

///** This is the language of the display text in this drawing object.
// *  @type String */
//micello.mapstruct.Drawing.prototype.ln = undefined;

//====================================
// Drawing Level
//====================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the map data for a drawing level object. A drawing level
 * represents a level or floor of an individual map, or drawing.
 */
micello.mapstruct.DrawingLevel = function() {}

/** This is the ID of the drawing level.
 *  @type integer */
micello.mapstruct.DrawingLevel.prototype.id = undefined;

/** This is the zlevel value for a floor. It represents a vertical ordering, or a discrete
 * version of the z coordinate. Typically, the z value for the ground level is 0, whereas the name
 * of that level may be something different, such as "1" as it is often called in the US.
 *  @type integer */
micello.mapstruct.DrawingLevel.prototype.z = undefined;

/** This is the display name for the level. This is the value for the level which should be displayed
 * to the end user.
 *  @type String */
micello.mapstruct.DrawingLevel.prototype.nm = undefined;

/** This is the array of geometry objects on the level. This is used either for a map json or
 * in a map annotation representing geometry overlays. Geometry overlay objects are identical to
 * geometry in the map except they are added on at runtime to the map.
 *  @type Array:Geometry */
micello.mapstruct.DrawingLevel.prototype.g = undefined;

/** This is an array of inlay objects. This is used only in map annotationa and not in the map json
 * itself. A map annotation consists of inlays, geometry overlays and marker overlays. Inlays are
 * modifications to existing geometry on the map.
 *  @type Array:Geometry */
micello.mapstruct.DrawingLevel.prototype.i = undefined;

/** This is an array of marker overlay objects. This is used only in map annotationa and not in the map json
 * itself. A map annotation consists of inlays, geometry overlays and marker overlays. Marker overlays
 * are distinguished form geometry overlays in that marker overlays to not scale with the map. A marker is
 * tied to a single point on the map, and other ponits on the marker move relative to the map as the map scales.
 *  @type Array:Geometry */
micello.mapstruct.DrawingLevel.prototype.m = undefined;

//====================================
// Geometry
//====================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the map data for a geometry object.
 */
micello.mapstruct.Geometry = function() {}

//id params

/** This is the id for the geometry object.
 *  @type integer */
micello.mapstruct.Geometry.prototype.id = undefined;

/** This is a groupid id for the geometry. It is true if the geometry is grouped with other
 * geometry. In this case, all geometry in the group should be treated as a common entity, such as
 * a department store that spans multiple levels of a mall. If one of these items is selected or
 * highlighted, then all should be selected/highlighted. If the geometry is not in a group, this
 * variable will likely not be present.
 *  @type integer */
micello.mapstruct.Geometry.prototype.gid = undefined;

/** This flag evaluates to true if this geomtry is the root geometry of the current level.
 * @type boolean */
micello.mapstruct.Geometry.prototype.r = undefined;

//geom params

/** This is the shape type for the object, which tells the type of shape used for this
 * geometry. This determines for format of the shp object. See the constants definitions for
 * allowed values.
 *  @type integer */
micello.mapstruct.Geometry.prototype.st = undefined;

/** This is the geometry type, which tells how the shape is used to portray the geometry.
 * For example the shape is a filled area, a linear object or a linear area object where the area
 * is defined by the stroke of the shape. See the constants definitions for allowed values.
 *  @type integer */
micello.mapstruct.Geometry.prototype.gt = undefined;

/** This is the coordinates of the object, in a format appropriate for the shape type.
 *  @type shape type specific */
micello.mapstruct.Geometry.prototype.shp = undefined;

/** This variable is used for linear areas. It is the stroke width in map coordinates.
 *  @type decimal */
micello.mapstruct.Geometry.prototype.gw = undefined;

/** This is a representation of the bounding box in the format [[xmin,ymin],[xmax,ymax]]. This
 * encompasses the area rendered by the geometry. It may include area for the label. This value
 * will be filled by the application if it is missing when the parameter is first needed. Note that
 * if the geometry or label is updated by an overlay this parameter will not be recalcualted unless
 * it is manually cleared by the overlay.
 *  @type MinMax */
micello.mapstruct.Geometry.prototype.mm = undefined;

//style params

/** This is the style that should be used to render the object. (t = "type")
 *  @type String */
micello.mapstruct.Geometry.prototype.t = undefined;

/** This is a style object that should be used to render the object. ("os" = override style)
 *  @type Style */
micello.mapstruct.Geometry.prototype.os = undefined;

//label params

/** This is the label area for the object. The ordering of the array is
 * X, Y, Width, Height, Angle in radians.
 *  @type Array:decimal[5] */
micello.mapstruct.Geometry.prototype.l = undefined;

/** This flag indicates the label is external to the geometry. If this is present, the
 *label geometry should also be used for a hit check.
 *  @type boolean */
micello.mapstruct.Geometry.prototype.el = undefined;

/** This is the label type for the object. See the constant definitions for allowed values.
 *  @type integer */
micello.mapstruct.Geometry.prototype.lt = undefined;

/** This is the label reference. It is nominally a String that tells the text for the label,
 * the name of the icon or the url of the image. In the case where the label is of type geometry,
 * then an explicity geometry value is used.
 *  @type String, nominally */
micello.mapstruct.Geometry.prototype.lr = undefined;

//data params

/** This is a flag that indicates a popup should be shown for the object.
 *  @type boolean */
micello.mapstruct.Geometry.prototype.p = undefined;

/** This is popup content. If this is present, this data defines the popup format. A popup
 * will be shown regardless of whether or not the I flag is present.
 *  @type PopupInfo */
micello.mapstruct.Geometry.prototype.pdat = undefined;

/** This is the name to be associated with the object.
 *  @type String */
micello.mapstruct.Geometry.prototype.nm = undefined;

/** This flag indicates there is added info associated with this object. If the p flag is
 * not present, info sillbe shown when an item is selected. If the p flag is present, this
 * flag means an info option for the popup will be present.
 *  @type boolean */
micello.mapstruct.Geometry.prototype.i = undefined;

/** This is info content. If this is present, this will be used as HTML content for the info
 * page, regardless of whether or not the p flag is present.
 *  @type String */
micello.mapstruct.Geometry.prototype.idat = undefined;

/** Unknown flag - this flag indicated the content of this object are unknown. It is a prompt that
 * user input is desired.
 *  @type boolean */
micello.mapstruct.Geometry.prototype.u = undefined;

//hierarchy params

/** This indicates there is an embedded community for this map. The user can navigate inside
 * of the object by opening the community with this ID and the drawing given by the did value.
 *  @type integer */
micello.mapstruct.Geometry.prototype.cid = undefined;

/** This indicates there is an embedded map for this community. The user can navigate inside
 * of the object by opening the drawing with this id. If there is also a cid value the community for the
 * map is different from the current community.
 *  @type integer */
micello.mapstruct.Geometry.prototype.did = undefined;

/** If there is an embedded map and this value is present, the drawing level with this id should be
 * shown when the user opens the drawing. Otherwise, the default level should be choosen.
 *  @type integer */
micello.mapstruct.Geometry.prototype.mlid = undefined;

/** This flag indicates an embedded drawing can be safely drawn inline with the parent drawing
 * without changing any level structure.
 *  @type boolean */
micello.mapstruct.Geometry.prototype.inl = undefined;

//====================================
// Theme
//====================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the map data for a theme object.
 */
micello.mapstruct.Theme = function() {}

/** This is the id for the geometry object.
 *  @type integer */
micello.mapstruct.Theme.prototype.id = undefined;

/** This is the family name for the theme. It is used to link different themes of a common
 * style for different types of maps.
 *  @type String */
micello.mapstruct.Theme.prototype.f = undefined;

/** This is the name for the theme.
 *  @type String */
micello.mapstruct.Theme.prototype.nm = undefined;

/** These are the map type for this theme. It is a json object with a list of map type names and an integer value for
 * whether or not they are supported. non-zero meaens supported. In practice, only map types that are supported are listed.
 *  @type String */
micello.mapstruct.Theme.prototype.tts = undefined;

/** This is the version for the theme.
 *  @type String */
micello.mapstruct.Theme.prototype.v = undefined;

/** This is a map of style objects, where the key for the map is the style name.
 *  @type Map:Style */
micello.mapstruct.Theme.prototype.s = undefined;

/** This is a map of icon objects, where the key for the map is the icon name.
 *  @type Map:Icon */
micello.mapstruct.Theme.prototype.ic = undefined;

/** This is a map of marker objects, where the key for the map is the marker name.
 *  @type Map:MarkerIcon*/
micello.mapstruct.Theme.prototype.m = undefined;

//====================================
// Style
//====================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the map data for a style object.
 */
micello.mapstruct.Style = function() {}

/** This is the main color. This corresponds to the fill color for an area object
 * and the stroke color for a line or a linear area. If the color is missing it should
 * be treated as transparent.
 *  @type String */
micello.mapstruct.Style.prototype.m = undefined;

/** This is the outline color. If the color is missing there should be no outline. This corresponds to
 * the stroke color for an area object. For a line or a linear area, the outline is currently not
 * implemented.
 *  @type String */
micello.mapstruct.Style.prototype.o = undefined;

/** This is the text color. If the color is missing it should be treated as transparent.
 *  @type String */
micello.mapstruct.Style.prototype.t = undefined;

/** This is the outline width. If the value is missing it should be treated as 0.
 *  @type String */
micello.mapstruct.Style.prototype.w = undefined;

//====================================
// Icon
//====================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the map data for an icon object.
 */
micello.mapstruct.Icon = function() {}

/** This is the height of the icon.
 *  @type decimal */
micello.mapstruct.Icon.prototype.h = undefined;

/** This is the width of the icon.
 *  @type decimal */
micello.mapstruct.Icon.prototype.w = undefined;

/** This is the array of geometry objects that compose this icon.
 *  @type Array:Geometry */
micello.mapstruct.Icon.prototype.g = undefined;


//====================================
// MapAnnotation
//====================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the data for a marker overlay.
 */
micello.mapstruct.MarkerOverlay = function() {}

/** This is the level on which the marker overlay should be shown.
 *  @type Integer */
micello.mapstruct.MarkerOverlay.prototype.lid = undefined;

/** This is the CSS zIndex used to display the marker.
 *  @type Integer */
micello.mapstruct.MarkerOverlay.prototype.zi = undefined;

/** This is the marker type. See the constants for the allowed values.
 *  @type Integer */
micello.mapstruct.MarkerOverlay.prototype.mt = undefined;

/** This is the marker reference, where the data depends on the type of marker
 *  @type Variable */
micello.mapstruct.MarkerOverlay.prototype.mr = undefined;

/** This is the id for geometry on which this marker will be placed. For the placement
 * to work, the geometry must have a label center point defined, which is used to anchor
 * the marker. If the geometry id is set, the values for mx, my and lid will be set when the
 * marker is added to the MapData.
 *  @type decimal */
micello.mapstruct.MarkerOverlay.prototype.id = undefined;

/** This is the marker X coordinate in map coordinates.
 *  @type decimal */
micello.mapstruct.MarkerOverlay.prototype.mx = undefined;

/** This is the marker Y coordiante in map coordinates.
 *  @type decimal */
micello.mapstruct.MarkerOverlay.prototype.my = undefined;

/** This is reserved for internal use. */
micello.mapstruct.MarkerOverlay.prototype.ox = undefined;

/** This is reserved for internal use. */
micello.mapstruct.MarkerOverlay.prototype.oy = undefined;

/** This is the group name in which this overlay belongs. Setting a name allows
 * a group of overlays to be removed together.
 *  @type String */
micello.mapstruct.MarkerOverlay.prototype.anm = undefined;

/** This is reserved for internal use. */
micello.mapstruct.MarkerOverlay.prototype.cx = undefined;

/** This is reserved for internal use. */
micello.mapstruct.MarkerOverlay.prototype.cy = undefined;

/** This is reserved for internal use. */
micello.mapstruct.MarkerOverlay.prototype.x = undefined;

/** This is reserved for internal use. */
micello.mapstruct.MarkerOverlay.prototype.element = undefined;

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the data for a geometry overlay. It has some values
 * specific to the geometry overlay and can also take any parameter associated with geometry.
 */
micello.mapstruct.GeometryOverlay = function() {}

/** This is the id of the overlay. It should not be assigend manually. It will
 * be assigned by the map control.
 *  @type Integer */
micello.mapstruct.GeometryOverlay.prototype.id = undefined;

/** This is the level on which the geometry overlay should be shown.
 *  @type Integer */
micello.mapstruct.GeometryOverlay.prototype.lid = undefined;

/** This is the zIndex used to display the overlay. The base map is given a zIndex of 0.
 * This value can not be used by an overlay. If it is, it will be replaced with a different value.
 * The value of this parameters indicates the order in which the objects will be drawn. If an overlay
 * has a zIndex less that 0, it will be drawn before the map. Objects of the same index are typically drawing
 * in the order they were added to the map, but the order is not stricly defined.
 *  @type Integer */
micello.mapstruct.GeometryOverlay.prototype.zi = undefined;

/** This is the group name in which this overlay belongs. Setting a name allows
 * a group of overlays and inlays to be removed together.
 *  @type String */
micello.mapstruct.GeometryOverlay.prototype.anm = undefined;

/** This parameter is used internally to indicate the marker has not been associated
 * with the map, presumably because the drawing has not yet been loaded.
 *  @type boolean
 *  @private */
micello.mapstruct.GeometryOverlay.prototype.x = undefined;

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the data for an inlay. It has some values
 * specific to the inlay and it can also take any parameter associated with geometry, which will
 * in turn be used to modify that parameter on the target geometry.
 */
micello.mapstruct.Inlay = function() {}

/** This is the id of the geometry which the inlay will modify.
 *  @type Integer */
micello.mapstruct.Inlay.prototype.id = undefined;

/** This is the zIndex used to display the inlay. The inlay will always be placed on top of the
 * base map object. The zIndex is strictly used for relative ordering of the inlays. Inlays of the same
 * index are typically drawing in the order they were added to the map, but the order is not stricly defined.
 *  @type Integer */
micello.mapstruct.Inlay.prototype.zi = undefined;

/** This is the group name in which this overlay belongs. Setting a name allows
 * a group of overlays and inlays to be removed together.
 *  @type String */
micello.mapstruct.Inlay.prototype.anm = undefined;

/** This parameter is used internally to indicate the marker has not been associated
 * with the map, presumably because the drawing has not yet been loaded.
 *  @type boolean
 *  @private */
micello.mapstruct.Inlay.prototype.x = undefined;

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the map data for a MarkerIcon object.
 */
micello.mapstruct.MarkerIcon = function() {}

/** This is the url for the icon. It should be an image.
 *  @type String */
micello.mapstruct.MarkerIcon.prototype.src = undefined;

/** This is x offset for the icon, in icon coordinates. The icon will be tied to the map at this point.
 *  @type Decimal */
micello.mapstruct.MarkerIcon.prototype.ox = undefined;

/** This is y offset for the icon, in icon coordinates. The icon will be tied to the map at this point.
 *  @type Decimal */
micello.mapstruct.MarkerIcon.prototype.oy = undefined;

//====================================
// PopupInfo
//====================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the map data for a PopupInfo object.
 */
micello.mapstruct.PopupInfo = function() {}

/** This is the type of the popup. See the the enumeration micello.maps.popuptype for the allowed values.
 *  @type integer*/
micello.mapstruct.PopupInfo.prototype.type = undefined;

/** This is the map X coordinateon which the popup should be anchored.
 *  @type integer*/
micello.mapstruct.PopupInfo.prototype.mapX = undefined;

/** This is the map Y coordinateon which the popup should be anchored.
 *  @type integer*/
micello.mapstruct.PopupInfo.prototype.mapY = undefined;

/** This is the title for a menu type popup.
 *  @type String */
micello.mapstruct.PopupInfo.prototype.title = undefined;

/** This is the array of commands for a menu type popup
 *  @type Array:PopupCommand */
micello.mapstruct.PopupInfo.prototype.commands = undefined;

/** This field is the html content for an infowindow type popup.
 *  @type String */
micello.mapstruct.PopupInfo.prototype.html = undefined;

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds the command data for a menu popup.
 */
micello.mapstruct.PopupCommand = function() {}

/** This is the display text for the menu entry for this command..
 *  @type integer*/
micello.mapstruct.PopupCommand.prototype.name = undefined;

/** This is the callback function for this command. */
micello.mapstruct.PopupCommand.prototype.func = function(){};

//====================================
// View
//====================================

/**
 * This constructor should not be used. This object should be instantiated as a plain object.
 *
 * @class This is the structure that holds a view object.
 */
micello.mapstruct.View = function() {}

/** This is the center X coordinate for the view.
 *  @type decimal*/
micello.mapstruct.View.prototype.cx = undefined;

/** This is the center Y coordinate for the view.
 *  @type decimal*/
micello.mapstruct.View.prototype.cy = undefined;

/** This is the width for the view.
 *  @type decimal*/
micello.mapstruct.View.prototype.w = undefined;

/** This is the height for the view.
 *  @type decimal*/
micello.mapstruct.View.prototype.h = undefined;