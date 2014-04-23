// Attribute declaration
var SOIL_PATCH_ATTRIBUTE_DEFAULTS = {
    'nitrates' : 0,
    'ammonium' : 0,
    'freshOrganicN' : 0,
    'activeOrganicN' : 0,
    'stableOrganicN' : 0
};

var SoilPatch = function(attributes) {
    var myself = this;

    if(attributes === undefined)
         attributes = SOIL_PATCH_ATTRIBUTE_DEFAULTS

    // Copy the supplied attributes
    this.attributes = {}
    for (var k in attributes) {
        if (attributes.hasOwnProperty(k)) {
            this.attributes[k] = attributes[k];
        }
    }

};

// Set up attribute getters and setters
for (var k in SOIL_PATCH_ATTRIBUTE_DEFAULTS) {
    SoilPatch.prototype[k] = function(value) {
        if(value === undefined) {
            return this.attributes[k];
        } else {
            this.attributes[k] = value;
        }
     }
};

/*
SoilPatch.prototype.nitrates = function(value) {
    if (value === undefined) {
       return this.attributes['nitrates'];
    } else {
        this.attributes['nitrates'] = value;
    }
};
*/
