/*
  weather_blocks.js
   
  This file defines a set of Blockly blocks for manipulating a simulation's weather
  The weather-related data used by the simulation is:
  
  VARIABLE            UNIT
  --------------      -----
  rainfall            mm
  snowfall            mm
  solar_radiation     J/m*m
  day_length          ?
  average_temperature degrees C
  low_temperature     degrees C
  high_temperature    degrees C
  wind_speed          m/s
  wind_direction      in compass degrees
  dew_point           degrees C
  relative_humidity   % saturation
  
  Getter and setter functions need to be defined for each of of these for generated
  code to work, i.e.:
  
  var rainfall = 0;
  
  function get_rainfall() {
    return rainfall;
  }
  
  function set_rainfall(val) {
    rainfall = val;
  }

*/


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
      return 'set_rainfall(' + precipitation + ');\n';
    case 'SNOW':
      return 'set_snowfall(' + precipitation + ');\n';
  }
  return '';
};

Blockly.Blocks['weather_get_precipitation'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
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
      code = 'get_rainfall()';
      break;
    case 'SNOW':
      code = 'get_snowfall()';
      break;
  }
  // Convert to mm, if needed
  if(measure == 'INCHES') {
    code = '(' + code + ' / 25.4)';
  }
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


//
// Solar Radiation Blocks
// solar radiation is stored in Joules per square meter
// the blocks convert other values
//-------------------------------------------------------------

Blockly.Blocks['weather_set_solar_radiation'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Set solar radiation to");
    this.appendValueInput("RADIATION")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["Joules/m²", "JOULES_PER_SQUARE_METER"], ["Langleys", "LANGLEY"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_set_solar_radiation'] = function(block) {
  var radiation = Blockly.JavaScript.valueToCode(block, 'RADIATION', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');
  // Convert if necessary
  if(unit == 'LANGLEY') {
    radiation = '(' + radiation + ' * 41840)';
  }
  return 'set_solar_radiation(' + radiation + ');\n';
};

Blockly.Blocks['weather_get_solar_radiation'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Solar radiation in");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["Joules/m²", "JOULES_PER_SQUARE_METER"], ["Langleys", "LANGLEY"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_get_solar_radiation'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  var code = 'get_solar_radiation()';
  // Change units if necessary
  if(unit == 'LANGLEY') {
    code = '(' + code + ' / 41840)';
  }
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
      return 'set_average_temperature(' + temperature + ');\n';
    case 'HIGH':
      return 'set_high_temperature(' + temperature + ');\n';
    case 'LOW': 
      return 'set_low_temperature(' + temperature + ');\n';
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
      code = 'get_average_temperature()';
      break;
    case 'HIGH':
      code = 'get_high_temperature()';
      break;
    case 'LOW':
      code = 'get_low_temperature()';
      break;
  }
  // Convert to degrees F, if needed
  if(measure == 'DEGREES_F') {
    code = '(' + code + ' * 9/5 + 32)';
  }
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
  // store wind_speed
  return 'set_wind_speed(' + speed + ');\n';
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
  var code = 'get_wind_speed()';
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
  return 'set_wind_direction(' + direction + ');\n';
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
  return ['get_wind_direction()', Blockly.JavaScript.ORDER_ATOMIC];
};


//
//Dew Point Blocks
//dew point is stored as degrees C
//------------------------------------------------------------

Blockly.Blocks['weather_set_dew_point'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Set dew point to");
    this.appendValueInput("TEMP")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("degrees");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["Celsius", "DEGREES_C"], ["Fahrenheight", "DEGREES_F"]]), "UNIT");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_set_dew_point'] = function(block) {
  var temperature = Blockly.JavaScript.valueToCode(block, 'TEMP', Blockly.JavaScript.ORDER_ATOMIC);
  var unit = block.getFieldValue('UNIT');

  // Convert to Degrees C, if needed
  if(unit == 'DEGREES_F') {
    temperature = '((' + temperature + ' - 32) * (5/9))';
  }
  return 'set_dew_point(' + temperature + ');\n';
};

Blockly.Blocks['weather_get_dew_point'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Dew point in degrees");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["Celsius", "DEGREES_C"], ["Fahrenheight", "DEGREES_F"]]), "UNIT");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_get_dew_point'] = function(block) {
  var unit = block.getFieldValue('UNIT');
  code = 'get_dew_point()';

  // Convert to degrees F, if needed
  if(unit == 'DEGREES_F') {
    code = '(' + code + ' * 9/5 + 32)';
  }
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
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
  return 'set_relative_humidity(' + humidity + ');\n';
};

Blockly.Blocks['weather_get_relative_humidity'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendField("% relative humidity");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setTooltip('');
  }
};

Blockly.JavaScript['weather_get_relative_humidity'] = function(block) {
  return ['get_relative_humidity()', Blockly.JavaScript.ORDER_ATOMIC];
};
