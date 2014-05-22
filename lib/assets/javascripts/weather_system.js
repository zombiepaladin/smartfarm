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

