function Patch(latitude, longitude) {
  this.init(latitude,longitude);
};

Patch.prototype.init = function(latitude, longitude) {
  this.latitude = latitude;
  this.longitude = longitude;
  this.nitrate = 0;
  this.ammonia = 0;
  this.organicNitrogen = 0;
  this.labilePhosphorus = 0,
  this.freshOrganicNitrogen = 0,
  this.humusOrganicNitrogen = 0,
  this.activeMineralNitrogen = 0,
  this.stableMineralNitrogen = 0
  //this.soil = undefined;
  //this.plants = [];
};
