// Touch event handler for Google Blockly.
// Tony Hursh. Based loosely on some code at: http://vetruvet.blogspot.com/2010/12/converting-single-touch-events-to-mouse.html
// Same license as Blockly itself.

Blockly.TouchEvents = {};
Blockly.TouchEvents.touchMapper = {
  "touchstart" : "mousedown",
  "touchmove" : "mousemove",
  "touchend" : "mouseup"
};

Blockly.TouchEvents.touchHandler = function(event) {
if (event.touches.length > 1){
  return; // Punt on multitouch events.
}
var touchPoint = event.changedTouches[0];
var mappedEvent = Blockly.TouchEvents.touchMapper[event.type];
if(mappedEvent == null){ // We don't handle this event type (whatever it is). Punt.
  return;
}
var simulatedEvent = document.createEvent("MouseEvent");
simulatedEvent.initMouseEvent(mappedEvent, true, true,  window, 1, touchPoint.screenX, touchPoint.screenY, 
  touchPoint.clientX, touchPoint.clientY, false, false, false, false, 0, null);
  touchPoint.target.dispatchEvent(simulatedEvent);
  event.preventDefault();
};

if(Blockly.svgDoc) {
  Blockly.svgDoc.ontouchstart = Blockly.TouchEvents.touchHandler;
  Blockly.svgDoc.ontouchmove = Blockly.TouchEvents.touchHandler;
  Blockly.svgDoc.ontouchend = Blockly.TouchEvents.touchHandler;
}
