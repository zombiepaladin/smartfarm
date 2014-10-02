var clampAngle, steerAngle, wrapAngle;

wrapAngle = function(angle) {
  while (angle < -Math.PI) {
    angle += 2 * Math.PI;
  }
  while (angle > Math.PI) {
    angle -= 2 * Math.PI;
  }
  return angle;
};

clampAngle = function(angle, min, max) {
  if (angle < min) {
    angle = min;
  }
  if (angle > max) {
    angle = max;
  }
  return angle;
};

steerAngle = function(desired, current, speed) {
  var angle;
  angle = wrapAngle(desired - current);
  angle = clampAngle(angle, -speed, speed);
  angle = wrapAngle(angle + current);
  return angle;
};

jQuery(function() {
  var game, growCrop, initializeCropDataLayers, initializeDataLayers, initializeGame, layerColors, pause, renderGame, restart, run, saveButton, simulation, step, updateCropDataLayer, updateGame, updateSize, updateSoilDataLayer, updateTime, updateWeather;
  if ($('#simulation-form').size() > 0) {
    $(".farm [data-id='" + ($('#simulation_farm_id').data('id')) + "']").detach().appendTo('#selected-farms');
    $(".weather [data-id='" + ($('#simulation_weather_id').data('id')) + "']").appendTo('#selected-weather');
    $('.farm a').on('click', function(event) {
      var selected;
      event.preventDefault();
      $('#selected-farm').children().detach().appendTo("#unselected-farms");
      selected = $(this).parent().detach().appendTo('#selected-farm');
      $('#simulation_farm_id').val(selected.data('id'));
      return false;
    });
    $('.weather a').on('click', function(event) {
      var selected;
      event.preventDefault();
      $('#selected-weather').children().detach().appendTo("#unselected-weater");
      selected = $(this).parent().detach().appendTo('#selected-weather');
      $('#simulation_weather_id').val(selected.data('id'));
      return false;
    });
    $('.soil a').on('click', function(event) {
      var selected;
      event.preventDefault();
      $('#selected-soil').children().detach().appendTo("#unselected-soils");
      selected = $(this).parent().detach().appendTo('#selected-soil');
      $('#simulation_soil_id').val(selected.data('id'));
      return false;
    });
    $('.farm .btn').remove();
    $('.weather .btn').remove();
    $('.soil .btn').remove();
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
      $('#simulation_state').val(JSON.stringify(simulation));
      return console.log(simulation);
    });
  }
  if ($('#simulation-controls').length > 0) {
    game = {
      state: 'observer',
      mouse: {
        x: 0,
        y: 0
      }
    };
    $(document).on('mousemove', function(me) {
      var offset;
      offset = $('#farm-display').offset();
      game.mouse.x = me.pageX - offset.left;
      return game.mouse.y = me.pageY - offset.top;
    });
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
    simulation.worker.postMessage({
      type: 'init'
    });
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
    updateSize = function(size) {
      simulation.size = size;
      initializeGame(size);
      return initializeDataLayers(size);
    };
    initializeDataLayers = function(size) {
      var attributes, cropDataLayers, ctx, fields, soilDataLayers, soilLayerCheckboxes;
      soilDataLayers = $('#soil-data-layers');
      fields = $("<canvas id='fields' class='layer' width=" + (size.width * 50) + " height=" + (size.height * 50) + ">");
      ctx = fields[0].getContext('2d');
      console.log(simulation.size);
      simulation.size.fields.forEach(function(field) {
        ctx.beginPath();
        field.bounds.forEach(function(corner) {
          return ctx.lineTo(corner.x * 50, corner.y * 50);
        });
        ctx.closePath();
        return ctx.stroke();
      });
      soilDataLayers.append(fields);
      soilLayerCheckboxes = $('#soil-data-layer-checkboxes');
      attributes = ["snow_cover", "water_content", "wilting_point", "percolation_travel_time", "porosity", "nitrate", "ammonium", "fresh_organic_nitrogen", "active_organic_nitrogen", "stable_organic_nitrogen", "labile_phosphorus", "fresh_organic_phosphorus", "bound_organic_phosphorus", "active_mineral_phosphorus", "stable_mineral_phosphorus", "flat_residue_carbon", "humus_carbon"];
      attributes.forEach(function(name) {
        var layer;
        layer = $("<canvas id='" + name + "' class='layer' width=" + size.width + " height=" + size.height + " style='display: none;'></canvas>");
        simulation.soilLayerContexts[name] = layer[0].getContext('2d');
        soilDataLayers.prepend(layer);
        return soilLayerCheckboxes.append("<div class='checkbox'><label for='cb_" + name + "'><input name='" + name + "' id='cb_" + name + "' type='checkbox'>" + (name.replace('_', ' ').replace('_', ' ')) + "</label></div>");
      });
      $('#soil-data-layer-checkboxes input').on('change', function(event) {
        return $('#' + $(this).attr('name')).toggle();
      });
      cropDataLayers = $('#crop-data-layers');
      fields = $("<canvas id='fields' class='layer' width=" + (size.width * 50) + " height=" + (size.height * 50) + ">");
      ctx = fields[0].getContext('2d');
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
      $('#calendar-day').html(simtime.getDate());
      return $('#simulation-clock').html(simtime.getHours() + ':' + ('0' + simtime.getMinutes()).slice(-2));
    };
    updateWeather = function(weather) {
      return simulation.weather = weather;
    };
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
    game.combine = {
      x: 0,
      y: 0,
      angle: 0,
      active: false,
      image: new Image()
    };
    game.combine.image.src = "/images/combine.png";
    game.tractor = {
      x: 0,
      y: 0,
      angle: 0,
      image: new Image()
    };
    game.tractor.image.src = "/images/tractor.png";
    game.plow = {
      x: 0,
      y: 0,
      angle: 0,
      active: false,
      image: new Image(),
      stamp: new Image()
    };
    game.plow.image.src = "/images/plow.png";
    game.plow.stamp.src = "/images/plow_trail.png";
    game.drill = {
      x: 0,
      y: 0,
      angle: 0,
      active: false,
      image: new Image(),
      stamp: new Image(),
      seed: new Image()
    };
    game.drill.image.src = "/images/drill.png";
    game.drill.stamp.src = "/images/drill_trail.png";
    game.drill.seed.src = "/images/drill_seed.png";
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
    game.weather.rain.image.src = "/images/rain.png";
    game.weather.snow.image.src = "/images/snow.png";
    game.weather.snow_cover.image.src = "/images/snow_cover.png";
    game.crop = {
      image: []
    };
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
          game.path = [];
		  
		  var myX = x - offset.left + game.viewport.x;
		  var myY = y - offset.top + game.viewport.y;
		  //if (myX > game.width) myX = game.width;
		  //if (myY > game.height) myY = game.height;
		   
		  //if (myX <= game.width && myY <= game.height) {
			  game.path.push({
				x: myX,
				y: myY
			  });
		  //}
          return game.tracking = true;
        }
      };
      inputMove = function(x, y) {
        var offset;
        if (game.tracking && (game.state === 'tilling' || game.state === 'planting' || game.state === 'harvesting')) {
          offset = $('#farm-display').offset();
          return game.path.push({
            x: x - offset.left + game.viewport.x,
            y: y - offset.top + game.viewport.y
          });
        }
      };
      inputUp = function(x, y) {
        var offset;
        if (game.tracking && (game.state === 'tilling' || game.state === 'planting' || game.state === 'harvesting')) {
          offset = $('#farm-display').offset();
          game.path.push({
            x: x - offset.left + game.viewport.x,
            y: y - offset.top + game.viewport.y
          });
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
    $('#manual-till').on('click', function() {
      game.state = 'tilling';
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
      console.log('step');
      simulation.worker.postMessage({
        type: 'tick'
      });
      updateGame();
      return renderGame();
    };
    run.on('click', function() {
      console.log('before step');
      simulation.interval = setInterval(step, 100);
	  
		// Hide the run button
		run.hide();
		// Show these buttons when run is clicked
		pause.show();
		restart.show();
	  
      return simulation.paused = false;
    });
    pause.on('click', function() {
      clearInterval(simulation.interval);
		//alert("paused");
		
		run.show(); // Show the run button
		pause.hide(); // Hide the pause button
		
      return simulation.paused = true;
    });
    return restart.on('click', function() {
      clearInterval(simulation.interval);
      simulation.paused = true;
	  
		run.show(); // Show the run button
		pause.hide(); // Hide the pause button
	  
      return simulation.worker.postMessage({
        type: 'init'
      });
    });
  }
});