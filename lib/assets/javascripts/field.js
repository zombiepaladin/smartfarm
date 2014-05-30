// Constructor
function Field(boundary) {
  this.init(boundary)
}
  
Field.prototype.init = function (boundary) {
  var myself = this;

  // Set the boundary 
  this.boundary = [];
  boundary.forEach( function(coord, i) {
    myself.boundary[i] = {
      latitude: coord.latitude,
      longitude: coord.longitude
    }
  }); 

};
