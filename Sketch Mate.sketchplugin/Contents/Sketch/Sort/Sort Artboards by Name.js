// (ctrl option command s)

/**
 * This plugin can sort layers by positions, layer name or text value
 *
 * Florian Schulz Copyright 2014, MIT License
 */


@import '../inventory.js'

var doc;
var selection;

// Run
var onRun = function (context) {

var artboards = false;
var keepTop = false;
var keepLeft = false;
var maxExamples = 3;
var numberOfTextLayersPerGroup = 0;
var _selection;
var sortableValues = [];
var sortIndex = 0;
var layersMeta = [];
var leftPositions = [];
var topPositions = [];


function sortLayers (_selection) {

	// Loop through all selected layers

	for (var i = 0; i < _selection.count(); i++) {

        var layers = _selection.objectAtIndex(i).children();
        var textLayers = [];
        var numTextLayers = 0;
        var strings = [];

        // Check if the selected layers is an artboard

        if (_selection[i].className() == "MSArtboardGroup") {
            artboards = true;
            var layer = _selection[i];
        } else {

            // Loop through all child layers of the group

            for (var j = 0; j < layers.count(); j++) {
                var layer = layers.objectAtIndex(j);

                // Proceed with text layers

                if (layer.className() == "MSTextLayer") {

                    // Remember the string

                    strings.push(layer.stringValue());
                    numTextLayers++;

                    // Remember the maximum number of text layers per group

                    if (numTextLayers > numberOfTextLayersPerGroup) {
                        numberOfTextLayersPerGroup = numTextLayers;

                        // Create example string for the drop down

                        sortableString = layer.name();
                        sortableValues.push(sortableString);
                    } else {
                        if (i < maxExamples) {
                            sortableValues[numTextLayers-1] += ", " + layer.name();
                        } else if(i == maxExamples) {
                            sortableValues[numTextLayers-1] += ", …";
                        }
                    }
                }
            }
        }

        // For each layer group, save the corresponding values of the text layers

        layersMeta.push({
            "name": layer.name(),
            "layer": _selection[i],
            "strings": strings,
            "top": _selection[i].frame().top(),
            "left": _selection[i].frame().left()
        });

        // Remember the position of each layer

        topPositions.push(parseInt(_selection[i].frame().y()));
        leftPositions.push(parseInt(_selection[i].frame().x()));


	}

	// Sort positions

	topPositions.sort(sortNumber);
	leftPositions.sort(sortNumber);

	layersMeta.sort(sortName);

	// Finally, layout the sorted layers

	for (var i = 0; i < layersMeta.length; i++) {
        if (!keepTop) layersMeta[i].layer.frame().setY(topPositions[i]);
		if (!keepLeft) layersMeta[i].layer.frame().setX(leftPositions[i]);
	}
}

// old school variable
doc = context.document;

sortLayers(doc.currentPage().artboards());
var layersMetaArray = [];

for (var i = 0; i < layersMeta.length; i++) {
    layersMetaArray.push(layersMeta[i].layer);
}

layersMetaArray.reverse();
com.getflourish.layers.sortIndices(layersMetaArray);

// Restore selection
com.getflourish.layers.select(_selection);

// Sorts numbers. By default, sort would handle numbers as strings and thus not sort them as intended.
function sortNumber(a,b) {
    return a - b;
}

function sortName (_a, _b) {
    var a = _a.name;
    var b = _b.name;

    return naturalSort(a, b);
}

 function naturalSort (a, b) {
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD)
        if ( xD < yD ) return -1;
        else if ( xD > yD ) return 1;
    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL) return -1;
        if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
}

// Calls menu commands

function sendAction(commandToPerform) {
	try {
		[NSApp sendAction:commandToPerform to:nil from:doc]
	} catch(e) {
		my.log(e)
	}
};

function sendBackward() {
	sendAction('moveBackward:');
}
function sendForward() {
	sendAction('moveForward:');
}
function sendBack() {
	sendAction('moveToBack:');
}

var numberOfTextLayersPerGroup = null;
var sortableValues = null;
var sortIndex = null;
var layersMeta = null;
var leftPositions = null;
var topPositions = null;
}
