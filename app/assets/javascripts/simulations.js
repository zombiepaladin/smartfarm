var clampAngle, steerAngle, wrapAngle;

//gets the angle between -2pi and +2pi
wrapAngle = function(angle) {
  while (angle < -Math.PI) {
    angle += 2 * Math.PI;
  }
  while (angle > Math.PI) {
    angle -= 2 * Math.PI;
  }
  return angle;
};

//if the angle is less than the min, set angle to min
//if the angle is more than the max, set agle to max
clampAngle = function(angle, min, max) {
  if (angle < min) {
    angle = min;
  }
  if (angle > max) {
    angle = max;
  }
  return angle;
};

//gives the steering angle for the tiller
steerAngle = function(desired, current, speed) {
  var angle;
  angle = wrapAngle(desired - current);
  angle = clampAngle(angle, -speed, speed);
  angle = wrapAngle(angle + current);
  return angle;
};

jQuery(function() {
  var game, growCrop, initializeCropDataLayers, initializeDataLayers, initializeGame, layerColors, pause, renderGame, restart, run, saveButton, simulation, step, updateCropDataLayer, updateGame, updateSize, updateSoilDataLayer, updateTime, updateWeather;
  
  //if we have necessary items (farm, weather, soil) to perform simulation
  if ($('#simulation-form').size() > 0) {
    
    //add a farm to #selected-farms
    $(".farm [data-id='" + ($('#simulation_farm_id').data('id')) + "']").detach().appendTo('#selected-farms');
    
    //add a weather pattern to #selected-weather
    $(".weather [data-id='" + ($('#simulation_weather_id').data('id')) + "']").appendTo('#selected-weather');
	
    //adds and removes farms between #seleced-farm
    //and #unselected-farms on click
    $('.farm a').on('click', function(event) {
      if ($(this).parent().hasClass('thumbnail'))
      {
        var selected;
        event.preventDefault();
        $('#selected-farm').children().detach().appendTo("#unselected-farms");
        selected = $(this).parent().detach().appendTo('#selected-farm');
        $('#simulation_farm_id').val(selected.data('id'));
      }
      return false;
    });

    //adds and removes weather patterns between #selected-weather
    //and #unselected-weather on click
    $('.weather a').on('click', function(event) {
      if ($(this).parent().hasClass('thumbnail'))
      {
        var selected;
        event.preventDefault();
        $('#selected-weather').children().detach().appendTo("#unselected-weater"); //weather? typo?
        selected = $(this).parent().detach().appendTo('#selected-weather');
        $('#simulation_weather_id').val(selected.data('id'));
      }
      return false;
    });

    //adds and removes soil models between #selected-soil
    //and #unselected-soils on click
    $('.soil a').on('click', function(event) {
      if ($(this).parent().hasClass('thumbnail'))
      {
        var selected;
        event.preventDefault();
        $('#selected-soil').children().detach().appendTo("#unselected-soils");
        selected = $(this).parent().detach().appendTo('#selected-soil');
        $('#simulation_soil_id').val(selected.data('id'));
      }
      return false;
    });

    //these buttons will remove/delete the farm, weather pattern, or soil model
    $('.farm .btn').remove();
    $('.weather .btn').remove();
    $('.soil .btn').remove();

    //saves the selected weather pattern and farm into the simulation object
    //do we need the soil models?
    saveButton = $('button#save');
    saveButton.on('click', function(event) {
      var simulation;
      simulation = {};
      simulation.farm = {
        id: $('#simulation_farm_id').val()
      };
      simulation.weather = {
        id: $('#simulation_weather_id').val()
      };

      //what is this piece doing?
      $('#simulation_state').val(JSON.stringify(simulation));
      return console.log(simulation);
    });
  }

  //this if statement goes to the end of the script
  if ($('#simulation-controls').length > 0) {

    //game is an object with attributes 'state' and 'mouse'
    //mouse is an object with attributes 'x' and 'y'
    game = {
      state: 'observer',
      mouse: {
        x: 0,
        y: 0
      }
    };

    //sets the x and y offset between the mouse and the #farm-display
    $(document).on('mousemove', function(me) {
      var offset;
      offset = $('#farm-display').offset();
      game.mouse.x = me.pageX - offset.left;
      return game.mouse.y = me.pageY - offset.top;
    });

    //simulation is an object with attributes
    //worker (a 'thread'), rate, interval, paused
    //simulation objects are
    //size, soilLayerContexts, cropLayerContexts, and weather
    simulation = {
      worker: new Worker(window.location.toString() + '.js'),
      rate: 1000,
      interval: void 0,
      paused: true,
      size: {
        width: 0,
        height: 0
      },
      soilLayerContexts: {},
      cropLayerContexts: {},
      weather: {
        rainfall: 0,
        snowfall: 0
      }
    };

    //when a message returns from the worker thread,
    //perform an action based on the 'msg.data.type'
    simulation.worker.onmessage = function(msg) {
      console.log(msg.data);
      switch (msg.data.type) {
        case 'size_update':
          return updateSize(msg.data.size);
        case 'time_update':
          return updateTime(msg.data.time);
        case 'weather_update':
          return updateWeather(msg.data.weather);
        case 'soil_data_layer_update':
          return updateSoilDataLayer(msg.data.layer_name, msg.data.layer_data);
        case 'crop_initialize':
          return initializeCropDataLayers(msg.data.crop_id, msg.data.crop_name);
        case 'crop_data_layer_update':
          return updateCropDataLayer(msg.data.crop_id, msg.data.layer_name, msg.data.layer_data);
      }
    };

    //type is the object to be delivered to the worker
    simulation.worker.postMessage({
      type: 'init'
    });

    //layerColors contains key-value pairs
    //keys are the type of weather
    //values are the colors in RGB form
    layerColors = {};
    layerColors["snow_cover"] = [100, 100, 100];
    layerColors["water_content"] = [0, 0, 255];
    layerColors["wilting_point"] = [100, 100, 100];
    layerColors["percolation_travel_time"] = [100, 100, 100];
    layerColors["porosity"] = [100, 100, 100];
    layerColors["nitrate"] = [100, 100, 100];
    layerColors["ammonium"] = [100, 100, 100];
    layerColors["fresh_organic_nitrogen"] = [100, 100, 100];
    layerColors["active_organic_nitrogen"] = [100, 100, 100];
    layerColors["stable_organic_nitrogen"] = [100, 100, 100];
    layerColors["labile_phosphorus"] = [100, 100, 100];
    layerColors["fresh_organic_phosphorus"] = [100, 100, 100];
    layerColors["bound_organic_phosphorus"] = [100, 100, 100];
    layerColors["active_mineral_phosphorus"] = [100, 100, 100];
    layerColors["stable_mineral_phosphorus"] = [100, 100, 100];
    layerColors["flat_residue_carbon"] = [100, 100, 100];
    layerColors["humus_carbon"] = [100, 100, 100];
    layerColors["root_biomass"] = [0, 100, 0];
    layerColors["stem_biomass"] = [0, 100, 0];
    layerColors["leaf_biomass"] = [0, 100, 0];
    layerColors["storage_organ_biomass"] = [0, 100, 0];
    layerColors["reproductive_organ_biomass"] = [0, 100, 0];
    layerColors["standing_residue_biomass"] = [0, 100, 0];

    //updates the size in the simulation object
    updateSize = function(size) {
      simulation.size = size;
      initializeGame(size);
      return initializeDataLayers(size);
    };

    //initializes the data within the soil and crop objects
    initializeDataLayers = function(size) {
      var attributes, cropDataLayers, ctx, fields, soilDataLayers, soilLayerCheckboxes;
      soilDataLayers = $('#soil-data-layers');
      fields = $("<canvas id='fields' class='layer' width=" + (size.width * 50) + " height=" + (size.height * 50) + ">");

      //ctx contains the properties and methods to draw on the canvas
      ctx = fields[0].getContext('2d');
      console.log(simulation.size);

      //draws the path on each field
      simulation.size.fields.forEach(function(field) {
        ctx.beginPath();
        field.bounds.forEach(function(corner) {
          return ctx.lineTo(corner.x * 50, corner.y * 50);
        });
        ctx.closePath();
        return ctx.stroke();
      });
      //add the fields to the soilDataLayers
      soilDataLayers.append(fields);
      soilLayerCheckboxes = $('#soil-data-layer-checkboxes');
      attributes = ["snow_cover", "water_content", "wilting_point", "percolation_travel_time", "porosity", "nitrate", "ammonium", "fresh_organic_nitrogen", "active_organic_nitrogen", "stable_organic_nitrogen", "labile_phosphorus", "fresh_organic_phosphorus", "bound_organic_phosphorus", "active_mineral_phosphorus", "stable_mineral_phosphorus", "flat_residue_carbon", "humus_carbon"];

      //add each of the weather attributes as a checkbox within the Legend
      attributes.forEach(function(name) {
        var layer;
        layer = $("<canvas id='" + name + "' class='layer' width=" + size.width + " height=" + size.height + " style='display: none;'></canvas>");
        simulation.soilLayerContexts[name] = layer[0].getContext('2d');
        soilDataLayers.prepend(layer);
        return soilLayerCheckboxes.append("<div class='checkbox'><label for='cb_" + name + "'><input name='" + name + "' id='cb_" + name + "' type='checkbox'>" + (name.replace('_', ' ').replace('_', ' ')) + "</label></div>");
      });

      //toggles the checkbox options
      $('#soil-data-layer-checkboxes input').on('change', function(event) {
        return $('#' + $(this).attr('name')).toggle();
      });


      cropDataLayers = $('#crop-data-layers');
      fields = $("<canvas id='fields' class='layer' width=" + (size.width * 50) + " height=" + (size.height * 50) + ">");
      ctx = fields[0].getContext('2d');

      //draw on the cropDataLayers
      simulation.size.fields.forEach(function(field) {
        ctx.beginPath();
        field.bounds.forEach(function(corner) {
          return ctx.lineTo(corner.x * 50, corner.y * 50);
        });
        ctx.closePath();
        return ctx.stroke();
      });
      return cropDataLayers.append(fields);
    };

    //initialize the crop layers in the simulation object
    initializeCropDataLayers = function(id, name) {
      var attributes, cropDataLayers, cropLayerCheckboxes;
      simulation.cropLayerContexts[id] = {};
      cropDataLayers = $('#crop-data-layers');
      cropLayerCheckboxes = $('#crop-data-layer-checkboxes');
      cropLayerCheckboxes.append("<h5>" + name + "</h5>");
      attributes = ["root_biomass", "stem_biomass", "leaf_biomass", "storage_organ_biomass", "reproductive_organ_biomass", "standing_residue_biomass"];
      attributes.forEach(function(name) {
        var layer;
        layer = $("<canvas id='" + id + "_" + name + "' class='layer' width=" + simulation.size.width + " height=" + simulation.size.height + " style='display: none;'></canvas>");
        simulation.cropLayerContexts[id][name] = layer[0].getContext('2d');
        cropDataLayers.prepend(layer);
        return cropLayerCheckboxes.append("<div class='checkbox'><label for='cb_" + id + "_" + name + "'><input name='" + id + "_" + name + "' id='cb_" + id + "_" + name + "' type='checkbox'>" + (name.replace('_', ' ').replace('_', ' ')) + "</label></div>");
      });
      return $('#crop-data-layer-checkboxes input').on('change', function(event) {
        return $('#' + $(this).attr('name')).toggle();
      });
    };

    //puts the month abbreviation in the #calendar-month div
    updateTime = function(time) {
      var simtime;
      simtime = new Date(time);
      switch (simtime.getMonth()) {
        case 1:
          $('#calendar-month').html('Jan');
          break;
        case 2:
          $('#calendar-month').html('Feb');
          break;
        case 3:
          $('#calendar-month').html('Mar');
          break;
        case 4:
          $('#calendar-month').html('Apr');
          break;
        case 5:
          $('#calendar-month').html('May');
          break;
        case 6:
          $('#calendar-month').html('Jun');
          break;
        case 7:
          $('#calendar-month').html('Jul');
          break;
        case 8:
          $('#calendar-month').html('Aug');
          break;
        case 9:
          $('#calendar-month').html('Sep');
          break;
        case 10:
          $('#calendar-month').html('Oct');
          break;
        case 11:
          $('#calendar-month').html('Nov');
          break;
        case 12:
          $('#calendar-month').html('Dec');
      }

      //update the calendar to show the numberic date and the simulation clock to show the time
      $('#calendar-day').html(simtime.getDate());
      return $('#simulation-clock').html(simtime.getHours() + ':' + ('0' + simtime.getMinutes()).slice(-2));
    };

    //set the weather within the simulation object
    updateWeather = function(weather) {
      return simulation.weather = weather;
    };

    //colors the soil with the RGB values from the layerColors dictionary
    updateSoilDataLayer = function(name, data) {
      var brush, brushData, offset, x, y, _i, _ref, _results;
      if (name === 'snow_cover') {
        game.weather.snow_cover.data = data;
      }
      brush = simulation.soilLayerContexts[name].createImageData(1, 1);
      brushData = brush.data;
      brushData[0] = layerColors[name][0];
      brushData[1] = layerColors[name][1];
      brushData[2] = layerColors[name][2];
      _results = [];
      for (y = _i = 0, _ref = simulation.size.height; _i < _ref; y = _i += 1) {
        offset = y * simulation.size.width;
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (x = _j = 0, _ref1 = simulation.size.width; _j < _ref1; x = _j += 1) {
            brushData[3] = data[x + offset];
            _results1.push(simulation.soilLayerContexts[name].putImageData(brush, x, y));
          }
          return _results1;
        })());
      }
      return _results;
    };

    //colors the crops with the RGB from the layerColors dictionary
    updateCropDataLayer = function(id, name, data) {
      var brush, brushData, offset, x, y, _i, _ref, _results;
      brush = simulation.cropLayerContexts[id][name].createImageData(1, 1);
      brushData = brush.data;
      brushData[0] = layerColors[name][0];
      brushData[1] = layerColors[name][1];
      brushData[2] = layerColors[name][2];
      _results = [];
      for (y = _i = 0, _ref = simulation.size.height; _i < _ref; y = _i += 1) {
        offset = y * simulation.size.width;
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (x = _j = 0, _ref1 = simulation.size.width; _j < _ref1; x = _j += 1) {
            brushData[3] = data[x + offset];
            simulation.cropLayerContexts[id][name].putImageData(brush, x, y);
            if (data[x + offset] > 0) {
              _results1.push(growCrop(x, y, name, data[x + offset]));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        })());
      }
      return _results;
    };

    //the object to hold our combine (tiller)
    game.combine = {
      x: 0,
      y: 0,
      angle: 0,
      active: false,
      image: new Image()
    };
    //the image for our combine
    game.combine.image.src = "/images/combine.png";
	
    //the object to hold our tractor
    game.tractor = {
      x: 0,
      y: 0,
      angle: 0,
      image: new Image()
    };
    //the image for our tractor
    game.tractor.image.src = "/images/tractor.png";
	
    //the object to hold our plow
    game.plow = {
      x: 0,
      y: 0,
      angle: 0,
      active: false,
      image: new Image(),
      stamp: new Image()
    };
    //the image for our plow
    game.plow.image.src = "/images/plow.png";
    //the image for the trail left from the plow (tilled dirt)
    game.plow.stamp.src = "/images/plow_trail.png";
	
    //the object for our drill
    game.drill = {
      x: 0,
      y: 0,
      angle: 0,
      active: false,
      image: new Image(),
      stamp: new Image(),
      seed: new Image()
    };
    //the images for our drill, trail from the drill, and seed for the drill
    game.drill.image.src = "/images/drill.png";
    game.drill.stamp.src = "/images/drill_trail.png";
    game.drill.seed.src = "/images/drill_seed.png";
	
    //the object for our weather
    game.weather = {
      rain: {
        image: new Image()
      },
      snow: {
        image: new Image()
      },
      snow_cover: {
        image: new Image()
      }
    };
    //the images for the weather
    game.weather.rain.image.src = "/images/rain.png";
    game.weather.snow.image.src = "/images/snow.png";
    game.weather.snow_cover.image.src = "/images/snow_cover.png";
	
    //the object for our crop (an array of images)
    game.crop = {
      image: []
    };
    //the images for our crops
    game.crop.image[1] = new Image();
    game.crop.image[1].src = "/images/crop_1.png";
    game.crop.image[2] = new Image();
    game.crop.image[2].src = "/images/crop_2.png";
    game.crop.image[3] = new Image();
    game.crop.image[3].src = "/images/crop_3.png";
    game.crop.image[4] = new Image();
    game.crop.image[4].src = "/images/crop_4.png";
    game.crop.image[5] = new Image();
    game.crop.image[5].src = "/images/crop_5.png";


    initializeGame = function() {
      var inputDown, inputMove, inputUp, touchEvents, touchHandler;
      game.width = simulation.size.width * simulation.size.granularity;
      game.height = simulation.size.height * simulation.size.granularity;
      game.buffers = {
        front: $("<canvas width=800 height=600>")[0],
        back: $("<canvas width=" + game.width + " height=" + game.height + ">")[0],
        terrain: $("<canvas width=" + game.width + " height=" + game.height + ">")[0],
        vegitation: $("<canvas width=" + game.width + " height=" + game.height + ">")[0]
      };
      game.ctx = {
        front: game.buffers.front.getContext('2d'),
        back: game.buffers.back.getContext('2d'),
        terrain: game.buffers.terrain.getContext('2d'),
        vegitation: game.buffers.vegitation.getContext('2d')
      };
      game.hq = {
        x: simulation.size.location.x * simulation.size.granularity,
        y: simulation.size.location.y * simulation.size.granularity
      };
      game.viewport = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        radius: 500,
        target: game.hq
      };
      game.combine.x = game.hq.x;
      game.combine.y = game.hq.y;
      game.tractor.x = game.hq.x;
      game.tractor.y = game.hq.y;
      game.plow.x = game.hq.x;
      game.plow.y = game.hq.y;
      game.drill.x = game.hq.x;
      game.drill.y = game.hq.y;
      game.ctx.terrain.fillStyle = 'tan';
      game.ctx.terrain.fillRect(0, 0, game.width, game.height);
      game.ctx.terrain.strokeStyle = 'yellow';
      game.ctx.terrain.lineWidth = 5;
      simulation.size.fields.forEach(function(field) {
        game.ctx.terrain.beginPath();
        field.bounds.forEach(function(corner) {
          return game.ctx.terrain.lineTo(corner.x * simulation.size.granularity, corner.y * simulation.size.granularity);
        });
        game.ctx.terrain.closePath();
        return game.ctx.terrain.stroke();
      });
      game.path = [];
      game.tracking = false;
      touchEvents = {};
      touchEvents.touchMapper = {
        "touchstart": "mousedown",
        "touchmove": "mousemove",
        "touchend": "mouseup"
      };
      touchHandler = function(event) {
        var mappedEvent, simulatedEvent, touchPoint;
        if (event.touches.length > 1) {
          return;
        }
        touchPoint = event.changedTouches[0];
        mappedEvent = touchMapper[event.type];
        if (mappedEvent === null) {
          return;
        }
        alert("HERE");
        simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(mappedEvent, true, true, window, 1, touchPoint.screenX, touchPoint.screenY, touchPoint.clientX, touchPoint.clientY, false, false, false, false, 0, null);
        touchPoint.target.dispatchEvent(simulatedEvent);
        return event.preventDefault();
      };
      $('#farm-display')[0].ontouchstart = touchHandler;
      $('#farm-display')[0].ontouchmove = Blockly.TouchEvents.touchHandler;
      $('#farm-display')[0].ontouchend = Blockly.TouchEvents.touchHandler;
      $('#farm-display').on('mousedown', function(me) {
        inputDown(me.pageX, me.pageY);
        me.preventDefault;
        return false;
      });
      $('#farm-display').on('mousemove', function(me) {
        inputMove(me.pageX, me.pageY);
        me.preventDefault();
        return false;
      });
      $('#farm-display').on('mouseup', function(me) {
        inputUp(me.pageX, me.pageY);
        me.preventDefault();
        return false;
      });
      inputDown = function(x, y) {
        var offset;
        if (game.state === 'tilling' || game.state === 'planting' || game.state === 'harvesting') {
          offset = $('#farm-display').offset();
          //game.path = []; // erases old path when you start a new one.
		  
			var myX = x - offset.left + game.viewport.x;
			var myY = y - offset.top + game.viewport.y;
			if (myX <= game.width && myY <= game.height) {
			  game.path.push({
				x: myX,
				y: myY
			  });

			}
          return game.tracking = true;
        }
      };
      inputMove = function(x, y) {
        var offset;
        if (game.tracking && (game.state === 'tilling' || game.state === 'planting' || game.state === 'harvesting')) {
          offset = $('#farm-display').offset();
			
			var myX = x - offset.left + game.viewport.x;
			var myY = y - offset.top + game.viewport.y;

			if (myX <= game.width && myY <= game.height) {
				game.path.push({
					x: myX,
					y: myY
				});
			}
        }
      };
      inputUp = function(x, y) {
        var offset;
        if (game.tracking && (game.state === 'tilling' || game.state === 'planting' || game.state === 'harvesting')) {
          offset = $('#farm-display').offset();
         
			var myX = x - offset.left + game.viewport.x;
			var myY = y - offset.top + game.viewport.y;

			if (myX <= game.width && myY <= game.height) {
				game.path.push({
					x: myX,
					y: myY
				});
			}
          return game.tracking = false;
        }
      };
      $('#farm-display').on('mouseleave', function(me) {
        if (game.tracking && (game.state === 'tilling' || game.state === 'planting' || game.state === 'harvesting')) {
          game.path.push({
            x: me.pageX - offset.left + game.viewport.x,
            y: me.pageY - offset.top + game.viewport.y
          });
          game.tracking = false;
        }
        me.preventDefault();
        return false;
      });
      game.animation_frame = window.requestAnimationFrame(function() {
        return renderGame();
      });
      game.ctx.front.drawImage(game.buffers.terrain, 0, 0);
      return $('#farm #farm-display').append(game.buffers.front);
    };
    updateGame = function() {
      var distance, dx, dy, speed, x, y;
      console.log(game.state);
      switch (game.state) {
        case 'tilling':
          dy = 0;
          dx = 0;
          while (game.path.length > 0) {
            dy = game.path[0].y - game.tractor.y;
            dx = game.path[0].x - game.tractor.x;
            distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 12) {
              game.plow.active = true;
              game.path.shift();
            } else {
              break;
            }
          }
          if (game.path.length === 0) {
            game.plow.active = false;
          } else {
            speed = 5;
            game.tractor.angle = steerAngle(Math.atan2(dy, dx), game.tractor.angle, Math.PI / 8);
            game.tractor.x += speed * Math.cos(game.tractor.angle);
            game.tractor.y += speed * Math.sin(game.tractor.angle);
            game.plow.x = -5 * Math.cos(game.tractor.angle) + game.tractor.x;
            game.plow.y = -5 * Math.sin(game.tractor.angle) + game.tractor.y;
            game.plow.angle = steerAngle(game.tractor.angle, game.plow.angle, Math.PI / 16);
            if (game.plow.active) {
              game.ctx.terrain.save();
              game.ctx.terrain.fillStyle = '#3d1f00';
              x = game.plow.x;
              y = game.plow.y;
              game.ctx.terrain.translate(x, y);
              game.ctx.terrain.rotate(game.plow.angle);
              game.ctx.terrain.drawImage(game.plow.stamp, -22, -9);
              game.ctx.terrain.restore();
            }
          }
          break;
        case 'planting':
          dy = 0;
          dx = 0;
          while (game.path.length > 0) {
            dy = game.path[0].y - game.tractor.y;
            dx = game.path[0].x - game.tractor.x;
            distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 12) {
              game.drill.active = true;
              game.path.shift();
            } else {
              break;
            }
          }
          if (game.path.length === 0) {
            game.drill.active = false;
          } else {
            speed = 5;
            game.tractor.angle = steerAngle(Math.atan2(dy, dx), game.tractor.angle, Math.PI / 8);
            game.tractor.x += speed * Math.cos(game.tractor.angle);
            game.tractor.y += speed * Math.sin(game.tractor.angle);
            game.drill.x = -5 * Math.cos(game.tractor.angle) + game.tractor.x;
            game.drill.y = -5 * Math.sin(game.tractor.angle) + game.tractor.y;
            game.drill.angle = steerAngle(game.tractor.angle, game.drill.angle, Math.PI / 16);
            if (game.drill.active) {
              game.ctx.terrain.save();
              x = game.drill.x;
              y = game.drill.y;
              game.ctx.terrain.translate(x, y);
              game.ctx.terrain.rotate(game.drill.angle);
              game.ctx.terrain.drawImage(game.drill.stamp, -16, -9);
              game.ctx.terrain.restore();
              game.ctx.vegitation.save();
              game.ctx.vegitation.translate(x, y);
              game.ctx.vegitation.rotate(game.drill.angle);
              game.ctx.vegitation.drawImage(game.drill.seed, -16, -9);
              game.ctx.vegitation.restore();
            }
          }
          break;
        case 'harvesting':
          dy = 0;
          dx = 0;
          while (game.path.length > 0) {
            dy = game.path[0].y - game.combine.y;
            dx = game.path[0].x - game.combine.x;
            distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 12) {
              game.combine.active = true;
              game.path.shift();
            } else {
              break;
            }
          }
          if (game.path.length === 0) {
            game.combine.active = false;
          } else {
            speed = 5;
            game.combine.angle = steerAngle(Math.atan2(dy, dx), game.combine.angle, Math.PI / 8);
            game.combine.x += speed * Math.cos(game.combine.angle);
            game.combine.y += speed * Math.sin(game.combine.angle);
          }
      }
	  if (game.path.length <= 0) {
		// do not auto-move the viewport when the tractor is not moving
	  } else if (game.width <= game.viewport.width) { // Do not pan if simulation size is smaller than the canvas screen size.
		game.viewport.x = 0;
      } else if (game.viewport.target.x < game.viewport.width / 2) {
        game.viewport.x = 0;
      } else if (game.viewport.target.x > game.width - game.viewport.width / 2) {
        game.viewport.x = game.width - game.viewport.width;
      } else {
        game.viewport.x = game.viewport.target.x - game.viewport.width / 2;
      }
	  if (game.path.length <= 0) {
		// do not auto-move the viewport when the tractor is not moving
	  } else if (game.height <= game.viewport.height) { // Do not pan if simulation size is smaller than the canvas screen size.
		return game.viewport.y = 0;
      } else if (game.viewport.target.y < game.viewport.height / 2) {
        return game.viewport.y = 0;
      } else if (game.viewport.target.y > game.height - game.viewport.height / 2) {
        return game.viewport.y = game.height - game.viewport.height;
      } else {
        return game.viewport.y = game.viewport.target.y - game.viewport.height / 2;
      }
    };
    renderGame = function() {
      var granularity, i, pattern, x, y, _i, _j, _k, _ref, _ref1, _ref2;
      game.ctx.back.drawImage(game.buffers.terrain, 0, 0);
      game.ctx.back.save();
      game.ctx.back.translate(game.combine.x, game.combine.y);
      game.ctx.back.rotate(game.combine.angle);
      game.ctx.back.drawImage(game.combine.image, -6, -9);
      game.ctx.back.restore();
      game.ctx.back.save();
      game.ctx.back.translate(game.plow.x, game.plow.y);
      game.ctx.back.rotate(game.plow.angle);
      game.ctx.back.drawImage(game.plow.image, -17, -9);
      game.ctx.back.restore();
      game.ctx.back.save();
      game.ctx.back.translate(game.drill.x, game.drill.y);
      game.ctx.back.rotate(game.drill.angle);
      game.ctx.back.drawImage(game.drill.image, -13, -9);
      game.ctx.back.restore();
      game.ctx.back.save();
      game.ctx.back.translate(game.tractor.x, game.tractor.y);
      game.ctx.back.rotate(game.tractor.angle);
      game.ctx.back.drawImage(game.tractor.image, -5, -5);
      game.ctx.back.restore();
      if (simulation.weather.rainfall > 0) {
        game.ctx.back.save();
        pattern = game.ctx.back.createPattern(game.weather.rain.image, 'repeat');
        game.ctx.back.fillStyle = pattern;
        game.ctx.back.translate(game.viewport.x + game.viewport.width / 2, game.viewport.y + game.viewport.height / 2);
        game.ctx.back.rotate(simulation.weather.wind_direction * 0.0174543925);
        game.ctx.back.translate(0, Date.now() % 30);
        game.ctx.back.fillRect(-game.viewport.radius - 30, -game.viewport.radius - 30, 2 * game.viewport.radius + 30, 2 * game.viewport.radius + 30);
        game.ctx.back.restore();
      }
      if (simulation.weather.snowfall > 0) {
        game.ctx.back.save();
        pattern = game.ctx.back.createPattern(game.weather.snow.image, 'repeat');
        game.ctx.back.fillStyle = pattern;
        game.ctx.back.translate(game.viewport.x + game.viewport.width / 2, game.viewport.y + game.viewport.height / 2);
        game.ctx.back.rotate(simulation.weather.wind_direction * 0.0174543925);
        game.ctx.back.translate(0, Date.now() % 30);
        game.ctx.back.fillRect(-game.viewport.radius - 30, -game.viewport.radius - 30, 2 * game.viewport.radius + 30, 2 * game.viewport.radius + 30);
        game.ctx.back.restore();
      }
      if (game.weather.snow_cover.data) {
        game.ctx.back.save();
        pattern = game.ctx.back.createPattern(game.weather.snow_cover.image, 'repeat');
        game.ctx.back.fillStyle = pattern;
        granularity = simulation.size.granularity;
        for (x = _i = 0, _ref = simulation.size.width; _i < _ref; x = _i += 1) {
          for (y = _j = 0, _ref1 = simulation.size.height; _j < _ref1; y = _j += 1) {
            for (i = _k = 0, _ref2 = Math.min(5, Math.ceil(game.weather.snow_cover.data[x + y * simulation.size.width] / 5)); _k < _ref2; i = _k += 1) {
              game.ctx.back.fillRect(x * granularity, y * granularity, granularity, granularity);
            }
          }
        }
        game.ctx.back.restore();
      }
      game.ctx.back.drawImage(game.buffers.vegitation, 0, 0);
      game.ctx.back.save();
      game.ctx.back.strokeStyle = 'red';
      game.ctx.back.beginPath();
      if (game.path.length > 0) {
        game.ctx.back.moveTo(game.path[0].x, game.path[0].y);
      }
      game.path.forEach(function(point) {
        return game.ctx.back.lineTo(point.x, point.y);
      });
      game.ctx.back.stroke();
      game.ctx.back.restore();
      return game.ctx.front.drawImage(game.buffers.back, -game.viewport.x, -game.viewport.y);
    };
    growCrop = function(patchX, patchY, category, amount) {
      var granularity, offsetX, offsetY, pattern;
      granularity = simulation.size.granularity;
      offsetX = patchX * granularity;
      offsetY = patchY * granularity;
      if (category === 'leaf_biomass' || category === 'stem_biomass') {
        if (amount > 800) {
          pattern = game.ctx.vegitation.createPattern(game.crop.image[5], 'repeat');
          game.ctx.vegitation.save();
          game.ctx.vegitation.fillStyle = pattern;
          game.ctx.vegitation.fillRect(offsetX, offsetY, granularity, granularity);
          game.ctx.vegitation.restore();
        } else if (amount > 400) {
          pattern = game.ctx.vegitation.createPattern(game.crop.image[4], 'repeat');
          game.ctx.vegitation.save();
          game.ctx.vegitation.fillStyle = pattern;
          game.ctx.vegitation.fillRect(offsetX, offsetY, granularity, granularity);
          game.ctx.vegitation.restore();
        } else if (amount > 200) {
          pattern = game.ctx.vegitation.createPattern(game.crop.image[3], 'repeat');
          game.ctx.vegitation.save();
          game.ctx.vegitation.fillStyle = pattern;
          game.ctx.vegitation.fillRect(offsetX, offsetY, granularity, granularity);
          game.ctx.vegitation.restore();
        } else if (amount > 100) {
          pattern = game.ctx.vegitation.createPattern(game.crop.image[2], 'repeat');
          game.ctx.vegitation.save();
          game.ctx.vegitation.fillStyle = pattern;
          game.ctx.vegitation.fillRect(offsetX, offsetY, granularity, granularity);
          game.ctx.vegitation.restore();
        } else if (amount > 50) {
          pattern = game.ctx.vegitation.createPattern(game.crop.image[1], 'repeat');
          game.ctx.vegitation.save();
          game.ctx.vegitation.fillStyle = pattern;
          game.ctx.vegitation.fillRect(offsetX, offsetY, granularity, granularity);
          game.ctx.vegitation.restore();
          console.log("using pattern 1");
        }
      }
      return console.log("Grow", patchX, patchY, category, amount);
    };
	
	$('#clear-game-path').on('click', function() {
      return game.path = [];
    });
	
	function displayCurrentButtonSelected() {
		$('#manual-till').removeClass('simulation-button-selected');
		$('#manual-plant').removeClass('simulation-button-selected');
		$('#manual-harvest').removeClass('simulation-button-selected');
	
		if (game.state == 'tilling')
			$('#manual-till').addClass('simulation-button-selected');
		else if (game.state == 'planting')	
			$('#manual-plant').addClass('simulation-button-selected');
		else if (game.state == 'harvesting')	
			$('#manual-harvest').addClass('simulation-button-selected');
	}
	
    $('#manual-till').on('click', function() {
      game.state = 'tilling';
	  displayCurrentButtonSelected();
      game.viewport.target = game.tractor;
      return game.path = [];
    });
    $('#auto-till').on('click', function() {
      return $('#field-select-modal').modal().one('hidden.bs.modal', function() {
        var field_id, pattern;
        field_id = $('input[name="field_id"]:checked').val();
        pattern = game.ctx.terrain.createPattern(game.plow.stamp, 'repeat');
        game.ctx.terrain.save();
        game.ctx.terrain.fillStyle = pattern;
        game.ctx.terrain.beginPath();
        simulation.size.fields[field_id].bounds.forEach(function(corner) {
          return game.ctx.terrain.lineTo(corner.x * simulation.size.granularity, corner.y * simulation.size.granularity);
        });
        game.ctx.terrain.closePath();
        game.ctx.terrain.fill();
        game.ctx.terrain.restore();
        return simulation.postMessage({
          type: 'till',
          field: field_id
        });
      });
    });
    $('#manual-plant').on('click', function() {
      return $('#crop-select-modal').modal().one('hidden.bs.modal', function() {
        var crop_id;
        crop_id = $('input[name="crop_id"]').val();
        if (crop_id !== -1) {
          game.state = 'planting';
		  displayCurrentButtonSelected();
          game.viewport.target = game.tractor;
          return game.path = [];
        }
      });
    });
    $('#auto-plant').on('click', function() {
      return $('#crop-select-modal').modal().one('hidden.bs.modal', function() {
        var crop_id;
        crop_id = $('input[name="crop_id"]').val();
        if (crop_id !== -1) {
          return $('#field-select-modal').modal().one('hidden.bs.modal', function() {
            var field_id, pattern;
            field_id = $('input[name="field_id"]:checked').val();
            if (field_id !== -1) {
              pattern = game.ctx.terrain.createPattern(game.drill.stamp, 'repeat');
              game.ctx.terrain.save();
              game.ctx.terrain.fillStyle = pattern;
              game.ctx.terrain.beginPath();
              simulation.size.fields[field_id].bounds.forEach(function(corner) {
                return game.ctx.terrain.lineTo(corner.x * simulation.size.granularity, corner.y * simulation.size.granularity);
              });
              game.ctx.terrain.closePath();
              game.ctx.terrain.fill();
              game.ctx.terrain.restore();
              return simulation.worker.postMessage({
                type: 'plant',
                crop: crop_id,
                field: field_id
              });
            }
          });
        }
      });
    });
    $('#crop-select-modal-cancel').on('click', function() {
      return $('input[name="crop_id"]').val(-1);
    });
    $('#crops a').on('click', function(event) {
      var crop_id;
      event.preventDefault();
      crop_id = $(this).parent().data('id');
      $('input[name="crop_id"]').val(crop_id);
      $('#crop-select-modal').modal('hide');
      return false;
    });
    $('#manual-harvest').on('click', function() {
      game.state = 'harvesting';
	  displayCurrentButtonSelected();
      return game.viewport.target = game.combine;
    });
    $('#field-select-map polygon').on('click', function() {
      var boxes, index;
      index = $(this).data('field-index');
      boxes = $("input[name=field_id]");
      boxes.prop('checked', false).parent().removeClass("active");
      console.log(index);
      return boxes.filter("[value=" + index + "]").prop('checked', true).parent().addClass("active");
    });
    run = $('#simulation-run');
    pause = $('#simulation-pause');
    restart = $('#simulation-restart');
	
	// Hide these buttons until run is clicked
	pause.hide();
	restart.hide();
	
	// Add an option to skip ahead a month?
	
    step = function() {
		if (simulation.paused != true) // !!! if paused, do not update game data.
		{
			console.log('step');
			simulation.worker.postMessage({
				type: 'tick'
			});
			updateGame();
		}
		return renderGame(); // !!! renderGame() function will still update, allowing users to draw paths before the simulation starts, or even while the simulation is paused.
    };
	
	// !!! Start interval (with paused set to 'true') so that we can draw paths before running the simulation itself.
	simulation.paused = true;
	simulation.interval = setInterval(step, 100);
	
	
	
	
	//window.onload = function(){
	//================================
	// PAN VIEWPORT:
	var panmenu = $('#simulation-pan-arrow-menu');
	var panviewportup = $('#simulation-pan-up');
	var panviewportdown = $('#simulation-pan-down');
	var panviewportleft = $('#simulation-pan-left');
	var panviewportright = $('#simulation-pan-right');
	var panviewportcenter = $('#simulation-pan-center');
	var movementIncrement = 10;
	
	/*
	panviewportup.on('click', function() {
		if (game.viewport.y - movementIncrement >= 0) game.viewport.y = game.viewport.y - movementIncrement;
	});
	panviewportdown.on('click', function() {
		if (game.viewport.y + movementIncrement + game.viewport.height <= game.height) game.viewport.y = game.viewport.y + movementIncrement;
	});
	panviewportleft.on('click', function() {
		if (game.viewport.x - movementIncrement >= 0) game.viewport.x = game.viewport.x - movementIncrement;
	});
	panviewportright.on('click', function() {
		if (game.viewport.x + movementIncrement + game.viewport.width <= game.width) game.viewport.x = game.viewport.x + movementIncrement;
	});
	*/
	
	// Will continually pan viewport while arrow button is held down
	var intervalId;
	var intervalDelayStartId; // delay before starting loop so users can "tap" the movement arrows and move the viewport only one increment
	panviewportup.mousedown(function() {
		if (game.viewport.y - movementIncrement >= 0) game.viewport.y = game.viewport.y - movementIncrement;
		intervalDelayStartId = setTimeout(function(){
			intervalId = setInterval(function(){
				if (game.viewport.y - movementIncrement >= 0) game.viewport.y = game.viewport.y - movementIncrement;
			}, 100);
		}, 500);
	}).mouseup(function() {
		clearInterval(intervalId);
		clearTimeout(intervalDelayStartId);
	}).mouseout(function() {  // Cleanup in case user moves mouse OFF the button before they let go of the mouse
		clearInterval(intervalId);
		clearTimeout(intervalDelayStartId);
	});
	panviewportdown.mousedown(function() {
		if (game.viewport.y + movementIncrement + game.viewport.height <= game.height) game.viewport.y = game.viewport.y + movementIncrement;
		intervalDelayStartId = setTimeout(function(){
			intervalId = setInterval(function(){
				if (game.viewport.y + movementIncrement + game.viewport.height <= game.height) game.viewport.y = game.viewport.y + movementIncrement;
			}, 100);
		}, 500);
	}).mouseup(function() {
		clearInterval(intervalId);
		clearTimeout(intervalDelayStartId);
	}).mouseout(function() {  // Cleanup in case user moves mouse OFF the button before they let go of the mouse
		clearInterval(intervalId);
		clearTimeout(intervalDelayStartId);
	});
	panviewportleft.mousedown(function() {
		if (game.viewport.x - movementIncrement >= 0) game.viewport.x = game.viewport.x - movementIncrement;
		intervalDelayStartId = setTimeout(function(){
			intervalId = setInterval(function(){
				if (game.viewport.x - movementIncrement >= 0) game.viewport.x = game.viewport.x - movementIncrement;
			}, 100);
		}, 500);
	}).mouseup(function() {
		clearInterval(intervalId);
		clearTimeout(intervalDelayStartId);
	}).mouseout(function() {  // Cleanup in case user moves mouse OFF the button before they let go of the mouse
		clearInterval(intervalId);
		clearTimeout(intervalDelayStartId);
	});
	panviewportright.mousedown(function() {
		if (game.viewport.x + movementIncrement + game.viewport.width <= game.width) game.viewport.x = game.viewport.x + movementIncrement;
		intervalDelayStartId = setTimeout(function(){
			intervalId = setInterval(function(){
				if (game.viewport.x + movementIncrement + game.viewport.width <= game.width) game.viewport.x = game.viewport.x + movementIncrement;
			}, 100);
		}, 500);
	}).mouseup(function() {
		clearInterval(intervalId);
		clearTimeout(intervalDelayStartId);
	}).mouseout(function() { // Cleanup in case user moves mouse OFF the button before they let go of the mouse
		clearInterval(intervalId);
		clearTimeout(intervalDelayStartId);
	});
	
	// Center viewport on tractor's current location (find tractor)
	panviewportcenter.on('click', function() {
	  if (game.width <= game.viewport.width) { // Do not pan if simulation size is smaller than the canvas screen size.
		game.viewport.x = 0;
      } else if (game.viewport.target.x < game.viewport.width / 2) {
        game.viewport.x = 0;
      } else if (game.viewport.target.x > game.width - game.viewport.width / 2) {
        game.viewport.x = game.width - game.viewport.width;
      } else {
        game.viewport.x = game.viewport.target.x - game.viewport.width / 2;
      }
	  if (game.height <= game.viewport.height) { // Do not pan if simulation size is smaller than the canvas screen size.
		return game.viewport.y = 0;
      } else if (game.viewport.target.y < game.viewport.height / 2) {
        return game.viewport.y = 0;
      } else if (game.viewport.target.y > game.height - game.viewport.height / 2) {
        return game.viewport.y = game.height - game.viewport.height;
      } else {
        return game.viewport.y = game.viewport.target.y - game.viewport.height / 2;
      }
	});
	
	
	
	// Hide viewport pan options that are not needed to see the full width and height of this game.
	setTimeout(function(){
		if (game.width <= game.viewport.width && game.height <= game.viewport.height)
		{
			panmenu.hide();
		}
		else
		{
			panmenu.show();
			panmenu.css('display', 'block');
			
			if (game.width <= game.viewport.width)
			{
				panviewportright.hide();
				panviewportleft.hide();
			}
			else
			{
				panviewportright.show();
				panviewportleft.show();
			}
			if (game.height <= game.viewport.height)
			{
				panviewportup.hide();
				panviewportdown.hide();
			}
			else
			{
				panviewportup.show();
				panviewportdown.show();
			}
		}
	}, 2000);
	//================================
	//}, 2000);
	
	
	
	
    run.on('click', function() {
      console.log('before step');
		if (!simulation.interval) // !!! Start interval if NOT started already (this should not ever be triggered with current implementation).
		{
			simulation.interval = setInterval(step, 100);
		}
	  
		// Hide the run button
		run.hide();
		// Show these buttons when run is clicked
		pause.show();
		restart.show();
	  
      return simulation.paused = false;
    });
    pause.on('click', function() {
		//clearInterval(simulation.interval); // !!! Disabled so that renderGame() function updates, allowing users to draw paths before the simulation starts, or even while the simulation is paused.
		
		run.show(); // Show the run button
		pause.hide(); // Hide the pause button
		
      return simulation.paused = true;
    });
    return restart.on('click', function() {
      //clearInterval(simulation.interval); // !!! Disabled so that renderGame() function updates, allowing users to draw paths before the simulation starts, or even while the simulation is paused.
      simulation.paused = true;
	  
		$('#farm-display').html(''); // Remove the old canvas element before adding the new one.
		run.show(); // Show the run button
		pause.hide(); // Hide the pause button
	  
      return simulation.worker.postMessage({
        type: 'init'
      });
    });
  }
});
