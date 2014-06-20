// Global simulation weather object
//=============================================================
var weather = {
  rainfall: 0,			// in mm
  snowfall: 0,			// in mm
  solar_radiation: 0,
  day_length: 0,
  average_temperature: 0,	// in degrees C
  low_temperature: 0,		// in degrees C
  high_temperature: 0,		// in degrees C
  wind_speed: 0,		// in m/s
  wind_direction: 0,		// in compass degrees
  relative_humidity: 0,         // % saturation
};


//
// INTERPRETER DEFINITIONS
// The following function sets up the interpreter environment
// with the variables associated with weather simulation models
// as part of a custom API supplied to the interpreter
//============================================================

function initWeatherSystem(interpreter, scope) {

  // Parcipitation values (stored in mm)
  interpreter.setProperty(scope, 'rainfall', interpreter.createPrimitive(weather.rainfall));
  interpreter.setProperty(scope, 'snowfall', interpreter.createPrimitive(weather.snowfall));

  // Sets the simulation's rainfall
  wrapper = function(num) {
    weather.rainfall = num ? parseFloat(num) : 0;
  };
  interpreter.setProperty(scope, 'set_rainfall', interpreter.createNativeFunction(wrapper));

  // Sets the simulation's snowfall
  wrapper = function(num) {
    weather.snowfall = num ? parseFloat(num) : 0;
  };
  interpreter.setProperty(scope, 'set_snowfall', interpreter.createNativeFunction(wrapper));

  // Temperature variables (stored in degrees C)
  interpreter.setProperty(scope, 'average_temp', interpreter.createPrimitive(weather.average_temperature));
  interpreter.setProperty(scope, 'low_temp', interpreter.createPrimitive(weather.low_temperature));
  interpreter.setProperty(scope, 'high_temp', interpreter.createPrimitive(weather.high_temperature));

  // Sets the simulation's average temperature
  wrapper = function(num) {
    weather.average_temperature = num ? parseFloat(num) : 0;
  };
  interpreter.setProperty(scope, 'set_average_temperature', interpreter.createNativeFunction(wrapper));

  // Sets the simulation's high temperature
  wrapper = function(num) {
    weather.high_temperature = num ? parseFloat(num) : 0;
  };
  interpreter.setProperty(scope, 'set_high_temperature', interpreter.createNativeFunction(wrapper));

  // Sets the simulation's low temperature
  wrapper = function(num) {
    weather.low_temperature = num ? parseFloat(num) : 0;
  };
  interpreter.setProperty(scope, 'set_low_temperature', interpreter.createNativeFunction(wrapper));

  // Wind speed and direction variables (stored in m/s and compass degrees)
  interpreter.setProperty(scope, 'wind_speed', interpreter.createPrimitive(weather.wind_speed));
  interpreter.setProperty(scope, 'wind_direction', interpreter.createPrimitive(weather.wind_direction));

  // Sets the simulation's wind speed
  wrapper = function(num) {
    weather.wind_speed = num ? parseFloat(num) : 0;
  };
  interpreter.setProperty(scope, 'set_wind_speed', interpreter.createNativeFunction(wrapper));

  // Sets the simulation's wind direction
  wrapper = function(num) {
    weather.wind_direction = num ? parseFloat(num) : 0;
  };
  interpreter.setProperty(scope, 'set_wind_direction', interpreter.createNativeFunction(wrapper));

  // Relative humidity variable
  interpreter.setProperty(scope, 'relative_humidity', interpreter.createPrimitive(weather.relative_humidity));
  
  // Sets the simulation's relative humidity
  wrapper = function(num) {
    weather.relative_humidity = num ? parseFloat(num) : 0;
  };
  interpreter.setProperty(scope, 'set_relative_humidity', interpreter.createNativeFunction(wrapper));
}



//
// BLOCKLY BLOCK DEFINITIONS
// The following defines the look and JavaScript code generated
// by weather-related blocks
//=============================================================

//
// Precipitation Blocks
// precipitation blocks are stored in mm; the blocks convert
// other values.
//-------------------------------------------------------------

Blockly.Blocks['weather_set_precipitation'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Set");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["rain", "RAIN"], ["snow", "SNOW"]]), "FORM");
    this.appendDummyInput()
        .appendField("to");
    this.appendValueInput("PRECIPITATION")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MM"], ["inches", "INCHES"]]), "MEASURE");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_set_precipitation'] = function(block) {
  var precipitation = Blockly.JavaScript.valueToCode(block, 'PRECIPITATION', Blockly.JavaScript.ORDER_ATOMIC);
  var measure = block.getFieldValue('MEASURE');
  var form = block.getFieldValue('FORM');
  
  // Convert to mm, if needed
  if(measure == 'INCHES') {
    precipitation = '(' + precipitation + ' * 25.4)';
  }

  // Store in the appropriate variable
  switch(form) {
    case 'RAIN':
      return 'rainfall = ' + precipitation + ';\nset_rainfall(rainfall);\n';
    case 'SNOW':
      return 'snowfall = ' + precipitation + ';\nset_snowfall(snowfall);\n';
  }
  return '';
};

