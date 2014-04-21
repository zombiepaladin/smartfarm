/*
# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
#ready = ->
#  world = $('#crop-editor')
#  if world.length > 0
#    alert "foo"
#    console.log world
#    world = new WorldMorph(world[0], false)
#    cropEditor = new CropEditorMorph()
#    cropEditor.openIn(world)
#    loop = () ->
#      world.doOneCycle()
#    loop()
*/

ready = function() {
  var canvas = $('#crop-editor');

  if(canvas.length > 0) {
    $.ajax('/crops/' + canvas.data('crop-id') + '.json', {
      'dataType': 'json',
      'success': function (data) {
        var world = new WorldMorph(canvas[0], false),
          cropEditor = new CropEditorMorph(data);

          cropEditor.openIn(world);
          document.world = world;

          function loop() {
            world.doOneCycle(); 
          };
          setInterval(loop, 1);
      },
      failure: function() {
        // render into canvas
        // add a refresh link
      }
    });
  } 
}


$(document).ready(ready);
$(document).on('page:load', ready);
