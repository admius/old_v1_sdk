// THIS FILE SHOULD BE INCLUDED IN THE MAP STRUCT DOCUMENTATION.
//IT ALSO SHOULD BE INCLUDED IN THE IMPORTED JSON FILES ON WEB PAGES.

if(!micello) micello = {};
if(!micello.maps) micello.mapstruct = {};

/** @namespace This the namespace for the enumeration of shape types. */
micello.maps.shapetype = {};
/** This is the shape type value for no shape. The value is 0.*/
micello.maps.shapetype.NONE = 0;
/** This is the shape type value for a path. The path consists of an array of instructions, each of which consists of
 * an instruction type (such as "LINE_TO") and a set of coordinates for the instruction. In the case of a LINE_TO
 * instruction there are two coordinates given, the destination map X and map Y values. The enumeration
 * micello.maps.path gives the supported instruction types and the format for the associated instructions. THe value is 2.*/
micello.maps.shapetype.PATH = 2;

/** @namespace This the namespace for the enumeration of geometry types. */
micello.maps.geomtype = {};
/** This is the geometry type value for no shape rendered. The value is 0.*/
micello.maps.geomtype.NONE = 0;
/** This is the geometry type value for a line. The color of the line is given by the "main" color of the
 * style entry used to render the object. The line width is given by the "width" parameter of the style. This width
 * is a fixed width independant of scale and does not correspond to a phyiscal width. To represent a line with a physical
 * width use the LINEAR_AREA type. The value is 1.*/
micello.maps.geomtype.LINE = 1;
/** This is the geometry type value for an area. The fill color of the area is given by the "main" color of the 
 * style entry used to render the object. The outline color is given by the "outline" color in the style, and the width
 * of the outline is given by the "width" parameter of the style. The value is 2. */
micello.maps.geomtype.AREA = 2;
/** This is the geometry type value for a linear area. It is rendered as a line with a width given by the parameter in the
 * geometry object "gw". This corresponds to a physical width, as opposed to a render width given by the line object. The parameter
 * "gw" is given in map coordinate units. The value is 3. */
micello.maps.geomtype.LINEAR_AREA = 3;

/** @namespace This the namespace for the enumeration of path instructions. */
micello.maps.path = {};
/** This is the "move to" path instruction, which is an array with three entries, the instruction value,
 * the map X cooridnate and the map Y coordinate. The value is 0.
 * An example instruction is: [0,234,319].  */
micello.maps.path.MOVE_TO = 0;
/** This is the "line to" path instruction, which is an array with three entries, the instruction value,
 * the destination map X cooridnate and the destination map Y coordinate. The value is 1.
 * An example instruction is: [1,284,319]. */
micello.maps.path.LINE_TO = 1;
/** This is the "quad to" path instruction, which is an array with five entries, the instruction value,
 * the map X coordinate of the control point, the map Y coordinate of the control point,
 * the map X coordinate of the destination point, and the map Y coordinate of the destination point. The value is 2.
 * An example instruction is: [2,320,340,350,350]. */
micello.maps.path.QUAD_TO = 2;
/** This is the "cube to", or "curve to", path instruction, which is an array with seven entries, the instruction value,
 * the map X coordinate of the for control point 1, the map Y coordinate of the control point 1,
 * the map X coordinate of the for control point 2, the map Y coordinate of the control point 2,
 * the map X coordinate of the destination point, and the map Y coordinate of the destination point. The value is 3.
 * An example instruction is: [3,320,340,340,345,350,350]. */
micello.maps.path.CUBE_TO = 3;
/** This is the "close" path instruction. It is an array with one entry, the instruction value. The value is 4.
 * An example instruction is: [4]. */
micello.maps.path.CLOSE = 4;

/** @namespace This the namespace for the enumeration of label types. */
micello.maps.labeltype = {};
/** This is the label type none. The value is 0. */
micello.maps.labeltype.NONE = 0;
/** This is the label type text. For this label type, the label reference is the text string that should be used
 *as a label. The value is 1. */
micello.maps.labeltype.TEXT = 1;
/** This is the label type icon. For this label type, the label reference is the named icon from the theme file that should
 * be used as a label. The icon is sized to best fit the label area without distortion. The value is 2. */
micello.maps.labeltype.ICON = 2;
/** This is the label type image. For this label type, the label reference is the URL for the image to be used as a label.
 * The image is sized to best fit the label area without distortion. The value is 3. */
micello.maps.labeltype.IMAGE = 3;
/** This is the label type geometry. For this label type, the label reference is an Icon structure that will be used for the
 * label. The icon is sized to best with the label area without distortion. The value is 4. */
micello.maps.labeltype.GEOM = 4;

/** @namespace This the namespace for the enumeration of marker types. */
micello.maps.markertype = {};
/** This is the marker type none. The value is 0. */
micello.maps.markertype.NONE = 0;
/** This is the marker type for a marker looked up in the theme. For this marker type, the marker reference should be the
 * name of the marker to lookup from the theme file. The value is 1. */
micello.maps.markertype.NAMED = 1;
/** This is the marker type image. For this marker type the marker reference should be a MarkerIcon structure for the marker.
 * The value is 2. */
micello.maps.markertype.IMAGE = 2;

/** @namespace This the namespace for the enumeration of popup types. */
micello.maps.popuptype= {};
/** This is the type value used for a menu popup. The value is 1. */
micello.maps.popuptype.MENU = 1 ;
/** This is the type value used for a infowindo popup. The value is 2. */
micello.maps.popuptype.INFOWINDOW = 2;

/** @namespace This the namespace for entry types in the info request. */
micello.maps.infoentrytype = {};
/** This is the type value used for a phone number. The value is 1. */
micello.maps.infoentrytype.PHONE = 1;
/** This is the type value used for an emnail address. The value is 2. */
micello.maps.infoentrytype.EMAIL = 2;
/** This is the type value used for a web url. The value is 3. */
micello.maps.infoentrytype.URL = 3;
/** This is the type value used for a postal address. The value is 4. */
micello.maps.infoentrytype.ADDRESS = 4;
/** This is the type value used for palin text or an otherwise unspecified entry. The value is 5. */
micello.maps.infoentrytype.GENERAL = 5;