Blockly.Blocks['weather_get_precipitation'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Get");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["rain", "RAIN"], ["snow", "SNOW"]]), "FORM");
    this.appendDummyInput()
        .appendField("in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["mm", "MM"], ["inches", "INCHES"]]), "MEASURE");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_get_precipitation'] = function(block) {
  var measure = block.getFieldValue('MEASURE');
  var form = block.getFieldValue('FORM');
  var code = '0';

  // Retrieve from the appropriate variable
  switch(form) {
    case 'RAIN':
      code = 'rainfall';
      break;
    case 'SNOW':
      code = 'snowfall';
      break;
  }

  // Convert to mm, if needed
  if(measure == 'INCHES') {
    code = '(' + code + ' / 25.4)';
  }

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


//
// Temperature Blocks
// temperatures are stored in degrees Celsius; the blocks 
// convert other values.
//-------------------------------------------------------------

Blockly.Blocks['weather_set_temperature'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Set");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["average", "AVERAGE"], ["high", "HIGH"], ["low", "LOW"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("temperature to degrees");
    this.appendValueInput("TEMP")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["Celsius", "DEGREES_C"],["Fahrenheit", "DEGREES_F"]]), "MEASURE");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Set the air temperature');
  }
};

Blockly.JavaScript['weather_set_temperature'] = function(block) {
  var temperature = Blockly.JavaScript.valueToCode(block, 'TEMP', Blockly.JavaScript.ORDER_ATOMIC);
  var measure = block.getFieldValue('MEASURE');
  var category = block.getFieldValue('CATEGORY');

  // Convert to Degrees C, if needed
  if(measure == 'DEGREES_F') {
    temperature = '((' + temperature + ' - 32) * (5/9))';
  }

  // Store in the appropriate variable
  switch(category) {
    case 'AVERAGE':
      return 'average_temp = ' + temperature + ';\nset_average_temperature(average_temp);\n';
    case 'HIGH':
      return 'high_temp = ' + temperature + ';\nset_high_temperature(high_temp);\n';
    case 'LOW': 
      return 'low_temp = ' + temperature + ';\nset_low_temperature(low_temp);\n';
  }

  return '';
}

Blockly.Blocks['weather_get_temperature'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["average", "AVERAGE"], ["high", "HIGH"], ["low", "LOW"]]), "CATEGORY");
    this.appendDummyInput()
        .appendField("temperature in degrees");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["Fahrenheit", "DEGREES_F"], ["Celsius", "DEGREES_C"]]), "MEASURE");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('Get the air temperature');
  }
};

Blockly.JavaScript['weather_get_temperature'] = function(block) {
  var measure = block.getFieldValue('MEASURE');
  var category = block.getFieldValue('CATEGORY');
  var code = '0';
  
  // Retrieve from the appropriate variable
  switch(category) {
    case 'AVERAGE':
      code = 'average_temp';
      break;
    case 'HIGH':
      code = 'high_temp';
      break;
    case 'LOW':
      code = 'low_temp';
      break;
  }

  // Convert to degrees F, if needed
  if(measure == 'DEGREES_F') {
    code = '(' + code + ' * 9/5 + 32)';
  }
  
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


//
// Wind Blocks
// wind speed is stored in m/s and wind direction in compass degrees;
// blocks convert other values.
//-------------------------------------------------------------

Blockly.Blocks['weather_set_wind_speed'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Set wind speed");
    this.appendValueInput("SPEED")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["m/s", "METERS_PER_SECOND"], ["miles/hr", "MILES_PER_HOUR"]]), "MEASURE");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_set_wind_speed'] = function(block) {
  var speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_ATOMIC);
  var measure = block.getFieldValue('MEASURE');
  
  // convert to m/s, if neccessary
  if(measure == 'MILES_PER_HOUR') {
    speed = '(' + speed + ' * 0.44704)';
  }

  // store in wind_speed
  return 'wind_speed = ' + speed + ';\nset_wind_speed(wind_speed);\n';
};

Blockly.Blocks['weather_get_wind_speed'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Wind speed in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["m/s", "METERS_PER_SECOND"], ["miles/hr", "MILES_PER_HOUR"]]), "MEASURE");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_get_wind_speed'] = function(block) {
  var measure = block.getFieldValue('MEASURE');
  var code = 'wind_speed';

  // convert to miles/hour, if necessary
  if(measure == 'MILES_PER_HOUR') {
    code = '(' + code + ' / 0.44704)';
  }

  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['weather_set_wind_direction'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Set wind direction to");
    this.appendValueInput("DIRECTION")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("degrees");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_set_wind_direction'] = function(block) {
  var direction = Blockly.JavaScript.valueToCode(block, 'DIRECTION', Blockly.JavaScript.ORDER_ATOMIC);
  return 'wind_direction = ' + direction + ';\nset_wind_direction(wind_direction);\n';
}

