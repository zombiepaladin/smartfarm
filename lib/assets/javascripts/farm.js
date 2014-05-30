// Constructor
function Farm(name, location, boundaries) {
  this.init(name, location, boundaries)
}
  
Farm.prototype.init = function (name, location, boundaries) {
  var myself = this;

  this.name = name;
  this.location = { 
    latitude: location.latitude,
    longitude: location.longitude
  };

  this.bounds = {
    north: location.latitude,
    south: location.latitude,
    east:  location.longitude,
    west:  location.longitude
  };

  this.fields = [];

  // Find the bounds
  this.boundary = [];
  boundaries.forEach( function(boundary) {
    boundary.forEach( function(coord) {

      // determine farm's bounding box
      if(coord.latitude > myself.bounds.north)
        myself.bounds.north = coord.latitude;
      if(coord.latitude < myself.bounds.south)
        myself.bounds.south = coord.latitude;
      if(coord.longitude > myself.bounds.east)
        myself.bounds.east = coord.longitude;
      if(coord.longitude < myself.bounds.west)
        myself.bounds.west = coord.longitude;

    });
    myself.fields.push(new Field(boundary));
  }); 

  // 111,111 meters = 1 degree latitude
  this.height = Math.ceil(111111 * (this.bounds.north - this.bounds.south));
  degreesPerMeterLat = 1/111111;

  // 111,111 * cos(latitude) = 1 degree longitude
  this.width = Math.ceil(111111 * Math.cos(this.location.latitude * (Math.PI/180)) * (this.bounds.east - this.bounds.west));
  degreesPerMeterLng = 1/(111111 * Math.cos(this.location.latitude * (Math.PI/180)));

  console.log("width x height", this.width, this.height);
  // Create the patches
  this.patches = new Array(this.width * this.height);
//  console.log("HERE");
  for(i = 0; i < this.width; i++){
    for(j = 0; j < this.height; j++){
      this.patches[i + j] = new Patch(
        this.bounds.west + (i * degreesPerMeterLat),
        this.bounds.north + (j * degreesPerMeterLng)
      );
//      console.log(this.bounds.west + i * degreesPerMeterLat, this.bounds.north + j * degreesPerMeterLng);
//      this.patches[j * this.width + i] = new Patch({
//        latitude: this.bounds.west + i * degreesPerMeterLat,
//        longitude: this.bounds.north + j * degreesPerMeterLng
//      });
    }
  }
//  console.log(this.patches[40])
  
};
