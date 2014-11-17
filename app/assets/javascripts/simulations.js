// Global variables/settings
var panViewportToFollowTractor = true;
var canvasDimensions = [800, 600];
var clampAngle, steerAngle, wrapAngle;
var globalDrawGranularityGuidelines = false;
var globalTractorSteeringRadius = Math.PI / 2; // Math.PI / 8

//var globalLastPathLinkChecked = -1; // Setting this to -1 tells the step to re-render the page

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
	var field_id = 0;
  
	//if we have necessary items (farm, weather, soil) to perform simulation
	if ($('#simulation-form').size() > 0) {

		//add a farm to #selected-farms
		$(".farm [data-id='" + ($('#simulation_farm_id').data('id')) + "']").detach().appendTo('#selected-farms');

		//add a weather pattern to #selected-weather
		$(".weather [data-id='" + ($('#simulation_weather_id').data('id')) + "']").appendTo('#selected-weather');

		//adds and removes farms between #selected-farm
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
			simulation.soil = {
				id: $('#simulation_soil_id').val()
			};

			//set the simulation_state to have the simulation farm and weather
			$('#simulation_state').val(JSON.stringify(simulation));
			return console.log(simulation);
		});
	}

//this if statement goes to the end of the script
//simulation-controls is the calendar, clock, run, pause, reset buttons
if ($('#simulation-controls').length > 0) {

	//game is an object with attributes 'state' and 'mouse'
	//mouse is an object with attributes 'x' and 'y'
	game = {
		state: 'observer',
		currentfield: 0,
		currentcrop: 0,
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

	//onmessage is the message received from the worker
	//when a message returns from the worker thread,
	//perform an action based on the 'msg.data.type'
	simulation.worker.onmessage = function(msg) {
		//console.log(msg.data);
		switch (msg.data.type) {
			case 'size_update':
				updateSize(msg.data.size);
				break;
			case 'time_update':
				updateTime(msg.data.time);
				break;
			case 'weather_update':
				updateWeather(msg.data.weather);
				break;
			case 'soil_data_layer_update':
				updateSoilDataLayer(msg.data.layer_name, msg.data.layer_data);
				break;
			case 'crop_initialize':
				initializeCropDataLayers(msg.data.crop_id, msg.data.crop_name);
				break;
			case 'crop_data_layer_update':
				updateCropDataLayer(msg.data.crop_id, msg.data.layer_name, msg.data.layer_data);
				break;
			default:
				break;
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
		initializeDataLayers(size);
	};

	//initializes the data within the soil and crop objects
	initializeDataLayers = function(size) {
		var attributes, cropDataLayers, ctx, fields, soilDataLayers, soilLayerCheckboxes;
		soilDataLayers = $('#soil-data-layers');
		fields = $("<canvas id='fields' class='layer' width=" + (size.width * 50) + " height=" + (size.height * 50) + ">");

		//ctx contains the properties and methods to draw on the canvas
		ctx = fields[0].getContext('2d');

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
				break;
			default:
				$('#calendar-month').html('Jan');
				break;
		}

		//update the calendar to show the numeric date and the simulation clock to show the time
		$('#calendar-day').html(simtime.getDate());
		return $('#simulation-clock').html(simtime.getHours() + ':' + ('0' + simtime.getMinutes()).slice(-2));
	};

	//set the weather within the simulation object
	updateWeather = function(weather) {
		return simulation.weather = weather;
	};

	//what should we do when the field has been tilled??
	tillField = function(fieldIndex) {
		//fieldIndex not used (multiple fields not implemented yet)
		simulation.soilLayerContexts = {}; //reset soil layers
		attributes = ["snow_cover", "water_content", "wilting_point", "percolation_travel_time", "porosity", "nitrate", "ammonium", "fresh_organic_nitrogen", "active_organic_nitrogen", "stable_organic_nitrogen", "labile_phosphorus", "fresh_organic_phosphorus", "bound_organic_phosphorus", "active_mineral_phosphorus", "stable_mineral_phosphorus", "flat_residue_carbon", "humus_carbon"];

		//add each of the weather attributes as a checkbox within the Legend
		attributes.forEach(function(name) {
			var layer;
			layer = $("<canvas id='" + name + "' class='layer' width=" + size.width + " height=" + size.height + " style='display: none;'></canvas>");
			simulation.soilLayerContexts[name] = layer[0].getContext('2d');
			soilDataLayers.prepend(layer);
		});
		
		//update the game object to reflect changes?
		alert("Fields reset?");
	};

	
	//colors the soil with the RGB values from the layerColors dictionary
	updateSoilDataLayer = function(name, data) {
		var brush, brushData, offset, x, y;
		if (name === 'snow_cover') {
			game.weather.snow_cover.data = data;
		}
		brush = simulation.soilLayerContexts[name].createImageData(1, 1);
		brushData = brush.data;
		brushData[0] = layerColors[name][0];
		brushData[1] = layerColors[name][1];
		brushData[2] = layerColors[name][2];
		for (y = 0; y < simulation.size.height; y++)
		{
			offset = y * simulation.size.width;
			for (x = 0; x < simulation.size.width; x++)
			{
				brushData[3] = data[x + offset];
				simulation.soilLayerContexts[name].putImageData(brush, x, y);
			}
		}
	};

	//colors the crops with the RGB from the layerColors dictionary
	updateCropDataLayer = function(id, name, data) {
		var brush, brushData, offset, x, y;
		brush = simulation.cropLayerContexts[id][name].createImageData(1, 1);
		brushData = brush.data;
		brushData[0] = layerColors[name][0];
		brushData[1] = layerColors[name][1];
		brushData[2] = layerColors[name][2];
		for (y = 0; y < simulation.size.height; y++)
		{
			offset = y * simulation.size.width;
			for (x = 0; x < simulation.size.width; x++)
			{
				brushData[3] = data[x + offset];
				simulation.cropLayerContexts[id][name].putImageData(brush, x, y);
				if (data[x + offset] > 0)
				{
					growCrop(x, y, name, data[x + offset]);
				}
			}
		}
	};

	//the object to hold our combine (tiller)
	game.combine = {
		x: 0,
		y: 0,
		angle: 0,
		active: false,
		image: new Image(),
		width: 18.288 // 60ft
	};

	//the object to hold our tractor
	game.tractor = {
		x: 0,
		y: 0,
		angle: 0,
		image: new Image(),
		//width: 18.288 // 60ft
	};

	//the object to hold our plow
	game.plow = {
		x: 0,
		y: 0,
		angle: 0,
		active: false,
		image: new Image(),
		stamp: new Image(),
		width: 18.288 // 60ft
	};
	
	//the object for our drill
	game.drill = {
		x: 0,
		y: 0,
		angle: 0,
		active: false,
		image: new Image(),
		stamp: new Image(),
		seed: new Image(),
		width: 18.288 // 60ft
	};

	//the image for our farm
	game.combine.image.src = "/images/combine.png";
	game.tractor.image.src = "/images/tractor.png";
	game.plow.image.src = "/images/plow.png";
	game.plow.stamp.src = "/images/plow_trail.png";
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

	//1px = 1meter
	//vegetation is misspelled
	initializeGame = function() {
		var inputDown, inputMove, inputUp, touchEvents, touchHandler;
		game.width = simulation.size.width * simulation.size.granularity;
		game.height = simulation.size.height * simulation.size.granularity;
		game.buffers = {
			front: $("<canvas width=" + canvasDimensions[0] + " height=" + canvasDimensions[1] + ">")[0],
			//front: $("<canvas width=" + game.width + " height=" + game.height + ">")[0],
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
			width: canvasDimensions[0],
			height: canvasDimensions[1],
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
		//set the looks for the terrain
		game.ctx.terrain.fillStyle = 'tan';
		game.ctx.terrain.fillRect(0, 0, game.width, game.height);
		game.ctx.terrain.strokeStyle = 'yellow';
		game.ctx.terrain.lineWidth = 5;
		
		var field_id = 0;
		simulation.size.fields.forEach(function(field) {
			
			field.poly = new PolygonGrid(field_id); //(game, simulation);
			field_id++;
			
			// Provides data on whether a set of coordinates are inside or outside the field boundaries
			// var stepSizeY = game.height / simulation.size.granularity;
			// var stepSizeX = game.width / simulation.size.granularity;
			// var polyGrid = getPolyGrid(field_id);
			// field.poly = {
				// grid: polyGrid,
				// stepX: stepSizeX,
				// stepY: stepSizeY,
				
			// };
		
			game.ctx.terrain.beginPath();
			field.bounds.forEach(function(corner) {
				return game.ctx.terrain.lineTo(corner.x * simulation.size.granularity, corner.y * simulation.size.granularity);
			});
			game.ctx.terrain.closePath();
			game.ctx.terrain.stroke();
		});
		
		game.path = [];
		game.tracking = false;
	  
		//translate touch events to mouse events
		touchEvents = {};
		touchEvents.touchMapper = {
			"touchstart": "mousedown",
			"touchmove": "mousemove",
			"touchend": "mouseup"
		};
		touchHandler = function(event) {
			var mappedEvent, simulatedEvent, touchPoint;
			//return on multi-touch
			if (event.touches.length > 1) {
				return;
			}
			touchPoint = event.changedTouches[0];
			mappedEvent = touchMapper[event.type];
			//if the touch event is something we haven't translated to a mouse event, ignore it
			if (mappedEvent === null) {
				return;
			}
			alert("HERE"); //testing successful touch translation
			simulatedEvent = document.createEvent("MouseEvent");
			simulatedEvent.initMouseEvent(mappedEvent, true, true, window, 1, touchPoint.screenX, touchPoint.screenY, touchPoint.clientX, touchPoint.clientY, false, false, false, false, 0, null);
			touchPoint.target.dispatchEvent(simulatedEvent);
			return event.preventDefault();
		};
		$('#farm-display')[0].ontouchstart = touchHandler;
		$('#farm-display')[0].ontouchmove = Blockly.TouchEvents.touchHandler;
		$('#farm-display')[0].ontouchend = Blockly.TouchEvents.touchHandler;
	  
		//allow the user to draw with the mouse is held down
		$('#farm-display').on('mousedown', function(me) {
			inputDown(me.pageX, me.pageY);
			me.preventDefault;
			return false;
		});

		//allow the user to move while drawing
		$('#farm-display').on('mousemove', function(me) {
			inputMove(me.pageX, me.pageY);
			me.preventDefault();
			return false;
		});

		//stop the user from drawing while the mouse is up
		$('#farm-display').on('mouseup', function(me) {
			inputUp(me.pageX, me.pageY);
			me.preventDefault();
			return false;
		});

		//occurs when leaving the outer perimeter of the element and
		//occurs when leaving the inner perimeter of the element into a child element
		$('#farm-display').on('mouseout', function(me) { // prevent errors
			inputUp(me.pageX, me.pageY);
			me.preventDefault();
			return false;
		});
	  
		//occurs when leaving the outer perimeter of the element only
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
	  
		//if the user is tilling, planting, or harvesting
		//add the mouse's initial x and y coordinates into the game.path array
		//set game.tracking to true (user has begun drawing)
		inputDown = function(x, y) {
		var offset, myX, myY;
			if (game.state === 'tilling' || game.state === 'planting' || game.state === 'harvesting') {
				offset = $('#farm-display').offset();
				//game.path = []; // erases old path when you start a new one.
				myX = x - offset.left + game.viewport.x;
				myY = y - offset.top + game.viewport.y;
				if (myX <= game.width && myY <= game.height) {
					game.path.push({
						x: myX,
						y: myY
					});
				}
				return game.tracking = true;
			}
		};

		//push the mouse's coordinates into the game.path array
		//while the mouse is held down and dragged (user is drawing)
		inputMove = function(x, y) {
			var offset, myX, myY;
			if (game.tracking && (game.state === 'tilling' || game.state === 'planting' || game.state === 'harvesting')) {
				offset = $('#farm-display').offset();
				myX = x - offset.left + game.viewport.x;
				myY = y - offset.top + game.viewport.y;

				if (myX <= game.width && myY <= game.height) {
					game.path.push({
						x: myX,
						y: myY
					});
				}
			}
		};

		//add the ending mouse coordinates to the game.path array
		//set game.tracking to false (user is no longer drawing)
		inputUp = function(x, y) {
			var offset, myX, myY;
			if (game.tracking && (game.state === 'tilling' || game.state === 'planting' || game.state === 'harvesting')) {
				offset = $('#farm-display').offset();
				myX = x - offset.left + game.viewport.x;
				myY = y - offset.top + game.viewport.y;

				if (myX <= game.width && myY <= game.height) {
					game.path.push({
						x: myX,
						y: myY
					});
				}
				return game.tracking = false;
			}
		};

		game.animation_frame = window.requestAnimationFrame(function() {
			return renderGame();
		});

		game.ctx.front.drawImage(game.buffers.terrain, 0, 0);
		
//=============================== PAN VIEWPORT CONTROLS (begin) ==============
		// Show/Hide pan menu on page
		if (game.width <= game.viewport.width && game.height <= game.viewport.height)
		{
			panmenu.hide();
			viewportlabel.hide();
			$('#simulation-expand-viewport-button').hide();
			$('#simulation-shrink-viewport-button').hide();
		}
		else
		{
			viewportlabel.show();
			viewportlabel.css('display', 'block');
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
		
		// Arrow key controls
		$(document).keydown(function(e) { // '#farm-display canvas'
			var code = e.keyCode;
			//console.log(code);
			switch(code) {
			case 37:
				e.preventDefault();
				panViewportMovement("left"); break;
			case 38:
				e.preventDefault();
				panViewportMovement("up"); break;
			case 39:
				e.preventDefault();
				panViewportMovement("right"); break;
			case 40:
				e.preventDefault();
				panViewportMovement("down"); break;
			default:
				break;
			}
		});
//================================== PAN VIEWPORT CONTROLS (end) ==============

		return $('#farm #farm-display').append(game.buffers.front);
    };

	updateGame = function() {
		var distance, dx, dy, speed, x, y;
		//console.log(game.state);
		switch (game.state) {
			case 'tilling':
				dy = 0;
				dx = 0;
				while (game.path.length > 0) {
					dy = game.path[0].y - game.tractor.y;
					dx = game.path[0].x - game.tractor.x;
					distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < 12) {
						if (game.path[0].noaction) game.plow.active = false; // so we can travel without tilling
						else game.plow.active = true;
						game.path.shift();
					}
					else {
						break; //break while loop;
					}
				}
				if (game.path.length === 0) {
					game.plow.active = false;
				}
				else {
					speed = 5;
					game.tractor.angle = steerAngle(Math.atan2(dy, dx), game.tractor.angle, globalTractorSteeringRadius);
					game.tractor.x += speed * Math.cos(game.tractor.angle);
					game.tractor.y += speed * Math.sin(game.tractor.angle);
					
					game.plow.x = -5 * Math.cos(game.tractor.angle) + game.tractor.x;
					game.plow.y = -5 * Math.sin(game.tractor.angle) + game.tractor.y;
					//game.plow.x = game.tractor.x;
					//game.plow.y = game.tractor.y;
					
					game.plow.angle = steerAngle(game.tractor.angle, game.plow.angle, Math.PI / 16);
					if (game.plow.active) {
						game.ctx.terrain.save();
						game.ctx.terrain.fillStyle = '#3d1f00';
						/*
						x = game.plow.x;
						y = game.plow.y;
						game.ctx.terrain.translate(x, y);
						game.ctx.terrain.rotate(game.plow.angle);
						game.ctx.terrain.drawImage(game.plow.stamp, -22, -9);
						*/
						// ???
						
						x = game.tractor.x;
						y = game.tractor.y;
						game.ctx.terrain.translate(x, y);
						game.ctx.terrain.rotate(game.tractor.angle);
						game.ctx.terrain.drawImage(game.plow.stamp, 0, -9);
						
						game.ctx.terrain.restore();
						
						
						
						// Erase crops
+						game.ctx.vegitation.save();
+						game.ctx.vegitation.beginPath();
+						game.ctx.vegitation.translate(x, y);
+						game.ctx.vegitation.rotate(game.plow.angle);
+						game.ctx.vegitation.clearRect(0, -game.plow.width/2, -game.plow.width, game.combine.width); // ???
+						//game.ctx.vegitation.fill();
+						//game.ctx.vegitation.strokeStyle = "limegreen";
+						//game.ctx.vegitation.rect(0, -game.plow.width/2, -game.plow.width, game.combine.width); // ???
+						//game.ctx.vegitation.stroke();
+						game.ctx.vegitation.restore();
						
						
						
						
						// ???
						var widthOfTool = game.plow.width; // 18.288; // 60 meters
						widthOfTool = Math.round(widthOfTool/(game.height/simulation.size.granularity));
						for (var i = 0; i < widthOfTool; i++)
						{
							simulation.worker.postMessage({
								type: 'till',
								field: game.currentfield,
								x: x,
								y: y+i
							});
						}

					
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
						if (game.path[0].noaction) game.drill.active = false; // so we can travel without tilling
						else game.drill.active = true;
						game.path.shift();
					}
					else {
						break;
					}
				}
				if (game.path.length === 0) {
					game.drill.active = false;
				}
				else {
					speed = 5;
					game.tractor.angle = steerAngle(Math.atan2(dy, dx), game.tractor.angle, globalTractorSteeringRadius);
					game.tractor.x += speed * Math.cos(game.tractor.angle);
					game.tractor.y += speed * Math.sin(game.tractor.angle);
					game.drill.x = -5 * Math.cos(game.tractor.angle) + game.tractor.x;
					game.drill.y = -5 * Math.sin(game.tractor.angle) + game.tractor.y;
					game.drill.angle = steerAngle(game.tractor.angle, game.drill.angle, Math.PI / 16);
					if (game.drill.active) {
						game.ctx.terrain.save();
						x = game.drill.x; // drill
						y = game.drill.y; // drill
						game.ctx.terrain.translate(x, y);
						game.ctx.terrain.rotate(game.drill.angle);
						game.ctx.terrain.drawImage(game.drill.stamp, -16, -9);
						game.ctx.terrain.restore();
						game.ctx.vegitation.save();
						game.ctx.vegitation.translate(x, y);
						game.ctx.vegitation.rotate(game.drill.angle); // drill
						game.ctx.vegitation.drawImage(game.drill.seed, -16, -9);
						game.ctx.vegitation.restore();

						
						// ???
						var widthOfTool = game.combine.width; // 18.288; // 60 meters
						widthOfTool = Math.round(widthOfTool/(game.height/simulation.size.granularity));
						for (var i = 0; i < widthOfTool; i++)
						{
							simulation.worker.postMessage({
								type: 'plant',
								crop: game.currentcrop,
								field: game.currentfield,
								x: x,
								y: y+i
							});
						}
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
						if (game.path[0].noaction) game.combine.active = false; // so we can travel without tilling
						else game.combine.active = true;
						game.path.shift();
					}
					else {
						break;
					}
				}
				if (game.path.length === 0) {
					game.combine.active = false;
				}
				else {
					speed = 5;
					game.combine.angle = steerAngle(Math.atan2(dy, dx), game.combine.angle, globalTractorSteeringRadius);
					game.combine.x += speed * Math.cos(game.combine.angle);
					game.combine.y += speed * Math.sin(game.combine.angle);
					
					x = game.combine.x;
					y = game.combine.y;

					
					if (game.combine.active) {
						// ???
						var widthOfTool = game.combine.width; // 18.288; // 60 meters
						//widthOfTool = Math.round(widthOfTool/(game.height/simulation.size.granularity));
						for (var i = 0; i < widthOfTool; i++)
						{
							simulation.worker.postMessage({
								type: 'harvest',
								//crop: game.currentcrop, // Not needed, the worker will need to check to see what crop is planted in this patch.
								field: game.currentfield,
								x: x,
								y: y+i
							});
						}
						
						// Erase crops
+						game.ctx.vegitation.save();
+						game.ctx.vegitation.beginPath();
+						game.ctx.vegitation.translate(x, y);
+						game.ctx.vegitation.rotate(game.combine.angle);
+						game.ctx.vegitation.clearRect(0, -game.combine.width/2, -game.combine.width, game.combine.width); // ???
+						//game.ctx.vegitation.fill();
+						//game.ctx.vegitation.strokeStyle = "limegreen";
+						//game.ctx.vegitation.rect(0, -game.combine.width/2, -game.combine.width, game.combine.width); // ???
+						//game.ctx.vegitation.stroke();
+						game.ctx.vegitation.restore();	
					}
				}
			} //end switch
			
			//do not move the viewport to follow the tractor if the tractor is not moving
			if (panViewportToFollowTractor && game.path.length > 0)
			{
				centerViewportOnTractor();
			}
    };

	//renders the changes to the terrain
	renderGame = function() {
		var granularity, i, pattern, x, y, _i, _j, _k, _ref, _ref1, _ref2;

		//copy terrain to back buffer (effectively clearing back buffer)
		game.ctx.back.drawImage(game.buffers.terrain, 0, 0);

		//render combine
		game.ctx.back.save();      
		game.ctx.back.translate(game.combine.x, game.combine.y);
		game.ctx.back.rotate(game.combine.angle);
		game.ctx.back.drawImage(game.combine.image, -6, -9);
		game.ctx.back.restore();

		//render plow
		game.ctx.back.save();
		game.ctx.back.translate(game.plow.x, game.plow.y);
		game.ctx.back.rotate(game.plow.angle);
		game.ctx.back.drawImage(game.plow.image, -17, -9);
		game.ctx.back.restore();

		//render drill
		game.ctx.back.save();
		game.ctx.back.translate(game.drill.x, game.drill.y);
		game.ctx.back.rotate(game.drill.angle);
		game.ctx.back.drawImage(game.drill.image, -13, -9);
		game.ctx.back.restore();

		//render tractor
		game.ctx.back.save();
		game.ctx.back.translate(game.tractor.x, game.tractor.y);
		game.ctx.back.rotate(game.tractor.angle);
		game.ctx.back.drawImage(game.tractor.image, -5, -5);
		game.ctx.back.restore();

		//render precipitation
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

		//render snow cover
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

		//render snow cover
		if (game.weather.snow_cover.data) {
			game.ctx.back.save();
			pattern = game.ctx.back.createPattern(game.weather.snow_cover.image, 'repeat');
			game.ctx.back.fillStyle = pattern;
			granularity = simulation.size.granularity;
			for (x=0; x <simulation.size.width; x++)
			{
				for (y = 0; y < simulation.size.height; y++)
				{
					for (i = 0; i < Math.min(5, Math.ceil(game.weather.snow_cover.data[x + y * simulation.size.width] / 5)); i++)
					{
						game.ctx.back.fillRect(x * granularity, y * granularity, granularity, granularity);
					}
				}
			}
			game.ctx.back.restore();
		}

		//render crops
		game.ctx.back.drawImage(game.buffers.vegitation, 0, 0);

		//render equipment path
		game.ctx.back.save();
		game.ctx.back.strokeStyle = 'red';
		game.ctx.back.beginPath();

		if (game.path.length > 0) {
			game.ctx.back.moveTo(game.path[0].x, game.path[0].y);
		}
		//draws the line from point to point
		var isOnNoAction = false;
		game.path.forEach(function(point) {
		
			if (isOnNoAction != point.noaction)
			{
				isOnNoAction = point.noaction;
				game.ctx.back.stroke();
				game.ctx.back.closePath();
				game.ctx.back.moveTo(point.x, point.y);
				game.ctx.back.beginPath();
				if (point.noaction) game.ctx.back.strokeStyle = '#7A7A52';
				else game.ctx.back.strokeStyle = 'red';
			}
			
			game.ctx.back.lineTo(point.x, point.y);
		});
		game.ctx.back.stroke();
		game.ctx.back.restore();
		
		game.ctx.front.drawImage(game.buffers.back, -game.viewport.x, -game.viewport.y);
		
		
		// render granularity guidelines
		if (globalDrawGranularityGuidelines) 
		{
			simulation.size.fields.forEach(function(field) {
				field.poly.drawGrid();
			});
		}
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
			}
			else if (amount > 400) {
				pattern = game.ctx.vegitation.createPattern(game.crop.image[4], 'repeat');
				game.ctx.vegitation.save();
				game.ctx.vegitation.fillStyle = pattern;
				game.ctx.vegitation.fillRect(offsetX, offsetY, granularity, granularity);
				game.ctx.vegitation.restore();
			}
			else if (amount > 200) {
				pattern = game.ctx.vegitation.createPattern(game.crop.image[3], 'repeat');
				game.ctx.vegitation.save();
				game.ctx.vegitation.fillStyle = pattern;
				game.ctx.vegitation.fillRect(offsetX, offsetY, granularity, granularity);
				game.ctx.vegitation.restore();
			}
			else if (amount > 100) {
				pattern = game.ctx.vegitation.createPattern(game.crop.image[2], 'repeat');
				game.ctx.vegitation.save();
				game.ctx.vegitation.fillStyle = pattern;
				game.ctx.vegitation.fillRect(offsetX, offsetY, granularity, granularity);
				game.ctx.vegitation.restore();
			}
			else if (amount > 50) {
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
	
	//remove x and y coordinates from game.path
	$('#clear-game-path').on('click', function() {
		game.path = [];
	});
	
	//add a class to a button
	function clearButtonSelection() {
		$('#manual-till').removeClass('simulation-button-selected');
		$('#manual-plant').removeClass('simulation-button-selected');
		$('#manual-harvest').removeClass('simulation-button-selected');
		$('#auto-till').removeClass('simulation-button-selected');
		$('#auto-plant').removeClass('simulation-button-selected');
		$('#auto-harvest').removeClass('simulation-button-selected');
	}
	
	// This is mostly a helper for use during development
	// This draws a grid to show the "patches" created by the "granularity" of the simulation
	$('#draw-granularity').on('click', function() {
		globalDrawGranularityGuidelines = this.checked; // !globalDrawGranularityGuidelines; // Toggle guidelines
		//globalLastPathLinkChecked = -1; // Setting this to -1 tells the step to re-render the page
	});
	
	$('#toggle-granularity').on('click', function() {
		toggleGranularity();
	});
	
	function toggleGranularity()
	{
		if ($('#toggle-granularity').hasClass('simulation-button-selected'))
		{
			$('#toggle-granularity').removeClass('simulation-button-selected');
			globalDrawGranularityGuidelines = false;
		}
		else
		{
			$('#toggle-granularity').addClass('simulation-button-selected');
			globalDrawGranularityGuidelines = true;
		}
	}
	
	function setFieldId(id)
	{
		field_id = id;
	}
	
	function getFieldId()
	{
		if (typeof field_id === 'undefined' || field_id == -1)
		{
			chooseField();
		}
		return field_id;
	}
	
	function chooseField()
	{
		clearButtonSelection();
		$('#field-select-modal').modal().one('hidden.bs.modal', function() {
			var selected_field_id;
			selected_field_id = $('input[name="field_id"]:checked').val();
			if (selected_field_id !== -1) {
				setFieldId(selected_field_id);
			}
		});
	}
	
	//allows a user to manually till a field
	$('#manual-till').on('click', function() {
		var field = getFieldId();
		if (field > -1)
		{
			game.state = 'tilling';
			game.currentfield = field;
			game.viewport.target = game.tractor;
			game.path = []; // clear existing path
			clearButtonSelection();
			$('#manual-till').addClass('simulation-button-selected');
		}
	});
	
	//allows a user to automatically till a field
	$('#auto-till').on('click', function() {
		var field = getFieldId();
		if (field > -1)
		{
			game.path = [];
			game.state = 'tilling';
			game.currentfield = field;
			simulation.size.fields[field].poly.drawPath();
			clearButtonSelection();
			$('#auto-till').addClass('simulation-button-selected');
		}
    });
	
	//allows a user to begin manually planting a field
	$('#manual-plant').on('click', function() {
		return $('#crop-select-modal').modal().one('hidden.bs.modal', function() {
			var crop_id;
			crop_id = $('input[name="crop_id"]').val();
			if (crop_id !== -1) {
				var field = getFieldId();
				game.path = []; // clear existing path
				game.state = 'planting';
				game.currentfield = field;
				game.viewport.target = game.tractor;
				clearButtonSelection();
				$('#manual-plant').addClass('simulation-button-selected');
			}
		});
	});
	
	//allows a user to automatically plant a crop in a field
	$('#auto-plant').on('click', function() {
		$('#crop-select-modal').modal().one('hidden.bs.modal', function() {
			var crop_id;
			crop_id = $('input[name="crop_id"]').val();
			if (crop_id !== -1) {
				var field = getFieldId();
				game.path = [];h
				game.state = 'planting';
				game.currentfield = field;
				game.currentcrop = crop_id;
				simulation.size.fields[field].poly.drawPath();
				clearButtonSelection();
				$('#auto-plant').addClass('simulation-button-selected');
			}
		});
	});
	
	//manual harves the crop
	$('#manual-harvest').on('click', function() {
		var field = getFieldId();
		game.path = [];
		game.state = 'harvesting';
		game.currentfield = field;
		game.viewport.target = game.combine;
		clearButtonSelection();
		$('#manual-harvest').addClass('simulation-button-selected');
	});
	
	//automatically harvest the crop
	$('#auto-harvest').on('click', function() {
		var field = getFieldId();
		game.path = [];
		game.state = 'harvesting';
		game.currentfield = field;
		simulation.size.fields[field].poly.drawPath();
		clearButtonSelection();
		$('#auto-harvest').addClass('simulation-button-selected');
    });
	
	//return -1 if the user does not select a field
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

	$('#field-select-map polygon').on('click', function() {
		var boxes, index;
		index = $(this).data('field-index');
		boxes = $("input[name=field_id]");
		boxes.prop('checked', false).parent().removeClass("active");
		//console.log(index);
		return boxes.filter("[value=" + index + "]").prop('checked', true).parent().addClass("active");
	});
	
    run = $('#simulation-run');
    pause = $('#simulation-pause');
    restart = $('#simulation-restart');
	
	// Hide these buttons until run is clicked
	pause.hide();
	restart.hide();
	
	//run the simulation
    run.on('click', function() {
      //console.log('before step');
		if (!simulation.interval) // !!! Start interval if NOT started already (this should not ever be triggered with current implementation).
		{
			simulation.interval = setInterval(step, 100);
		}
		run.hide();
		pause.show();
		restart.show();
		return simulation.paused = false;
    });
	
	//pause the simulation
    pause.on('click', function() {
		//clearInterval(simulation.interval); // !!! Disabled so that renderGame() function updates, allowing users to draw paths before the simulation starts, or even while the simulation is paused.
		run.show();
		pause.hide();
		return simulation.paused = true;
    });
	
	//restart the simulation
    restart.on('click', function() {
      //clearInterval(simulation.interval); // !!! Disabled so that renderGame() function updates, allowing users to draw paths before the simulation starts, or even while the simulation is paused.
		simulation.paused = true;
		clearButtonSelection();
		$('#farm-display').html(''); // Remove the old canvas element before adding the new one.
		run.show();
		pause.hide();
		$('#toggle-granularity').removeClass('simulation-button-selected');
		globalDrawGranularityGuidelines = false;
		return simulation.worker.postMessage({ type: 'init'});
    });
	
	$('#field-select').on('click', function() {
		chooseField();
    });
	
	// Add an option to skip ahead a month?

    step = function() {
		if (simulation.paused != true) // !!! if paused, do not update game data.
		{
			//console.log('step');
			simulation.worker.postMessage({
				type: 'tick'
			});
			updateGame();
		}
		//if (game && game.path && game.path.length != globalLastPathLinkChecked) {
			//console.log("rendering...");
			//globalLastPathLinkChecked = game.path.length;
			if (game && game.ctx && game.ctx.back) // !!!
				return renderGame(); // !!! renderGame() function will still update, allowing users to draw paths before the simulation starts, or even while the simulation is paused.
		//}
    };
	
	// !!! Start interval (with paused set to 'true') so that we can draw paths before running the simulation.
	simulation.paused = true;
	simulation.interval = setInterval(step, 100);
	
//============================== PAN VIEWPORT FUNCTIONS (begin) ==================================
	var panmenu = $('#simulation-pan-arrow-menu');
	var viewportlabel = $('#viewport-div');
	var panviewportup = $('#simulation-pan-up');
	var panviewportdown = $('#simulation-pan-down');
	var panviewportleft = $('#simulation-pan-left');
	var panviewportright = $('#simulation-pan-right');
	var panviewportcenter = $('#simulation-pan-center');
	var movementIncrement = 10;
	
	// Stop viewport from auto-following tractor for a bit
	var pausePanTrackingTimer;
	function pausePanTracking()
	{
		if (!simulation.paused)
		{
			// Stop viewport from auto-following tractor for a bit
			panViewportToFollowTractor = false;
			clearInterval(pausePanTrackingTimer);
			pausePanTrackingTimer = setTimeout(function(){
				panViewportToFollowTractor = true;
			}, 6000);
		}
	}
	
	// Stop viewport from auto-following tractor for a bit if user is clicking something on the page (drawing a path, panning the viewport, etc)
	$("#farm-display").on('mousedown', function() {
		if (!simulation.paused) panViewportToFollowTractor = false;
	}).on('mouseup', function() {
		pausePanTracking();
	}).on('mouseout', function() {
		pausePanTracking();
	});
	
	/*
	var pausePanTrackerMouseIsDown = false;
	$(document).on('mousedown', function() {
		pausePanTrackerMouseIsDown = true;
		pausePanTracking();
	}).on('mousemove', function() {
		if (pausePanTrackerMouseIsDown) pausePanTracking();
	}).on('mouseup', function() {
		pausePanTrackerMouseIsDown = false;
	});
	*/
	
	// Center viewport pan on tractor
	function centerViewportOnTractor() {
	  if (game.width <= game.viewport.width) { // || game.width <= game.buffers.front.width // Do not pan if simulation size is smaller than the canvas screen size.
		game.viewport.x = 0;
      }
	  else if (game.viewport.target.x < game.viewport.width / 2) {
        game.viewport.x = 0;
      }
	  else if (game.viewport.target.x > game.width - game.viewport.width / 2) {
        game.viewport.x = game.width - game.viewport.width;
      }
	  else {
        game.viewport.x = game.viewport.target.x - game.viewport.width / 2;
      }
	  if (game.height <= game.viewport.height) { // Do not pan if simulation size is smaller than the canvas screen size.
		return game.viewport.y = 0;
      }
	  else if (game.viewport.target.y < game.viewport.height / 2) {
        return game.viewport.y = 0;
      }
	  else if (game.viewport.target.y > game.height - game.viewport.height / 2) {
        return game.viewport.y = game.height - game.viewport.height;
      }
	  else {
        return game.viewport.y = game.viewport.target.y - game.viewport.height / 2;
      }
	}
	
	// Pan viewport in a direction.
	function panViewportMovement(pandirection)
	{
		pausePanTracking();
		//console.log("x: " + game.viewport.x + " y: " + game.viewport.y);
	
		switch (pandirection) {
			case "up":
				if (game.viewport.y - movementIncrement >= 0)
					game.viewport.y = game.viewport.y - movementIncrement;
				else
					game.viewport.y = 0;
				break;
			case "down":
				if (game.viewport.y + movementIncrement + game.viewport.height <= game.height)
					game.viewport.y = game.viewport.y + movementIncrement;
				else
					game.viewport.y = game.height - game.viewport.height;
				break;
			case "left":
				if (game.viewport.x - movementIncrement >= 0)
					game.viewport.x = game.viewport.x - movementIncrement;
				else
					game.viewport.x = 0;
				break;
			case "right":
				if (game.viewport.x + movementIncrement + game.viewport.width <= game.width)
					game.viewport.x = game.viewport.x + movementIncrement;
				else
					game.viewport.x = game.width - game.viewport.width;
				break;
			default:
				centerViewportOnTractor();
				break;
		}
	}
	
	// Register a button to pan the viewport while clicked
	var intervalId; // Will continually pan viewport while arrow button is held down
	var intervalDelayStartId; // delay before starting loop so users can "tap" the movement arrows and move the viewport only one increment
	// Takes a button element and one of these strings as arguments: "up", "down", "left", "right"
	function addPanViewportControl(pancontrolbutton, pandirection)
	{
		pancontrolbutton.mousedown(function() {
			panViewportMovement(pandirection);
			intervalDelayStartId = setTimeout(function(){
				intervalId = setInterval(function(){
					panViewportMovement(pandirection);
				}, 100);
			}, 500);
		}).mouseup(function() {
			clearInterval(intervalId);
			clearTimeout(intervalDelayStartId);
		}).mouseout(function() {  // Cleanup in case user moves mouse OFF the button before they let go of the mouse
			clearInterval(intervalId);
			clearTimeout(intervalDelayStartId);
		});
	}
	
	// Register controls to pan the viewport
	addPanViewportControl(panviewportup, "up");
	addPanViewportControl(panviewportdown, "down");
	addPanViewportControl(panviewportleft, "left");
	addPanViewportControl(panviewportright, "right");
	addPanViewportControl(panviewportcenter, "center");

	/*
	// Stop viewport auto-follow for a bit if user is doing something in the viewport
	$('#farm-display').mousedown(function() {
		panViewportToFollowTractor = false;
		clearInterval(pausePanTrackingTimer);
	}).mouseup(function() {
		clearInterval(pausePanTrackingTimer);
		pausePanTrackingTimer = setTimeout(function(){
			panViewportToFollowTractor = true;
			//alert("true");
		}, 6000);
	}).mouseout(function() { // Cleanup in case user moves mouse OFF the page before they let go of the mouse
		clearInterval(pausePanTrackingTimer);
		pausePanTrackingTimer = setTimeout(function(){
			panViewportToFollowTractor = true;
			alert("true");
		}, 6000);
	});
	*/
//============================ PAN VIEWPORT FUNCTIONS (end) =====================================
	
//=========================== EXPAND VIEWPORT (begin) =============================
	$('#simulation-expand-viewport-button').on('click', function(event) {
		panmenu.hide();
		$('#simulation-expand-viewport-button').hide();
		$('#simulation-shrink-viewport-button').show();
		game.viewport.x = 0;
		game.viewport.y = 0;
		game.viewport.width = game.width;
		game.viewport.height = game.height;
		game.buffers.front.width = game.width;
		game.buffers.front.height = game.height;
	});
	
	$('#simulation-shrink-viewport-button').on('click', function(event) {
		panmenu.show();
		$('#simulation-expand-viewport-button').show();
		$('#simulation-shrink-viewport-button').hide();
		game.viewport.width = canvasDimensions[0];
		game.viewport.height = canvasDimensions[1];
		game.buffers.front.width = game.viewport.width;
		game.buffers.front.height = game.viewport.height;
	});
//========================== EXPAND VIEWPORT (end) ===============================

//============== CHECK IF POINT FALLS WITHIN POLYGON (begin) ================
		// SOURCE:  http://stackoverflow.com/questions/2212604/javascript-check-mouse-clicked-inside-the-circle-or-polygon
		/*
		Copyright (c) 1970-2003, Wm. Randolph Franklin
		Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
		Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimers.
		Redistributions in binary form must reproduce the above copyright notice in the documentation and/or other materials provided with the distribution.
		The name of W. Randolph Franklin may not be used to endorse or promote products derived from this Software without specific prior written permission.
		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
		*/
		/*
		nvert - Number of vertices in the polygon. Whether to repeat the first vertex at the end is discussed below.
		vertx, verty - Arrays containing the x- and y-coordinates of the polygon's vertices.
		testx, testy - X- and y-coordinate of the test point.
		*/
		function pnpoly( nvert, vertx, verty, testx, testy ) {
		var i, j, c = false;
		for( i = 0, j = nvert-1; i < nvert; j = i++ ) {
			if( ( ( verty[i] > testy ) != ( verty[j] > testy ) ) &&
				( testx < ( vertx[j] - vertx[i] ) * ( testy - verty[i] ) / ( verty[j] - verty[i] ) + vertx[i] ) ) {
					c = !c;
				}
			}
			return c;
		}
	//============== CHECK IF POINT FALLS WITHIN POLYGON (end) ================

	function PolygonGrid(field_id)	//(field, simulation)
	{
		// Gather polygon data from this field for "pnpoly" checks (below)
		var nvert = 0;
		var vertx = [];
		var verty = [];
		simulation.size.fields[field_id].bounds.forEach(function(corner) {
		//field.bounds.forEach(function(corner) {
			vertx[nvert] = corner.x * simulation.size.granularity;
			verty[nvert] = corner.y * simulation.size.granularity;
			nvert++;
		});
		
		
		// var widthOfTool = 18.288; // 60 meters
		// if (game.state == 'tilling') {
			// widthOfTool = game.plow.width;
		// } else if (game.state == 'planting') {
			// widthOfTool = game.combine.width;
		// } else if (game.state == 'harvesting') {
			// widthOfTool = game.drill.width;
		// }
		

		var stepSizeY = game.height / simulation.size.granularity; //widthOfTool;
		var stepSizeX = game.width / simulation.size.granularity;
		var testx, testy;
		
		var outputGrid = [];
		
		for (var i = 0; i < simulation.size.granularity; i++)
		{
			testx = i*stepSizeX;
			
			outputGrid[i] = [];
			
			for (var j = 0; j < simulation.size.granularity; j++)
			{
				testy = j*stepSizeY;
				
				// Check if these coordinates fall inside the polygon's boundaries
				outputGrid[i][j] = pnpoly( nvert, vertx, verty, testx, testy );
			}
		}
		
		
		// ====== Object Data ======
		this.stepx = stepSizeX;
		this.stepy = stepSizeY;
		this.grid = outputGrid;
		//this.tool = widthOfTool;
	}

	PolygonGrid.prototype.drawGrid = function() {
		var testx, testy;
		
		game.ctx.terrain.lineWidth = 0.3;
		game.ctx.front.strokeStyle = '#0000ff';
		//game.ctx.front.setLineDash([1]); // not supported in all browsers?
			
		game.ctx.front.save();
		game.ctx.front.beginPath();
		for (var j = 0; j < simulation.size.granularity-1; j++)
		{
			testy = j*this.stepy - game.viewport.y;
		
			for (var i = 0; i < simulation.size.granularity-1; i++)
			{
				testx = i*this.stepx - game.viewport.x;
				
				// Check if this grid square fits inside the field boundaries
				if (this.grid[i][j] && this.grid[i+1][j+1])
				{
					// Draw four lines to create a square grid box
				
					// left
					game.ctx.front.moveTo(testx, testy);
					game.ctx.front.lineTo(testx, testy+this.stepy);
					
					// top
					game.ctx.front.moveTo(testx, testy);
					game.ctx.front.lineTo(testx+this.stepx, testy);
					
					// bottom
					game.ctx.front.moveTo(testx, testy+this.stepy);
					game.ctx.front.lineTo(testx+this.stepx, testy+this.stepy);
					
					// right
					game.ctx.front.moveTo(testx+this.stepx, testy);
					game.ctx.front.lineTo(testx+this.stepx, testy+this.stepy);
				}
			}
		}
		game.ctx.front.stroke();
		game.ctx.front.closePath();
		game.ctx.front.restore();
	};
	
	PolygonGrid.prototype.drawPath = function() {
		game.path = [];
		
		// !!! Use width of implement to determine spacing between rows (instead of just using granularity)!
		// ??? Also need to make both the visually tilling/etc and the FUNCTIONAL tilling/etc be accurate to scale?
		
		
		var widthOfTool = 18.288; // 60 meters
		if (game.state == 'tilling') {
			widthOfTool = game.plow.width;
		} else if (game.state == 'planting') {
			widthOfTool = game.combine.width;
		} else if (game.state == 'harvesting') {
			widthOfTool = game.drill.width;
		}
		this.tool = widthOfTool;
		
		
		var testx, testy;
		
		game.ctx.terrain.lineWidth = 0.3;
		game.ctx.front.strokeStyle = '#0000ff';
		//game.ctx.front.setLineDash([1]); // not supported in all browsers?
			
		var lastStep = {
			wasOutside: true,
			x: 0,
			y: 0
		};
		
		// Get start and end y-indices of the sweep.
		var yStartIndex = (Math.floor((widthOfTool/2)/this.stepy) + 1);// * this.stepy;
		var yEndIndex = (yStartIndex - 1);
		if (yEndIndex < 0) yEndIndex = 0;
		yEndIndex = simulation.size.granularity - yEndIndex;
		//console.log(yStartIndex);
		
		var goLeftToRight = true;
		for (var y = yStartIndex; y < yEndIndex; y++)
		{		
			//console.log(y % widthOfTool);
			if (y % (widthOfTool/this.stepy) <= 1) // Width of implement
			{
				if (goLeftToRight)
				{
					for (var x = 0; x < simulation.size.granularity-1; x++)
					{
						//if (this.grid[x][y-(y % this.stepy)]) // ???
						lastStep = this.drawStep(x, y, lastStep);
					}
				}
				else
				{
					for (var x = simulation.size.granularity-1; x > 1; x--)
					{
						//if (this.grid[x][y-(y % this.stepy)]) // ???
						lastStep = this.drawStep(x, y, lastStep);
					}
				}
				goLeftToRight = !goLeftToRight;
			}
		}
	};
	
	PolygonGrid.prototype.drawStep = function(x, y, lastStep)
	{
		testx = x*this.stepx;
		//testy = y*this.stepy - ((y*this.stepy) % this.tool);
		testy = y*this.stepy - ((y*this.stepy) % this.tool) - this.tool/2;

		// Check if this grid square fits inside the field boundaries
		if (this.grid[x][y])
		{
			console.log("stroke at y: " + testy);
		
			// Travel to start of next sweep, but do NOT have tiller down until we get there
			if (lastStep.wasOutside == true)
			{
				lastStep.wasOutside = false;
				game.path.push({
					x: testx,
					y: testy,
					noaction: true
				});
			}
			
			game.path.push({
				x: testx,
				y: testy
			});
		}
		else
		{
			// Travel to start of next sweep, but do NOT have tiller down until we get there
			if (lastStep.wasOutside == false)
			{
				lastStep.wasOutside = true;
				game.path.push({
					x: lastStep.x,
					y: lastStep.y,
					noaction: true
				});
			}
		}
		
		lastStep.x = testx;
		lastStep.y = testy;
		//console.log(thisStep);
		
		return lastStep;
	};
	

  } // end if
}); //end jQuery