Blockly.Blocks['weather_get_wind_direction'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Wind direction in degrees");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_get_wind_direction'] = function(block) {
  return ['wind_direction', Blockly.JavaScript.ORDER_ATOMIC];
};


//
// Humidity Blocks
// humidity is stored as a %
//-------------------------------------------------------------

Blockly.Blocks['weather_set_relative_humidity'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Set % relative humidity to");
    this.appendValueInput("RELATIVE_HUMIDITY")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("%");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_set_relative_humidity'] = function(block) {
  var humidity = Blockly.JavaScript.valueToCode(block, 'RELATIVE_HUMIDITY', Blockly.JavaScript.ORDER_ATOMIC);
  return 'relative_humidity = ' + humidity + ';\nset_relative_humidity(relative_humidity);\n';
}

Blockly.Blocks['weather_get_relative_humidity'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("get % relative humidity");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
}

Blockly.JavaScript['weather_get_relative_humidity'] = function(block) {
  return ['relative_humidity', Blockly.JavaScript.ORDER_NONE];
};




var dailyWeather = []

// Attribute declaration
var WEATHER_ATTRIBUTE_DEFAULTS = {
    'precipitation' : 0,
    'highTemperature' : 0,
    'lowTemperature' : 0,
    'solarRadiation' : 0,
    'relativeHumidity' : 0,
    'windSpeed' : 0,
    'windDirection' : 0
};

var Weather = function(attributes) {
    var myself = this;

    if(attributes === undefined)
         attributes = WEATHER_ATTRIBUTE_DEFAULTS

    // Copy the supplied attributes
    this.attributes = {}
    for (var k in attributes) {
        if (attributes.hasOwnProperty(k)) {
            this.attributes[k] = attributes[k];
        }
    }

};

// Set up attribute getters and setters
for (var k in WEATHER_ATTRIBUTE_DEFAULTS) {
    Weather.prototype[k] = function(value) {
        if(value === undefined) {
            return this.attributes[k];
        } else {
            this.attributes[k] = value;
        }
     }
};

Blockly.JavaScript['set_weather'] = function(block) {
  var value_precipitation = Blockly.JavaScript.valueToCode(block, 'PRECIPITATION', Blockly.JavaScript.ORDER_ATOMIC);
  var value_high_temperature = Blockly.JavaScript.valueToCode(block, 'HIGH TEMPEARATURE', Blockly.JavaScript.ORDER_ATOMIC);
  var value_low_temperature = Blockly.JavaScript.valueToCode(block, 'LOW TEMPERATURE', Blockly.JavaScript.ORDER_ATOMIC);
  var value_solar_radiation = Blockly.JavaScript.valueToCode(block, 'SOLAR RADIATION', Blockly.JavaScript.ORDER_ATOMIC);
  var value_relative_humidity = Blockly.JavaScript.valueToCode(block, 'RELATIVE HUMIDITY', Blockly.JavaScript.ORDER_ATOMIC);
  var value_wind_speed = Blockly.JavaScript.valueToCode(block, 'WIND SPEED', Blockly.JavaScript.ORDER_ATOMIC);
  var value_wind_direction = Blockly.JavaScript.valueToCode(block, 'WIND DIRECTION', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  dailyWeather.push( new Weather({
    precipitation: value_precipitation, 
    highTemperature: value_high_temperature, 
    lowTemperature: value_low_temperature, 
    solarRadiation: value_solar_radiation, 
    relativeHumidity: value_relative_humidity, 
    windSpeed: value_wind_speed, 
    windDirection: value_wind_direction 
  }));
};

Blockly.Blocks['set_weather'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(210);
    this.appendDummyInput()
        .appendField("Set Today's Weather:");
    this.appendValueInput("PRECIPITATION")
        .setCheck("Number")
        .appendField("Precipitation");
    this.appendValueInput("HIGH TEMPERATURE")
        .setCheck("Number")
        .appendField("High Temperature");
    this.appendValueInput("LOW TEMPERATURE")
        .setCheck("Number")
        .appendField("Low Temperature");
    this.appendValueInput("SOLAR RADIATION")
        .setCheck("Number")
        .appendField("Solar Radiation");
    this.appendValueInput("RELATIVE HUMIDITY")
        .setCheck("Number")
        .appendField("Relative Humidity");
    this.appendValueInput("WIND SPEED")
        .setCheck("Number")
        .appendField("Wind Speed");
    this.appendValueInput("WIND DIRECTION")
        .setCheck("Number")
        .appendField("Wind Direction");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

